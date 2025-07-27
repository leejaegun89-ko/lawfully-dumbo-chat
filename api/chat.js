const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, documents, isAdmin } = req.body;

    // Build context from documents
    let context = '';
    if (documents && documents.length > 0) {
      context = documents.map(doc => doc.content).join('\n\n');
    }

    // Create system prompt
    const systemPrompt = isAdmin 
      ? `You are Dumbo, a helpful AI assistant for Lawfully Pro. You have access to the following documents: ${context}. Answer questions based on these documents and provide helpful information about Lawfully Pro's features and services.`
      : `You are Dumbo, a helpful AI assistant for Lawfully Pro. You can answer questions about Lawfully Pro's features, immigration services, and general legal information. Be helpful and informative.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.status(200).json({ 
      response: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 