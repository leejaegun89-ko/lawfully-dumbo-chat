import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface, { ChatInterfaceRef } from './ChatInterface';
import ElephantIcon from '../assets/elephant.svg';
import { useLogo } from '../hooks/useLogo';
import { RefreshCw } from 'lucide-react';

// Feedback Modal
function FeedbackModal({ open, onClose }: { open: boolean; onClose: (submitted: boolean) => void }) {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // 모달이 열릴 때마다 입력값 초기화
  React.useEffect(() => {
    if (open) {
      setName('');
      setRole('');
      setMessage('');
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!role.trim()) {
      setError('Role is required.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your feedback.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      setSuccess(true);
      setTimeout(() => onClose(true), 1000);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-darkbg-800 rounded-xl p-6 w-full max-w-md shadow-lg border border-darkbg-700">
        <h2 className="text-lg font-bold mb-2 text-accent-blue">Send Feedback / Request</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mb-2">
            <input
              className="w-full p-2 rounded-lg bg-darkbg-700 border border-darkbg-600 text-white"
              placeholder="Name (required)"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading || success}
              maxLength={40}
              required
            />
            <input
              className="w-full p-2 rounded-lg bg-darkbg-700 border border-darkbg-600 text-white"
              placeholder="Role (e.g. User, Lawyer, etc) (required)"
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={loading || success}
              maxLength={40}
              required
            />
            <textarea
              className="w-full h-24 p-2 rounded-lg bg-darkbg-700 border border-darkbg-600 text-white"
              placeholder="Write your feedback or feature request..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={loading || success}
              maxLength={500}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-400 text-sm mb-2">Thank you for your feedback!</div>}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              className="btn-secondary px-4"
              onClick={() => onClose(false)}
              disabled={loading}
            >Cancel</button>
            <button
              type="submit"
              className="btn-main px-4"
              disabled={loading || success}
            >{loading ? 'Sending...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const SharedChat: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { logoUrl } = useLogo();
  const chatRef = useRef<ChatInterfaceRef>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  // 챗 리프레시 핸들러
  const handleChatRefresh = () => {
    chatRef.current?.refreshChat();
  };

  return (
    <div className="min-h-screen bg-darkbg-900">
      {/* Header */}
      <header className="bg-darkbg-800/80 glass-card border-b border-darkbg-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoUrl || ElephantIcon} alt="Dumbo" className="w-7 h-7 mr-2 inline-block align-middle rounded-full object-contain border border-accent-blue" />
              <h1 className="text-2xl font-bold text-accent-blue">Lawfully Dumbo</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/30">
                Shared Chat
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-accent-blue">
                Share ID: {shareId}
              </div>
              <button
                onClick={handleChatRefresh}
                className="p-2 rounded-lg bg-darkbg-700 hover:bg-darkbg-600 text-accent-blue transition-colors"
                title="Refresh Chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFeedbackOpen(true)}
                className="p-2 rounded-lg bg-accent-blue text-white hover:bg-accent-blue/80 transition-colors ml-2"
                title="Send Feedback or Request"
              >
                Feedback/Request
              </button>
            </div>
          </div>
        </div>
      </header>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card h-[calc(100vh-200px)]">
          <ChatInterface ref={chatRef} isAdmin={false} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  );
};

export default SharedChat; 