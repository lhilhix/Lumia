
import React from 'react';
import { Message, Role, UserProfile } from '../types';

interface Props {
  message: Message;
  profile: UserProfile;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, profile, isStreaming }) => {
  const isUser = message.role === Role.USER;
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <i className="fas fa-sparkles text-[8px] text-white"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lumina AI</span>
          </div>
        )}

        <div className={`
          relative group
          ${isUser 
            ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] rounded-tr-sm px-6 py-4 shadow-xl' 
            : 'bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-[2rem] rounded-tl-sm px-6 py-4 border border-white/20 dark:border-slate-700/50'
          }
        `}>
          {message.image && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-white/20">
              <img src={message.image} className="w-full h-auto max-h-[300px] object-cover" alt="User upload" />
            </div>
          )}
          
          <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words font-medium fira-code">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse rounded-sm" style={{ verticalAlign: 'middle' }}></span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1 px-2">
          {isUser && <span className="text-[10px] font-medium text-slate-400/80 uppercase tracking-wider">{profile.username}</span>}
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
          {!isUser && message.content && (
            <button 
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="text-[10px] text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-copy"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
