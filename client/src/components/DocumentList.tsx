import React from 'react';
import { File, Clock, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  uploadTime: string;
  fileType?: string;
}

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onRefresh }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (fileType: string | undefined) => {
    switch (fileType) {
      case '.pdf':
        return '📄';
      case '.doc':
      case '.docx':
        return '📝';
      case '.txt':
        return '📄';
      default:
        return '📄';
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">No documents uploaded yet</p>
        <p className="text-xs text-gray-400 mt-1">Upload documents to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <span className="text-lg">{getFileIcon(doc.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doc.filename}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(doc.uploadTime)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 uppercase">
              {doc.fileType ? doc.fileType.replace('.', '') : 'unknown'}
            </span>
            <button
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete this document?')) return;
                try {
                  const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Delete failed');
                  }
                  onRefresh();
                } catch (err: any) {
                  alert('An error occurred while deleting the document: ' + (err.message || err));
                }
              }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList; 