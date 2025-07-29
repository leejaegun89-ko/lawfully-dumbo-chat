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
const PORT = process.env.PORT || 5001;

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

// In-memory file storage for Vercel deployment
let inMemoryFiles = new Map();
let inMemoryLogo = null;

// Logo file path for Vercel deployment
const LOGO_FILE = path.join(__dirname, 'logo.json');

// Configure multer for file uploads (memory storage for Vercel)
const upload = multer({
  storage: multer.memoryStorage(),
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

// Logo upload endpoint (memory storage for Vercel)
const logoUpload = multer({
  storage: multer.memoryStorage(),
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

// Get current logo (file-based for Vercel)
app.get('/api/logo', (req, res) => {
  try {
    // Try to load from file first
    if (fs.existsSync(LOGO_FILE)) {
      const logoData = JSON.parse(fs.readFileSync(LOGO_FILE, 'utf-8'));
      res.json({ logoUrl: logoData.logoUrl });
    } else if (inMemoryLogo) {
      // Fallback to memory if file doesn't exist
      res.json({ logoUrl: inMemoryLogo });
    } else {
      res.json({ logoUrl: null });
    }
  } catch (error) {
    console.error('Error getting logo:', error);
    res.status(500).json({ error: 'Failed to get logo' });
  }
});

app.post('/api/logo', logoUpload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log(`Logo uploaded: ${req.file.originalname}`);
  
  try {
    // Convert file buffer to base64 for file storage
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const logoUrl = `data:${mimeType};base64,${base64Data}`;
    
    // Store in memory and file
    inMemoryLogo = logoUrl;
    
    // Save to file for persistence
    const logoData = {
      logoUrl: logoUrl,
      uploadedAt: new Date().toISOString(),
      filename: req.file.originalname
    };
    fs.writeFileSync(LOGO_FILE, JSON.stringify(logoData, null, 2), 'utf-8');
    
    console.log(`Logo stored in memory and file: ${req.file.originalname}`);
    res.json({ logoUrl: logoUrl });
  } catch (error) {
    console.error('Error processing logo:', error);
    res.status(500).json({ error: 'Failed to process logo' });
  }
});

// Note: Static file serving removed for Vercel deployment
// Files are now stored in memory as base64 data URLs

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

// Parse document content from buffer (for Vercel deployment)
async function parseDocumentFromBuffer(fileBuffer, fileType) {
  try {
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
    console.error('Error parsing document from buffer:', error);
    throw error;
  }
}

// Routes

// Upload documents (memory-based for Vercel)
app.post('/api/upload', upload.array('file', 10), async (req, res) => {
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
        
        // Parse document from buffer instead of file path
        const content = await parseDocumentFromBuffer(file.buffer, fileType);
        
        // Check if content is meaningful
        if (!content || content.trim().length === 0) {
          throw new Error('File appears to be empty or contains no readable text');
        }
        
        const document = {
          id: uuidv4(),
          filename: file.originalname,
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

// Delete a document by ID (memory-based for Vercel)
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const docIndex = uploadedDocuments.findIndex(doc => doc.id === id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  uploadedDocuments.splice(docIndex, 1);
  res.json({ message: 'Document deleted', id });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;
    
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

    // Create system message based on context
    let systemMessageContent = `You are Dumbo, a helpful AI assistant specializing in immigration law and general legal assistance.`;
    
    // Add document context to all responses if documents are available
    if (documentContext && documentContext.trim().length > 0) {
      systemMessageContent += `\n\nYou have access to the following uploaded documents and should use them to answer questions accurately and helpfully. 
      Do not mention the "documents" as your source. If you cannot find the answer, respond with a helpful message, and if you say contact support, provide the support email: help@lawfully.com. 
      Never say that the information is unavailable or not included in the "documents".
      When answering, never add **.

Documents:
${documentContext}

Please provide helpful, accurate responses based on the document content.`;
    }

    if (context && context.tab === 'general' && context.caseType) {
      // Check if this is a DOL-related case type
      const dolKeywords = ['PERM', 'PWD', 'LCA', 'ETA-', 'DOL', 'Prevailing Wage', 'Labor Condition', 'Audit', 'Recruitment', 'BALCA', 'OFLC', 'NPWC', 'CNPC', 'ANPC', 'iCERT', 'PAF'];
      const isDOLCase = dolKeywords.some(keyword => context.caseType.includes(keyword));
      
      if (isDOLCase) {
        // DOL-specific context
        systemMessageContent += `\n\nYou are currently helping with: ${context.caseType}
        
You are an expert immigration attorney with deep knowledge of U.S. Department of Labor (DOL) processes and employment-based immigration. 

When the user asks about ${context.caseType}, provide them with clickable button options for different aspects of the journey. You MUST format the response exactly like this:

1. **Case Overview** - Basic information and eligibility
2. **Processing Time & Timeline** - Overall timeframes and expectations
3. **Step-by-Step Process** - Detailed process breakdown
4. **Required Documents** - Essential documents and forms needed
5. **Common Issues / Red Flags** - Problems to watch out for
6. **Unexpected Issues & Troubleshooting** - How to handle problems
7. **Compliance & Legal Requirements** - DOL compliance obligations
8. **Costs & Financial Considerations** - Financial aspects and fees
9. **Additional Considerations & Tips** - Important tips and strategies
10. **Post-Approval** - What happens after approval

IMPORTANT: Always use the exact format with numbers, double asterisks, and dashes as shown above. Do not change the formatting or add extra text before or after the numbered list.`;
      } else {
        // Regular immigration case type context
        systemMessageContent += `\n\nYou are currently helping with: ${context.caseType}
        
You are an expert immigration attorney with deep knowledge of U.S. immigration law.

When the user asks about ${context.caseType}, provide them with clickable button options for different aspects of the journey. You MUST format the response exactly like this:

1. **Case Overview** - Basic information and eligibility
2. **Processing Time & Timeline** - Overall timeframes and expectations
3. **Step-by-Step Process** - Detailed process breakdown
4. **Required Documents** - Essential documents and forms needed
5. **Common Issues / Red Flags** - Problems to watch out for
6. **Unexpected Issues & Troubleshooting** - How to handle problems
7. **Compliance & Legal Requirements** - Legal obligations and requirements
8. **Costs & Financial Considerations** - Financial aspects and fees
9. **Additional Considerations & Tips** - Important tips and strategies
10. **Post-Approval** - What happens after approval

IMPORTANT: Always use the exact format with numbers, double asterisks, and dashes as shown above. Do not change the formatting or add extra text before or after the numbered list.`;
      }
    } else if (context && context.tab === 'beyond' && context.domain) {
      // Legal domain specific context
      systemMessageContent += `\n\nYou are currently helping with: ${context.domain}
      
You are an expert attorney with deep knowledge of ${context.domain}.

When the user asks about ${context.domain}, provide them with clickable button options for different aspects of the legal process. You MUST format the response exactly like this:

1. **Case Overview** - Basic information and legal framework
2. **Processing Time & Timeline** - Overall timeframes and court procedures
3. **Step-by-Step Process** - Detailed legal process breakdown
4. **Required Documents** - Essential documentation and evidence
5. **Common Issues / Red Flags** - Legal obstacles and challenges
6. **Unexpected Issues & Troubleshooting** - How to handle legal problems
7. **Compliance & Legal Requirements** - Legal obligations and requirements
8. **Costs & Financial Considerations** - Legal fees and financial aspects
9. **Additional Considerations & Tips** - Strategic considerations and tips
10. **Post-Resolution** - What happens after case resolution

IMPORTANT: Always use the exact format with numbers, double asterisks, and dashes as shown above. Do not change the formatting or add extra text before or after the numbered list.`;
    } else if (context && context.tab === 'beyond') {
      // Beyond immigration context (general)
      systemMessageContent += `\n\nYou are helping with questions beyond immigration law. This could include:
- General legal questions
- Business law
- Family law
- Criminal law
- Civil law
- International law
- And other legal topics

Provide helpful, accurate information while making it clear that you are not providing legal representation.`;
    }

    const systemMessage = {
      role: 'system',
      content: systemMessageContent
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

    // Check if this is a button click (specific option request)
    const isButtonClick = [
      'Case Overview', 'Processing Time & Timeline', 'Step-by-Step Process', 
      'Required Documents', 'Common Issues / Red Flags', 'Unexpected Issues & Troubleshooting', 
      'Compliance & Legal Requirements', 'Costs & Financial Considerations', 
      'Additional Considerations & Tips', 'Post-Approval', 'Post-Resolution'
    ].some(option => message.includes(option));

    let assistantResponse;
    
    if (isButtonClick) {
      // Provide simple, concise response for specific button option
      let detailedPrompt = '';
      
      if (message.includes('Case Overview')) {
        detailedPrompt = `Provide a simple, brief overview of ${context?.caseType || context?.domain || 'this case'}. Include basic eligibility requirements and key points. Keep it concise and easy to understand.`;
      } else if (message.includes('Processing Time & Timeline')) {
        detailedPrompt = `Provide simple, clear information about processing time for ${context?.caseType || context?.domain || 'this case'}. Include overall timeline and major milestones. Keep it brief and practical.`;
      } else if (message.includes('Step-by-Step Process')) {
        detailedPrompt = `Provide a simple, clear step-by-step process for ${context?.caseType || context?.domain || 'this case'}. Break down into 3-5 main steps. Keep it concise and actionable.`;
      } else if (message.includes('Required Documents')) {
        detailedPrompt = `List the essential documents needed for ${context?.caseType || context?.domain || 'this case'}. Keep it simple - just the most important documents.`;
      } else if (message.includes('Common Issues / Red Flags')) {
        detailedPrompt = `List the most common problems and red flags for ${context?.caseType || context?.domain || 'this case'}. Keep it simple - just the key issues to watch out for.`;
      } else if (message.includes('Unexpected Issues & Troubleshooting')) {
        detailedPrompt = `Provide simple guidance on what to do when problems arise with ${context?.caseType || context?.domain || 'this case'}. Keep it practical and actionable.`;
      } else if (message.includes('Compliance & Legal Requirements')) {
        detailedPrompt = `Explain the key compliance requirements for ${context?.caseType || context?.domain || 'this case'}. Keep it simple - just the most important obligations.`;
      } else if (message.includes('Costs & Financial Considerations')) {
        detailedPrompt = `Provide simple information about costs and financial aspects for ${context?.caseType || context?.domain || 'this case'}. Include main fees and cost considerations.`;
      } else if (message.includes('Additional Considerations & Tips')) {
        detailedPrompt = `Provide simple, practical tips for ${context?.caseType || context?.domain || 'this case'}. Keep it brief and actionable.`;
      } else if (message.includes('Post-Approval') || message.includes('Post-Resolution')) {
        detailedPrompt = `Explain what happens after approval/resolution for ${context?.caseType || context?.domain || 'this case'}. Keep it simple and clear.`;
      }
      
      const detailedCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          systemMessage, 
          ...conversationHistory, 
          { role: 'user', content: detailedPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });
      
      assistantResponse = detailedCompletion.choices[0].message.content;
    } else {
      // Regular chat response
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...conversationHistory, userMessage],
        max_tokens: 1000,
        temperature: 0.7
      });

      assistantResponse = completion.choices[0].message.content;
    }

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

const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

// Save feedback
app.post('/api/feedback', express.json(), (req, res) => {
  const { name, role, message } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!role || typeof role !== 'string' || !role.trim()) {
    return res.status(400).json({ error: 'Role is required' });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Feedback message is required' });
  }
  const feedback = {
    id: uuidv4(),
    name: name.trim(),
    role: role.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  let feedbacks = [];
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    }
    feedbacks.push(feedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// List feedbacks
app.get('/api/feedback', (req, res) => {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) return res.json({ feedbacks: [] });
    const feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    res.json({ feedbacks });
  } catch (err) {
    console.error('Error reading feedback:', err);
    res.status(500).json({ error: 'Failed to read feedback' });
  }
});

// Delete feedback by id
app.delete('/api/feedback/:id', (req, res) => {
  const { id } = req.params;
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) return res.status(404).json({ error: 'No feedback found' });
    let feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    const prevLen = feedbacks.length;
    feedbacks = feedbacks.filter(fb => fb.id !== id);
    if (feedbacks.length === prevLen) return res.status(404).json({ error: 'Feedback not found' });
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Serve React app for all other routes (only in production)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// For Vercel deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin interface: http://localhost:${PORT}`);
    console.log(`Make sure to set OPENAI_API_KEY in your environment variables`);
  });
}

// Export for Vercel
module.exports = app; 