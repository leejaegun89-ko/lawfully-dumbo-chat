const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, isAdmin } = req.body;

    console.log('Chat API called with:', { message, sessionId, isAdmin });

    // For now, we'll use a general context since documents are not persisted in Vercel
    const systemPrompt = isAdmin 
      ? `You are Dumbo, a helpful AI assistant for Lawfully Pro. You can help with:
         - Document analysis and Q&A
         - Immigration case types and forms
         - Legal information and guidance
         - Lawfully Pro features and services
         
         Please provide helpful, accurate information about immigration law and Lawfully Pro's services.`
      : `You are Dumbo, a helpful AI assistant for Lawfully Pro. You can help with:
         - Immigration questions and guidance
         - Legal information
         - Lawfully Pro features
         
         Please provide helpful, accurate information about immigration law and Lawfully Pro's services.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log('AI Response:', response);

    res.status(200).json({ 
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // More specific error handling
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ error: 'API quota exceeded' });
    } else if (error.code === 'invalid_api_key') {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}; 