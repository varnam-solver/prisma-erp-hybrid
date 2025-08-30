import React, { useState, useEffect, useRef } from 'react';

// --- Helper Components for UI ---

// Icon for the chatbot header and messages
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);


// --- Main Application Component ---

export default function App() {
  const [open, setOpen] = useState(false);

  // Example state for messages (replace with your logic)
  const [messages, setMessages] = useState(
    [
      {
        sender: 'bot',
        text: "Hello! I'm your ERP assistant. How can I help you with your pharmacy data today?",
      },
    ]
  );
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

  // Handle Enter key for sending
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage(e);
  };

  // Get tenantId from logged-in user in localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user?.tenantId;

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
    <>
      {/* Floating Icon Button */}
      {!open && (
        <button
          aria-label="Open AI Assistant"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer"
          }}
        >
          <BotIcon />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 340,
            maxWidth: "90vw",
            height: 440,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BotIcon />
              <span style={{ fontWeight: 600 }}>AI Assistant</span>
            </div>
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#888"
              }}
            >
              ×
            </button>
          </div>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            background: "#fafbfc"
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  flexDirection: msg.sender === "user" ? "row-reverse" : "row"
                }}
              >
                <div style={{
                  marginLeft: msg.sender === "user" ? 0 : 8,
                  marginRight: msg.sender === "user" ? 8 : 0
                }}>
                  {msg.sender === "user" ? <UserIcon /> : <BotIcon />}
                </div>
                <div style={{
                  background: msg.sender === "user" ? "#e6f7ff" : "#f1f1f1",
                  color: "#222",
                  borderRadius: 12,
                  padding: "8px 14px",
                  maxWidth: 220,
                  fontSize: 15
                }}>
                  {msg.text}
                </div>
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
          {/* Input */}
          <div style={{
            padding: 12,
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 15
              }}
            />
            <button
              aria-label="Send"
              onClick={handleSendMessage}
              style={{
                background: "#1677ff",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
