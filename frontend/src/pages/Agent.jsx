import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Agent({ user }) {
  const defaultGreeting = { 
    role: 'assistant', 
    content: "Hello! I'm your AI assistant. I can answer questions or even schedule posts for you (e.g., type '/' to schedule). How can I help?", 
    timestamp: Date.now() 
  };

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem(`agent_chats_${user._id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [{ id: Date.now().toString(), title: 'New Chat', messages: [defaultGreeting] }];
  });
  
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  
  // Schedule Form State
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleContent, setScheduleContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.title = 'AI Agent | Orbit';
  }, []);

  useEffect(() => {
    localStorage.setItem(`agent_chats_${user._id}`, JSON.stringify(chats));
  }, [chats, user._id]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateChatMessages = (chatId, newMessages) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        let newTitle = c.title;
        if (newTitle === 'New Chat' && newMessages.length > 1) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.substring(0, 25) + (firstUserMsg.content.length > 25 ? '...' : '');
          }
        }
        return { ...c, title: newTitle, messages: newMessages };
      }
      return c;
    }));
  };

  const createNewChat = () => {
    const newChat = { id: Date.now().toString(), title: 'New Chat', messages: [defaultGreeting] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        const newChat = { id: Date.now().toString(), title: 'New Chat', messages: [defaultGreeting] };
        setActiveChatId(newChat.id);
        return [newChat];
      }
      if (activeChatId === id) {
        setActiveChatId(updated[0].id);
      }
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val === '/') {
      setShowCommands(true);
    } else if (!val.startsWith('/')) {
      setShowCommands(false);
    }
  };

  const selectCommand = (cmd) => {
    if (cmd === '/schedule') {
      setShowScheduleForm(true);
      setInput('');
      setShowCommands(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.trim() === '/schedule') {
        selectCommand('/schedule');
        return;
    }

    const userMsgObj = { role: 'user', content: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsgObj];
    updateChatMessages(activeChatId, newMessages);
    setInput('');
    setIsLoading(true);
    setShowCommands(false);

    try {
      const res = await axios.post(`${API_URL}/agent/chat`, {
        userId: user._id,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        localTime: new Date().toString(),
      });

      updateChatMessages(activeChatId, [...newMessages, { role: 'assistant', content: res.data.reply, timestamp: Date.now() }]);
    } catch (err) {
      console.error(err);
      updateChatMessages(activeChatId, [...newMessages, { role: 'assistant', content: "Sorry, I ran into an error processing your request.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleContent || !scheduleDate || !scheduleTime) return;
    
    setIsLoading(true);
    setShowScheduleForm(false);
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    
    const userMsgObj = { 
        role: 'user', 
        content: `[Action: Schedule Post]\nContent: "${scheduleContent}"\nDate: ${scheduledDateTime.toLocaleString()}`, 
        timestamp: Date.now() 
    };
    
    const newMessages = [...messages, userMsgObj];
    updateChatMessages(activeChatId, newMessages);
    
    try {
        const res = await axios.post(`${API_URL}/agent/schedule`, {
            userId: user._id,
            content: scheduleContent,
            scheduledFor: scheduledDateTime.toISOString()
        });
        
        updateChatMessages(activeChatId, [...newMessages, { role: 'assistant', content: res.data.reply, timestamp: Date.now() }]);
    } catch (err) {
        console.error(err);
        updateChatMessages(activeChatId, [...newMessages, { role: 'assistant', content: "Sorry, failed to schedule your post.", timestamp: Date.now() }]);
    } finally {
        setIsLoading(false);
        setScheduleContent('');
        setScheduleDate('');
        setScheduleTime('');
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] max-w-6xl mx-auto py-4 px-4">
      {/* Sidebar for Chat History */}
      <div className="w-72 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-xl flex flex-col hidden md:flex overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-gray-900/60">
            <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors shadow-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Chat
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map(chat => (
                <div 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group ${activeChatId === chat.id ? 'bg-gray-800/80 border border-gray-700' : 'hover:bg-gray-800/40 border border-transparent'}`}
                >
                    <div className="flex items-center gap-3 truncate">
                        <svg className={`w-5 h-5 flex-shrink-0 ${activeChatId === chat.id ? 'text-indigo-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <span className={`text-sm truncate ${activeChatId === chat.id ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>{chat.title}</span>
                    </div>
                    <button 
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete chat"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-900/60 flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-100">AI Agent</h2>
                <p className="text-sm text-indigo-400 font-medium">Online</p>
            </div>
          </div>
          {/* Mobile New Chat Button */}
          <button 
            onClick={createNewChat}
            className="md:hidden bg-indigo-600 p-2 rounded-xl text-white shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>

        {/* Schedule Form Modal Overlay */}
        {showScheduleForm && (
            <div className="absolute inset-0 z-20 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Schedule a Post
                    </h3>
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Post Content</label>
                            <textarea 
                                value={scheduleContent}
                                onChange={(e) => setScheduleContent(e.target.value)}
                                className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                rows="3"
                                placeholder="What do you want to post?"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                                <input 
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                                <input 
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button"
                                onClick={() => setShowScheduleForm(false)}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium shadow-lg"
                            >
                                Schedule Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm shadow-md'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-sm text-gray-400 flex gap-2 shadow-md">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/60 relative">
          
          {showCommands && (
            <div className="absolute bottom-full left-4 mb-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button 
                type="button"
                onClick={() => selectCommand('/schedule')}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 flex flex-col transition-colors border-b border-gray-700/50 last:border-0"
              >
                <span className="font-bold text-indigo-400">/schedule</span>
                <span className="text-xs text-gray-400">Open precise scheduling form</span>
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask a question or type '/' for commands..."
              className="flex-1 bg-black/40 border border-gray-700 rounded-full py-3.5 pl-6 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-100 placeholder-gray-500 shadow-inner"
              disabled={isLoading || showScheduleForm}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || showScheduleForm}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-gray-700 disabled:text-gray-500 text-white p-2.5 rounded-full transition-colors flex items-center justify-center h-10 w-10 shadow-lg"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
