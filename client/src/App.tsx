import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminInterface from './components/AdminInterface';
import SharedChat from './components/SharedChat';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<AdminInterface />} />
        <Route path="/chat/:shareId" element={<SharedChat />} />
      </Routes>
    </div>
  );
};

export default App; 