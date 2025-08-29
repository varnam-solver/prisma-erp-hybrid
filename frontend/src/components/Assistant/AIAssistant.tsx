import React, { useState, useEffect, useRef } from 'react';

// --- Helper Components for UI ---

// Icon for the chatbot header and messages
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);

// Icon for user messages
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// Icon for the send button
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);


// --- Main Application Component ---

export default function App() {
  // Get tenantId from logged-in user in localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user?.tenantId;

  // State for the list of messages in the chat
  type Message = {
    sender: string;
    text: string;
    isError?: boolean;
  };

  const [messages, setMessages] = useState<Message[]>(
    [
      {
        sender: 'bot',
        text: "Hello! I'm your ERP assistant. How can I help you with your pharmacy data today?",
      },
    ]
  );
  
  // State to manage the user's input in the text field
  const [input, setInput] = useState('');
  
  // State to show the "Thinking..." indicator
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to the chat window for auto-scrolling
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- Main Chat Logic ---
  // This function handles sending the message to the backend API.
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to your FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          tenantId: tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage = {
        sender: 'bot',
        text: `Sorry, I encountered an error: ${error.message}. Please check if the server is running.`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---

  // If the tenantId is not set, show the mock login screen
  if (!tenantId) {
    return (
      <div className="bg-gray-100 flex items-center justify-center h-screen font-sans">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
          <div className="text-center">
             <h1 className="text-3xl font-bold text-slate-800">ERP AI Assistant</h1>
             <p className="mt-2 text-sm text-gray-600">
               Please log in to your ERP system to use the assistant.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // If the tenantId is set, show the main chat interface
  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md sm:max-w-lg z-50 font-sans">
      <div className="flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 rounded-t-lg flex items-center shadow-md">
          <BotIcon />
          <h1 className="text-xl font-bold ml-3">Pharmacy AI Assistant</h1>
        </div>

        {/* Chat Window */}
        <div ref={chatWindowRef} className="flex-1 p-6 overflow-y-auto bg-gray-50 h-80" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 mb-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="bg-slate-700 text-white p-2 rounded-full flex-shrink-0"><BotIcon /></div>
              )}
              <div className={`p-3 rounded-lg shadow-sm max-w-md ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-white'
                    : msg.isError
                    ? 'bg-red-200 text-red-900'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              {msg.sender === 'user' && (
                <div className="bg-gray-300 p-2 rounded-full flex-shrink-0"><UserIcon /></div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 mb-6">
              <div className="bg-slate-700 text-white p-2 rounded-full flex-shrink-0"><BotIcon /></div>
              <div className="bg-slate-200 p-3 rounded-lg shadow-sm flex items-center space-x-1">
                <span className="text-sm text-slate-600">Thinking...</span>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your pharmacy..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-slate-800 text-white px-5 py-3 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition duration-300 ease-in-out flex items-center disabled:opacity-50"
              disabled={isLoading}
            >
              <SendIcon />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
