# Lawfully Dumbo

A document-based AI chatbot application with admin interface and shareable chat URLs. Upload documents and chat with Dumbo about their content!

## Features

### 🎯 Main Admin Interface
- **File Upload Section**: Drag & drop or browse to upload multiple documents
- **Supported Formats**: PDF, DOC, DOCX, TXT files (up to 10MB each)
- **Document Management**: View uploaded files with timestamps and file types
- **Persistent Chat Interface**: Always visible on the right side

### 🤖 Dumbo Chatbot
- **AI-Powered Responses**: Uses OpenAI GPT-3.5-turbo for intelligent responses
- **Document Context**: Answers questions based on uploaded document content
- **Session Management**: Maintains chat history per session
- **Real-time Interaction**: Instant responses with typing indicators

### 🔗 Public Shareable URLs
- **Unique URLs**: Generate shareable links (e.g., `/chat/abc123`)
- **Public Access**: Anyone with the link can chat with Dumbo
- **Same Knowledge Base**: All shared URLs access the same uploaded documents
- **Clean Interface**: Shared URLs show only the chat interface (no admin features)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **File Upload**: Multer for handling file uploads
- **Document Parsing**: 
  - `pdf-parse` for PDF files
  - `mammoth` for DOC/DOCX files
  - Native text parsing for TXT files
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Session Management**: In-memory storage (easily extensible to database)

### Frontend
- **React 18** with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lawfully-dumbo
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-actual-openai-api-key-here
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Admin Interface: http://localhost:5001
   - The React app will automatically proxy API calls to the backend

### Production Build

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run server
   ```

## Usage

### Admin Interface (http://localhost:5000)

1. **Upload Documents**
   - Drag and drop files or click "browse"
   - Supported formats: PDF, DOC, DOCX, TXT
   - Files are automatically parsed and stored

2. **Chat with Dumbo**
   - The chat interface is always visible on the right
   - Ask questions about your uploaded documents
   - Dumbo will respond based on the document content

3. **Generate Shareable URL**
   - Click "Share Chat" button
   - Copy the generated URL
   - Share with others to let them chat with Dumbo

### Public Chat Interface

- Access via generated shareable URLs (e.g., `/chat/abc123`)
- Clean interface with only the chat functionality
- Same document knowledge base as admin interface
- No file upload or management features

## API Endpoints

### File Management
- `POST /api/upload` - Upload documents
- `GET /api/documents` - Get list of uploaded documents

### Chat
- `POST /api/chat` - Send message to Dumbo
- `POST /api/share` - Generate shareable URL

## Project Structure

```
lawfully-dumbo/
├── server/                 # Backend server
│   ├── index.js           # Main server file
│   ├── package.json       # Server dependencies
│   └── uploads/           # Uploaded files storage
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # Entry point
│   ├── public/            # Static files
│   └── package.json       # Client dependencies
├── package.json           # Root package.json
└── README.md             # This file
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `PORT` | Server port | 5001 |

### File Upload Limits

- **File Size**: 10MB per file
- **File Types**: PDF, DOC, DOCX, TXT
- **Batch Upload**: Up to 10 files at once

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React development server
- `npm run build` - Build the React app for production
- `npm run install-all` - Install dependencies for all packages

### Adding New Features

1. **Backend**: Add new routes in `server/index.js`
2. **Frontend**: Create new components in `client/src/components/`
3. **Styling**: Use Tailwind CSS classes or add custom CSS

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm run install-all` to install all dependencies

2. **OpenAI API errors**
   - Check your API key in the `.env` file
   - Ensure you have sufficient API credits

3. **File upload fails**
   - Check file size (max 10MB)
   - Verify file format (PDF, DOC, DOCX, TXT only)

4. **Port already in use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

---

**Made with ❤️ for document-based AI conversations** # lawfully-dumbo
# lawfully-dumbo
# lawfully-dumbo
# lawfully-dumbo
# lawfully-dumbo
# lawfully-dumbo
