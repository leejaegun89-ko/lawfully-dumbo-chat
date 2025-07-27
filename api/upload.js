const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = '/tmp'; // Vercel uses /tmp for temporary files
    form.keepExtensions = true;
    form.maxFileSize = 10 * 1024 * 1024; // 10MB limit

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      const uploadedFiles = [];
      
      // Handle multiple files
      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      
      for (const file of fileArray) {
        if (file) {
          const fileId = uuidv4();
          const fileExtension = path.extname(file.originalFilename || 'file');
          const fileName = `${fileId}${fileExtension}`;
          
          // For Vercel, we'll store file info and return a temporary URL
          // In production, you'd want to upload to S3, Cloudinary, etc.
          uploadedFiles.push({
            id: fileId,
            filename: file.originalFilename || 'uploaded-file',
            uploadTime: new Date().toISOString(),
            fileType: fileExtension.toLowerCase(),
            size: file.size,
            tempPath: file.filepath,
            // Note: This is temporary and will be lost when function ends
            // For production, implement proper file storage
          });
        }
      }

      res.status(200).json({ 
        message: 'Files uploaded successfully',
        files: uploadedFiles,
        note: 'Files are temporarily stored. For production, implement proper file storage.'
      });
    });
  } catch (error) {
    console.error('Upload API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 