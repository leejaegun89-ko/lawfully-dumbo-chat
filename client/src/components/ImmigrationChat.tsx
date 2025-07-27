import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Send, User, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ElephantIcon from './ElephantIcon';
import ImmigrationCaseTypes from './ImmigrationCaseTypes';
import LegalDomains from './LegalDomains';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ImmigrationChatProps {
  isAdmin?: boolean;
  logoUrl?: string | null;
}

export interface ImmigrationChatRef {
  refreshChat: () => void;
}

type TabType = 'general' | 'beyond';

interface ImmigrationChatProps {
  isAdmin?: boolean;
  logoUrl?: string | null;
  initialTab?: TabType;
}

const ImmigrationChat = forwardRef<ImmigrationChatRef, ImmigrationChatProps>(({ isAdmin = false, logoUrl, initialTab = 'general' }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [activeTab] = useState<TabType>(initialTab);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('ImmigrationChat rendered with:', { initialTab, activeTab });

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshChat: () => {
      setMessages([]);
      setInputMessage('');
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      setSelectedCaseType(null);
      setSelectedDomain(null);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId,
          context: {
            tab: activeTab,
            caseType: selectedCaseType,
            domain: selectedDomain,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCaseTypeSelect = (caseType: string) => {
    setSelectedCaseType(caseType);
    setMessages([]);
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Automatically send a message requesting journey information
    const journeyMessage = `Please provide a comprehensive journey overview for ${caseType}, including:
1. Typical processing time
2. Step-by-step process
3. Required documents
4. Potential issues and delays
5. Expected timeline for each step
6. What to do if unexpected issues arise`;
    
    // Add the message to the chat and send it
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: journeyMessage,
      timestamp: new Date()
    };
    
    setMessages([newMessage]);
    setInputMessage('');
    sendJourneyRequest(caseType, journeyMessage);
  };

  const sendJourneyRequest = async (caseType: string, message: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            tab: 'general',
            caseType: caseType
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setMessages([]);
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Automatically send a message requesting journey information
    const journeyMessage = `Please provide a comprehensive journey overview for ${domain}, including:
1. Typical processing time and legal procedures
2. Step-by-step legal process
3. Required documentation and evidence
4. Potential legal issues and challenges
5. Expected timeline for each step
6. What to do if unexpected legal issues arise`;
    
    // Add the message to the chat and send it
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: journeyMessage,
      timestamp: new Date()
    };
    
    setMessages([newMessage]);
    setInputMessage('');
    sendDomainJourneyRequest(domain, journeyMessage);
  };

  const sendDomainJourneyRequest = async (domain: string, message: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            tab: 'beyond',
            domain: domain
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-darkbg-800/80 glass-card">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-accent-blue">Dumbo</h2>
          {isAdmin && (
            <span className="px-2 py-1 text-xs bg-accent-blue/10 text-accent-blue rounded-full border border-accent-blue/30">
              Admin Mode
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-accent-blue">
            {messages.length > 0 && `${messages.length} messages`}
          </div>
          <button
            onClick={() => {
              setMessages([]);
              setInputMessage('');
              setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
              setSelectedCaseType(null);
              setSelectedDomain(null);
            }}
            className="p-2 rounded-lg bg-darkbg-700 hover:bg-darkbg-600 text-accent-blue transition-colors"
            title="Refresh Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>



      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Case Types (only for General Immigration) */}
        {activeTab === 'general' && (
          <div className="w-80 border-r border-darkbg-700 bg-darkbg-800/40">
            <ImmigrationCaseTypes
              selectedCaseType={selectedCaseType}
              onCaseTypeSelect={handleCaseTypeSelect}
            />
          </div>
        )}

        {/* Left Panel - Legal Domains (only for Beyond Immigration) */}
        {activeTab === 'beyond' && (
          <div className="w-80 border-r border-darkbg-700 bg-darkbg-800/40">
            <LegalDomains
              selectedDomain={selectedDomain}
              onDomainSelect={handleDomainSelect}
            />
          </div>
        )}

        {/* Right Panel - Chat */}
        <div className={`flex-1 flex flex-col ${activeTab === 'general' || activeTab === 'beyond' ? '' : 'w-full'}`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-accent-gray mt-8">
                {logoUrl ? (
                  <img src={logoUrl} alt="Dumbo" className="w-12 h-12 mx-auto mb-4 text-accent-gray rounded-full object-contain border border-accent-blue" />
                ) : (
                  <ElephantIcon className="w-12 h-12 mx-auto mb-4 text-accent-gray" />
                )}
                <p className="text-lg font-medium text-accent-blue">Welcome to Dumbo!</p>
                <p className="text-sm text-accent-gray">
                  {activeTab === 'general' 
                    ? selectedCaseType 
                      ? `Ask me anything about ${selectedCaseType}`
                      : "Select an immigration case type to get started."
                    : activeTab === 'beyond'
                    ? selectedDomain
                      ? `Ask me anything about ${selectedDomain}`
                      : "Select a legal domain to get started."
                    : "Ask me anything about immigration and beyond."
                  }
                </p>
                {(activeTab === 'general' && !selectedCaseType) || (activeTab === 'beyond' && !selectedDomain) ? (
                  <p className="text-xs text-accent-gray mt-2">
                    Choose a {activeTab === 'general' ? 'case type' : 'legal domain'} from the left panel to begin.
                  </p>
                ) : null}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-accent-blue text-white'
                          : 'bg-darkbg-700 text-accent-blue border border-accent-blue'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        logoUrl ? (
                          <img src={logoUrl} alt="Dumbo" className="w-4 h-4 rounded-full object-contain border border-accent-blue" />
                        ) : (
                          <ElephantIcon className="w-4 h-4" />
                        )
                      )}
                    </div>
                    <div
                      className={`chat-bubble-${message.role === 'user' ? 'user' : 'ai'} max-w-full`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="text-sm prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold text-accent-blue mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold text-accent-blue mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-semibold text-accent-blue mb-1">{children}</h3>,
                              p: ({children}) => <p className="text-sm mb-2">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({children}) => <li className="text-sm">{children}</li>,
                              strong: ({children}) => <strong className="font-semibold text-accent-blue">{children}</strong>,
                              em: ({children}) => <em className="italic">{children}</em>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p
                        className={`text-xs mt-1 text-accent-gray`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-darkbg-700 text-accent-blue flex items-center justify-center border border-accent-blue">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Dumbo" className="w-4 h-4 rounded-full object-contain border border-accent-blue" />
                    ) : (
                      <ElephantIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="chat-bubble-ai">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent-gray rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-darkbg-800/80 glass-card">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  activeTab === 'general' && selectedCaseType
                    ? `Ask about ${selectedCaseType}...`
                    : activeTab === 'general'
                    ? "Select a case type first..."
                    : activeTab === 'beyond' && selectedDomain
                    ? `Ask about ${selectedDomain}...`
                    : activeTab === 'beyond'
                    ? "Select a legal domain first..."
                    : "Ask me anything about immigration and beyond..."
                }
                className="flex-1 resize-none input-dark"
                rows={1}
                disabled={isLoading || (activeTab === 'general' && !selectedCaseType) || (activeTab === 'beyond' && !selectedDomain)}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || (activeTab === 'general' && !selectedCaseType) || (activeTab === 'beyond' && !selectedDomain)}
                className="btn-main disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ImmigrationChat.displayName = 'ImmigrationChat';

export default ImmigrationChat; 