export const config = {
  api: {
    bodyParser: true,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel 환경에서는 임시 문서 목록 반환
    // 실제로는 데이터베이스에서 문서 정보를 가져와야 함
    const documents = [
      {
        id: 'temp-doc-1',
        filename: 'Lawfully Pro Documentation',
        uploadTime: new Date().toISOString(),
        fileType: '.docx'
      }
    ];
    
    console.log('Documents API called - returning:', documents.length, 'documents');
    
    res.status(200).json({ 
      documents: documents,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    console.error('Documents API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 