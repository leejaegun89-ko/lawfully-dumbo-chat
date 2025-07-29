import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminInterface from './components/AdminInterface';
import SharedChat from './components/SharedChat';

const App: React.FC = () => {
  return (
    <div className="App dark min-h-screen bg-mystic-900 bg-gradient-to-br from-mystic-900 via-mystic-800 to-mystic-700">
      <Routes>
        <Route path="/" element={<AdminInterface />} />
        <Route path="/chat/:shareId" element={<SharedChat />} />
      </Routes>
    </div>
  );
};

export default App; 