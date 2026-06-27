
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, Message, Role } from '../types';
import { GeminiService } from '../services/geminiService';
import MessageBubble from './MessageBubble';

interface Props {
  profile: UserProfile;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  toggleTheme: () => void;
  clearChat: () => void;
}

const ChatInterface: React.FC<Props> = ({ profile, messages, setMessages, toggleTheme, clearChat }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    let assistantContent = '';
    const assistantMsgId = (Date.now() + 1).toString();
    
    // Create initial placeholder for streaming
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: Role.ASSISTANT,
      content: '',
      timestamp: new Date()
    }]);

    try {
      const stream = GeminiService.streamChat(messages, userMsg.content, userMsg.image);
      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: assistantContent } : msg
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-6xl h-[92vh] flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      
      {/* Header */}
      <header className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={profile.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20" alt="Avatar" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Lumina AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-emerald-500">Live Services Active</span>
              <span className="text-[10px] text-slate-400">• v3.0 Premium</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-rose-500 group"
            title="Clear Chat History"
          >
            <i className="fas fa-trash-can group-hover:scale-110 transition-transform"></i>
          </button>
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 transition-all hover:scale-105 active:scale-95 text-slate-600 dark:text-slate-300"
          >
            <i className={`fas ${profile.theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center">
              <i className="fas fa-comment-dots text-3xl text-slate-400"></i>
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Start a new conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ask about anything, analyze images, or just chat with Lumina's advanced intelligence.</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => {
          const isLatest = index === messages.length - 1;
          const isMessageStreaming = isLatest && isTyping && msg.role === Role.ASSISTANT;
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              profile={profile} 
              isStreaming={isMessageStreaming}
            />
          );
        })}
        
        {isTyping && messages[messages.length-1]?.content === '' && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-[1.5rem] px-6 py-4 flex items-center gap-1 border border-white/20 dark:border-slate-700/50">
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {isTyping && messages[messages.length-1]?.content !== '' && (
          <div className="flex items-center gap-2 pl-2 text-xs font-medium text-slate-400 dark:text-slate-500 select-none animate-in fade-in duration-300">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/30 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-slate-600 dark:text-slate-300">Lumina is typing...</span>
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="px-8 py-6 shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
          {selectedImage && (
            <div className="absolute bottom-full left-0 mb-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 group flex items-start gap-2">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-xl" alt="Preview" />
              <button 
                type="button"
                onClick={() => setSelectedImage(null)}
                className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center -mt-1 -mr-1 hover:bg-rose-500 transition-colors"
              >
                <i className="fas fa-times text-[10px]"></i>
              </button>
            </div>
          )}

          <div className="relative flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 pr-2.5 shadow-lg shadow-slate-200/50 dark:shadow-none focus-within:border-blue-500 dark:focus-within:border-blue-600 transition-all duration-300">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <i className="fas fa-image"></i>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message Lumina..."
              className="flex-1 bg-transparent px-3 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
            />
            
            <button 
              type="submit"
              disabled={isTyping || (!inputValue.trim() && !selectedImage)}
              className="bg-slate-900 dark:bg-blue-600 disabled:opacity-30 text-white w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Lumina Intelligence • Encrypted Channel</p>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
