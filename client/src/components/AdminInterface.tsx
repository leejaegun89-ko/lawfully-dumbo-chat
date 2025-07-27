import React, { useState, useRef } from 'react';
import FileUpload from './FileUpload';
import ChatInterface, { ChatInterfaceRef } from './ChatInterface';
import ImmigrationChat, { ImmigrationChatRef } from './ImmigrationChat';
import DocumentList from './DocumentList';
import { Share, RefreshCw, FileText, Globe } from 'lucide-react';
import ElephantIcon from './ElephantIcon';
import LogoUpload from './LogoUpload';
import { useLogo } from '../hooks/useLogo';

// Feedback List Modal
function FeedbackListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [feedbacks, setFeedbacks] = React.useState<{id:string, name:string, role:string, message:string, createdAt:string}[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [confirmMulti, setConfirmMulti] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setFeedbacks(data.feedbacks || []))
      .catch(err => setError('Failed to load feedbacks'))
      .finally(() => setLoading(false));
    setSelected([]);
  }, [open]);

  // 토스트 자동 사라짐
  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleDelete = async (id: string) => {
    setConfirmId(id);
  };

  const confirmDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setFeedbacks(fbs => fbs.filter(fb => fb.id !== id));
      setToast('Feedback deleted');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setToast('Failed to delete feedback');
    } finally {
      setLoading(false);
      setConfirmId(null);
    }
  };

  // 멀티 선택 핸들러
  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };
  const selectAll = () => {
    if (selected.length === feedbacks.length) setSelected([]);
    else setSelected(feedbacks.map(fb => fb.id));
  };

  // 멀티 삭제
  const handleMultiDelete = () => {
    if (selected.length === 0) return;
    setConfirmMulti(true);
  };
  const confirmMultiDelete = async () => {
    setLoading(true);
    setError(null);
    let success = 0, fail = 0;
    for (const id of selected) {
      try {
        const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        success++;
      } catch {
        fail++;
      }
    }
    setFeedbacks(fbs => fbs.filter(fb => !selected.includes(fb.id)));
    setSelected([]);
    setToast(`${success} feedback${success !== 1 ? 's' : ''} deleted${fail ? `, ${fail} failed` : ''}`);
    setLoading(false);
    setConfirmMulti(false);
  };

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-darkbg-800 rounded-xl p-6 w-full max-w-lg shadow-lg border border-darkbg-700 max-h-[80vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-accent-blue">User Feedback / Requests</h2>
          <button onClick={onClose} className="btn-secondary px-3 py-1">Close</button>
        </div>
        {/* 멀티 선택/삭제 UI */}
        <div className="flex items-center mb-2 gap-2">
          <input type="checkbox" checked={selected.length === feedbacks.length && feedbacks.length > 0} onChange={selectAll} />
          <span className="text-sm text-accent-gray">Select All</span>
          <button
            onClick={handleMultiDelete}
            className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm disabled:opacity-50"
            disabled={selected.length === 0 || loading}
            title="Delete selected feedbacks"
          >Delete Selected</button>
          {selected.length > 0 && <span className="text-xs text-accent-blue">{selected.length} selected</span>}
        </div>
        {loading && <div className="text-accent-blue">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && !error && feedbacks.length === 0 && (
          <div className="text-accent-gray">No feedback yet.</div>
        )}
        <ul className="space-y-4">
          {feedbacks.map(fb => (
            <li key={fb.id} className="p-3 rounded-lg bg-darkbg-700 border border-darkbg-600">
              <div className="flex items-center gap-2 mb-1">
                <input type="checkbox" checked={selected.includes(fb.id)} onChange={() => toggleSelect(fb.id)} />
                <span className="font-bold text-accent-blue">{fb.name}</span>
                <span className="text-xs text-accent-gray">({fb.role})</span>
                <button
                  onClick={() => handleDelete(fb.id)}
                  className="ml-auto text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                  disabled={loading}
                  title="Delete feedback"
                >Delete</button>
              </div>
              <div className="text-white mb-1 whitespace-pre-line">{fb.message}</div>
              <div className="text-xs text-accent-gray">{new Date(fb.createdAt).toLocaleString()}</div>
              {/* Confirm Modal */}
              {confirmId === fb.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-darkbg-800 border border-darkbg-700 rounded-xl p-6 w-full max-w-xs shadow-lg flex flex-col items-center">
                    <div className="mb-4 text-white text-center">Are you sure you want to delete this feedback?</div>
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary px-4"
                        onClick={() => setConfirmId(null)}
                        disabled={loading}
                      >Cancel</button>
                      <button
                        className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                        onClick={() => confirmDelete(fb.id)}
                        disabled={loading}
                      >Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {/* 멀티 삭제 Confirm 모달 */}
        {confirmMulti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-darkbg-800 border border-darkbg-700 rounded-xl p-6 w-full max-w-xs shadow-lg flex flex-col items-center">
              <div className="mb-4 text-white text-center">Are you sure you want to delete {selected.length} feedback{selected.length !== 1 ? 's' : ''}?</div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary px-4"
                  onClick={() => setConfirmMulti(false)}
                  disabled={loading}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                  onClick={confirmMultiDelete}
                  disabled={loading}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 bg-darkbg-900 text-white px-6 py-3 rounded-xl shadow-lg border border-darkbg-700 animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </div>
  ) : null;
}

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
  const { logoUrl } = useLogo();
  const chatRef = useRef<ChatInterfaceRef>(null);
  const immigrationChatRef = useRef<ImmigrationChatRef>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [activeChatMode, setActiveChatMode] = useState<'document' | 'immigration' | 'beyond'>('document');

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
  const handleLogoUpload = async (logoUrl: string) => {
    console.log('Logo uploaded:', logoUrl);
    // The logo URL will be automatically updated through the useLogo hook
    // No need to manually refetch since the URL is passed directly
  };

  // 챗 리프레시 핸들러
  const handleChatRefresh = () => {
    if (activeChatMode === 'document') {
      chatRef.current?.refreshChat();
    } else {
      immigrationChatRef.current?.refreshChat();
    }
  };

  return (
    <div className="min-h-screen bg-darkbg-900">
      {/* Header */}
      <header className="bg-darkbg-800/80 glass-card border-b border-darkbg-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-7 h-7 mr-2 inline-block align-middle rounded-full object-contain border border-accent-blue" />
              ) : (
                <ElephantIcon className="w-7 h-7 mr-2 inline-block align-middle" />
              )}
              <h1 className="text-2xl font-bold text-accent-blue">Lawfully Dumbo</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/30">
                Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <LogoUpload onUpload={handleLogoUpload} />
              <button
                onClick={() => setFeedbackOpen(true)}
                className="p-2 rounded-lg bg-accent-blue text-white hover:bg-accent-blue/80 transition-colors"
                title="View User Feedback"
              >
                Feedback
              </button>
              <button
                onClick={handleChatRefresh}
                className="p-2 rounded-lg bg-darkbg-700 hover:bg-darkbg-600 text-accent-blue transition-colors"
                title="Refresh Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={generateShareUrl}
                disabled={isLoading}
                className="btn-main flex items-center disabled:opacity-50"
              >
                <Share className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Share Chat'}
              </button>
              {shareUrl && (
                <div className="text-sm text-accent-blue">
                  Share URL: {shareUrl}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <FeedbackListModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - File Upload and Document List */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-accent-blue mb-4">
                Upload Documents
              </h2>
              <FileUpload onUpload={handleFileUpload} />
            </div>

            {/* Document List */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-accent-blue mb-4">
                Uploaded Documents ({documents.length})
              </h2>
              <DocumentList documents={documents} onRefresh={fetchDocuments} />
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="glass-card h-[calc(100vh-200px)]">
              {/* Chat Mode Tabs */}
              <div className="flex border-b border-darkbg-700 bg-darkbg-800/60">
                <button
                  onClick={() => setActiveChatMode('document')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeChatMode === 'document'
                      ? 'text-accent-blue border-b-2 border-accent-blue bg-darkbg-700/50'
                      : 'text-accent-gray hover:text-accent-blue hover:bg-darkbg-700/30'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>About Lawfully Pro</span>
                </button>
                <button
                  onClick={() => setActiveChatMode('immigration')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeChatMode === 'immigration'
                      ? 'text-accent-blue border-b-2 border-accent-blue bg-darkbg-700/50'
                      : 'text-accent-gray hover:text-accent-blue hover:bg-darkbg-700/30'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Immigration Assistant</span>
                </button>
                <button
                  onClick={() => setActiveChatMode('beyond')}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeChatMode === 'beyond'
                      ? 'text-accent-blue border-b-2 border-accent-blue bg-darkbg-700/50'
                      : 'text-accent-gray hover:text-accent-blue hover:bg-darkbg-700/30'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Beyond Immigration</span>
                </button>
              </div>
              
                        {/* Chat Interface */}
          {activeChatMode === 'immigration' ? (
            <ImmigrationChat key="immigration" ref={immigrationChatRef} isAdmin={true} logoUrl={logoUrl} initialTab="general" />
          ) : activeChatMode === 'beyond' ? (
            <ImmigrationChat key="beyond" ref={immigrationChatRef} isAdmin={true} logoUrl={logoUrl} initialTab="beyond" />
          ) : (
            <ChatInterface ref={chatRef} isAdmin={true} logoUrl={logoUrl} />
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterface; 