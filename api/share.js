const { v4: uuidv4 } = require('uuid');

export const config = {
  api: {
    bodyParser: true,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 고유한 공유 ID 생성
    const shareId = uuidv4();
    const shareUrl = `/shared/${shareId}`;
    
    console.log('Share URL generated:', shareUrl);
    
    res.status(200).json({ 
      shareUrl: shareUrl,
      shareId: shareId,
      message: 'Share URL generated successfully'
    });
  } catch (error) {
    console.error('Share API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 