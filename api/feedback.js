export const config = {
  api: {
    bodyParser: true,
  },
};

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // 피드백 목록 조회
    try {
      // Vercel 환경에서는 임시 피드백 목록 반환
      const feedbacks = [
        {
          id: 'temp-feedback-1',
          name: 'Test User',
          role: 'User',
          message: 'Great service!',
          createdAt: new Date().toISOString()
        }
      ];
      
      console.log('Feedback GET request - returning:', feedbacks.length, 'feedbacks');
      
      res.status(200).json({ 
        feedbacks: feedbacks,
        message: 'Feedbacks retrieved successfully'
      });
    } catch (error) {
      console.error('Feedback GET Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }
  
  if (req.method === 'POST') {
    // 피드백 제출
    try {
      const { name, role, message } = req.body;
      
      if (!name || !role || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const feedback = {
        id: `feedback_${Date.now()}`,
        name,
        role,
        message,
        createdAt: new Date().toISOString()
      };
      
      console.log('Feedback submitted:', feedback);
      
      res.status(200).json({ 
        message: 'Feedback submitted successfully',
        feedback: feedback
      });
    } catch (error) {
      console.error('Feedback POST Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}; 