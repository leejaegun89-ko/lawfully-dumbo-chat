import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import ElephantIcon from '../assets/elephant.svg';

const SharedChat: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setLogoUrl('/uploads/logo.png?' + Date.now());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoUrl || ElephantIcon} alt="Dumbo" className="w-7 h-7 mr-2 inline-block align-middle rounded-full object-contain border" />
              <h1 className="text-2xl font-bold text-gray-900">
                Lawfully Dumbo
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Shared Chat
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Share ID: {shareId}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)]">
          <ChatInterface isAdmin={false} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  );
};

export default SharedChat; 