import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am StockWhiz AI, your financial assistant. How can I help you with your portfolio today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Minimize chat when route changes or tab loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsOpen(false);
      }
    };

    setIsOpen(false);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Small delay to ensure UI updates before blocking network call
      const response = await API.post('chatbot/', { message: currentInput });
      const botResponse = { role: 'bot', text: response.data.reply || "I'm sorry, I couldn't process that. Please try again." };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = { role: 'bot', text: 'Oops! Something went wrong. Please check your connection or try again later.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating Chat Icon */}
      <button className="chatbot-button" onClick={toggleChat} title="StockWhiz AI Assistant">
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? '' : 'hidden'}`}>
        <div className="chatbot-header">
          <h3>StockWhiz AI Assistant</h3>
          <button className="close-btn" onClick={toggleChat}>✕</button>
        </div>

        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message typing-indicator" style={{ opacity: 0.7, fontSize: '0.85rem' }}>
              ⚡ Processing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything about stocks..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={isLoading || !inputText.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
