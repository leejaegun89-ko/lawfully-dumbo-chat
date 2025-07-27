module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, ext } = req.query;
    
    if (!id || !ext) {
      return res.status(400).json({ error: 'Missing id or extension' });
    }

    // For Vercel, we'll return a default logo since files are temporary
    // In production, you'd serve the actual file from S3, Cloudinary, etc.
    
    // Set appropriate headers
    res.setHeader('Content-Type', getContentType(ext));
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Return a default logo or placeholder
    // For now, we'll redirect to a placeholder image
    res.redirect('https://via.placeholder.com/100x100/007bff/ffffff?text=Logo');
    
  } catch (error) {
    console.error('Logo file API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function getContentType(extension) {
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
} 