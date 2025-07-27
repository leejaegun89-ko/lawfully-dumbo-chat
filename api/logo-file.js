module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, ext } = req.query;
    
    console.log('Logo file request:', { id, ext });
    
    if (!id || !ext) {
      return res.status(400).json({ error: 'Missing id or extension' });
    }

    // For Vercel, we'll return a default logo since files are temporary
    // In production, you'd serve the actual file from S3, Cloudinary, etc.
    
    // Set appropriate headers
    res.setHeader('Content-Type', getContentType(ext));
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Return a better placeholder image based on file type
    const placeholderUrl = getPlaceholderUrl(ext);
    console.log('Redirecting to placeholder:', placeholderUrl);
    
    res.redirect(placeholderUrl);
    
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

function getPlaceholderUrl(extension) {
  const ext = extension.toLowerCase();
  
  // Return different placeholder images based on file type
  if (ext === '.svg') {
    return 'https://via.placeholder.com/100x100/007bff/ffffff?text=SVG+Logo';
  } else if (ext === '.png') {
    return 'https://via.placeholder.com/100x100/28a745/ffffff?text=PNG+Logo';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    return 'https://via.placeholder.com/100x100/dc3545/ffffff?text=JPEG+Logo';
  } else {
    return 'https://via.placeholder.com/100x100/6c757d/ffffff?text=Logo';
  }
} 