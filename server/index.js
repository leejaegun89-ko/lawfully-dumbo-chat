const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
// Try to load .env file, but don't fail if it doesn't exist
try {
  require('dotenv').config({ path: '../.env' });
} catch (error) {
  console.log('No .env file found, using default configuration');
}

const app = express();
const PORT = 5001; // Force port 5001

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

// In-memory storage (in production, use a database)
let uploadedDocuments = [];
let chatSessions = {};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Logo upload endpoint
const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, 'logo' + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

app.post('/api/logo', logoUpload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the static URL for the uploaded logo
  const logoUrl = `/uploads/${req.file.filename}`;
  res.json({ url: logoUrl });
});

// Serve uploads statically (no cache)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
}));

// Parse document content based on file type
async function parseDocument(filePath, fileType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    switch (fileType) {
      case '.pdf':
        try {
          const pdfData = await pdf(fileBuffer);
          return pdfData.text || 'PDF content could not be extracted';
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
        }
      
      case '.docx':
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          return result.value || 'DOCX content could not be extracted';
        } catch (mammothError) {
          console.error('DOCX parsing error:', mammothError);
          throw new Error('Failed to parse DOCX file. Please ensure it is a valid DOCX document.');
        }
      
      case '.doc':
        // DOC files are not supported by mammoth, return error message
        throw new Error('DOC files are not supported. Please convert to DOCX or PDF format.');
      
      case '.txt':
        try {
          const content = fileBuffer.toString('utf-8');
          return content || 'TXT file appears to be empty';
        } catch (txtError) {
          console.error('TXT parsing error:', txtError);
          throw new Error('Failed to read TXT file.');
        }
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw error;
  }
}

// Routes

// Upload documents
app.post('/api/upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];
    const failedFiles = [];
    
    for (const file of req.files) {
      try {
        const fileType = path.extname(file.originalname).toLowerCase();
        console.log(`Processing file: ${file.originalname} (${fileType})`);
        
        const content = await parseDocument(file.path, fileType);
        
        // Check if content is meaningful
        if (!content || content.trim().length === 0) {
          throw new Error('File appears to be empty or contains no readable text');
        }
        
        const document = {
          id: uuidv4(),
          filename: file.originalname,
          filepath: file.path,
          content: content,
          uploadTime: new Date().toISOString(),
          fileType: fileType
        };
        
        uploadedDocuments.push(document);
        uploadedFiles.push({
          id: document.id,
          filename: document.filename,
          uploadTime: document.uploadTime,
          fileType: document.fileType
        });
        
        console.log(`Successfully processed: ${file.originalname}`);
        
      } catch (parseError) {
        console.error(`Failed to process ${file.originalname}:`, parseError.message);
        failedFiles.push({
          filename: file.originalname,
          error: parseError.message
        });
        
        // Clean up the uploaded file if parsing failed
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Failed to delete file after parsing error:', unlinkError);
        }
      }
    }

    const response = {
      message: uploadedFiles.length > 0 ? 'Files processed successfully' : 'No files were successfully processed',
      files: uploadedFiles,
      failedFiles: failedFiles,
      totalDocuments: uploadedDocuments.length,
      successCount: uploadedFiles.length,
      failureCount: failedFiles.length
    };

    // If all files failed, return 400 status
    if (uploadedFiles.length === 0 && failedFiles.length > 0) {
      return res.status(400).json(response);
    }

    res.json(response);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files', details: error.message });
  }
});

// Get uploaded documents list
app.get('/api/documents', (req, res) => {
  const documentsList = uploadedDocuments.map(doc => ({
    id: doc.id,
    filename: doc.filename,
    uploadTime: doc.uploadTime,
    fileType: doc.fileType
  }));
  
  res.json({ documents: documentsList });
});

// Delete a document by ID
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const docIndex = uploadedDocuments.findIndex(doc => doc.id === id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const [removedDoc] = uploadedDocuments.splice(docIndex, 1);
  // Delete the file from disk
  try {
    if (removedDoc.filepath && fs.existsSync(removedDoc.filepath)) {
      fs.unlinkSync(removedDoc.filepath);
    }
  } catch (err) {
    console.error('Failed to delete file from disk:', err);
    // Continue even if file deletion fails
  }
  res.json({ message: 'Document deleted', id });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize session if it doesn't exist
    if (!chatSessions[sessionId]) {
      chatSessions[sessionId] = [];
    }

    // Prepare context from uploaded documents
    const documentContext = uploadedDocuments
      .map(doc => `Document: ${doc.filename}\nContent: ${doc.content}`)
      .join('\n\n');

    // Create system message with document context
    const systemMessage = {
      role: 'system',
      content: `You are Dumbo, a helpful AI assistant. You have access to the following documents that have been uploaded by the admin. Use this information to answer questions accurately and helpfully. If the information is not available in the documents, say so clearly.

Documents:
${documentContext}

Please provide helpful, accurate responses based on the document content.`
    };

    // Prepare conversation history
    const conversationHistory = chatSessions[sessionId].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    const userMessage = {
      role: 'user',
      content: message
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...conversationHistory, userMessage],
      max_tokens: 1000,
      temperature: 0.7
    });

    const assistantResponse = completion.choices[0].message.content;

    // Store messages in session
    chatSessions[sessionId].push(userMessage);
    chatSessions[sessionId].push({
      role: 'assistant',
      content: assistantResponse
    });

    // Keep only last 20 messages to prevent context overflow
    if (chatSessions[sessionId].length > 20) {
      chatSessions[sessionId] = chatSessions[sessionId].slice(-20);
    }

    res.json({
      response: assistantResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing chat message' });
  }
});

// Generate shareable URL
app.post('/api/share', (req, res) => {
  const shareId = uuidv4().substring(0, 8);
  res.json({ 
    shareId: shareId,
    shareUrl: `/chat/${shareId}`
  });
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin interface: http://localhost:${PORT}`);
  console.log(`Make sure to set OPENAI_API_KEY in your environment variables`);
}); 