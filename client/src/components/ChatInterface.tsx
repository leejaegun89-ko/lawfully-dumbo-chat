import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Send, User, RefreshCw } from 'lucide-react';
import ElephantIcon from './ElephantIcon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  buttons?: string[];
}

interface ChatInterfaceProps {
  isAdmin?: boolean;
  logoUrl?: string | null;
}

export interface ChatInterfaceRef {
  refreshChat: () => void;
}

const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ isAdmin = false, logoUrl }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshChat: () => {
      setMessages([]);
      setInputMessage('');
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageContent) {
      setInputMessage('');
    }
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Check if the response contains button options
      const buttonOptions = extractButtonOptions(data.response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        buttons: buttonOptions.length > 0 ? buttonOptions : undefined,
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

  const handleSendMessage = () => {
    sendMessage();
  };

  // Extract button options from AI response
  const extractButtonOptions = (content: string): string[] => {
    const buttonOptions: string[] = [];
    
    // Look for numbered list patterns like "1. **Processing Time**"
    const buttonPattern = /\d+\.\s+\*\*([^*]+)\*\*/g;
    let match;
    
    while ((match = buttonPattern.exec(content)) !== null) {
      buttonOptions.push(match[1].trim());
    }
    
    return buttonOptions;
  };

  // Handle button click
  const handleButtonClick = (buttonText: string) => {
    sendMessage(buttonText);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-darkbg-800/80 glass-card">
        <div className="flex items-center space-x-2">
          {/* <img src={logoUrl || ElephantIcon} alt="Dumbo" className="w-7 h-7 mr-1 inline-block align-middle rounded-full object-contain border border-accent-blue" /> */}
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
            }}
            className="p-2 rounded-lg bg-darkbg-700 hover:bg-darkbg-600 text-accent-blue transition-colors"
            title="Refresh Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

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
              {isAdmin 
                ? "Upload documents and start chatting with me about their content."
                : "Don't bother product team - Figure it out yourself by asking me anything about the product."
              }
            </p>
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
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Button options */}
                  {message.buttons && message.buttons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.buttons.map((buttonText, index) => (
                        <button
                          key={index}
                          onClick={() => handleButtonClick(buttonText)}
                          className="px-3 py-1.5 text-xs bg-accent-blue/10 text-accent-blue border border-accent-blue/30 rounded-lg hover:bg-accent-blue/20 transition-colors"
                        >
                          {buttonText}
                        </button>
                      ))}
                    </div>
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
            placeholder="Type your message..."
            className="flex-1 resize-none input-dark"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-main disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface; 