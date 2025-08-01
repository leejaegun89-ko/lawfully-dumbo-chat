const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

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
    form.uploadDir = '/tmp';
    form.keepExtensions = true;
    form.maxFileSize = 2 * 1024 * 1024; // 2MB limit

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Logo form parsing error:', err);
        return res.status(500).json({ error: 'Logo upload failed' });
      }

      console.log('Logo upload files:', files);

      if (files.logo) {
        const file = files.logo;
        const fileExtension = path.extname(file.originalFilename || 'logo');
        const logoId = `logo_${Date.now()}`;
        
        // For Vercel, we'll return a mock URL since files are temporary
        // In production, you'd upload to S3, Cloudinary, etc.
        const logoUrl = `/api/logo-file?id=${logoId}&ext=${fileExtension}`;
        
        console.log('Logo uploaded successfully:', logoUrl);
        
        res.status(200).json({ 
          message: 'Logo uploaded successfully',
          logoUrl: logoUrl,
          note: 'Logo is temporarily stored. For production, implement proper file storage.'
        });
      } else {
        console.error('No logo file found in request');
        res.status(400).json({ error: 'No logo file provided' });
      }
    });
  } catch (error) {
    console.error('Logo API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}; 