import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import ChatInterface from './ChatInterface';
import DocumentList from './DocumentList';
import { Share } from 'lucide-react';
import ElephantIcon from '../assets/elephant.svg';
import LogoUpload from './LogoUpload';

interface Document {
  id: string;
  filename: string;
  uploadTime: string;
  fileType: string;
}

const AdminInterface: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // 서버에 logo.png가 있으면 그걸 사용
    setLogoUrl('/uploads/logo.png');
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (uploadedFiles: Document[]) => {
    setDocuments(prev => [...prev, ...uploadedFiles]);
  };

  const generateShareUrl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setShareUrl(fullUrl);
      
      // Copy to clipboard
      navigator.clipboard.writeText(fullUrl);
      alert('Share URL copied to clipboard!');
    } catch (error) {
      console.error('Error generating share URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로고 업로드 핸들러
  const handleLogoUpload = () => {
    // 업로드 성공 시 항상 캐시를 무력화
    setLogoUrl('/uploads/logo.png?' + Date.now());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-7 h-7 mr-2 inline-block align-middle rounded-full object-contain border" />
              ) : (
                <img src={ElephantIcon} alt="Dumbo" className="w-7 h-7 mr-2 inline-block align-middle" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                Lawfully Dumbo
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <LogoUpload onUpload={handleLogoUpload} />
              <button
                onClick={generateShareUrl}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Share className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Share Chat'}
              </button>
              {shareUrl && (
                <div className="text-sm text-gray-600">
                  Share URL: {shareUrl}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - File Upload and Document List */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Documents
              </h2>
              <FileUpload onUpload={handleFileUpload} />
            </div>

            {/* Document List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Documents ({documents.length})
              </h2>
              <DocumentList documents={documents} onRefresh={fetchDocuments} />
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)]">
              <ChatInterface isAdmin={true} logoUrl={logoUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterface; 