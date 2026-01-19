import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, WorkoutPlan, NutritionPlan } from '../types';
import { chatWithCoach } from '../services/geminiService';
import { Send, Bot, User as UserIcon, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  profile: UserProfile;
  workoutPlan?: WorkoutPlan | null;
  nutritionPlan?: NutritionPlan | null;
}

const ChatCoach: React.FC<Props> = ({ profile, workoutPlan, nutritionPlan }) => {
  const defaultMessage: ChatMessage = {
    role: 'model',
    text: `Hi ${profile.name}! I'm Titan, your AI coach. I see you're aiming to ${profile.goal.toLowerCase()}. How can I help you today?`,
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('fitgenius_chat_messages');
            if (saved) {
                // Revive dates
                return JSON.parse(saved, (key, value) => 
                    key === 'timestamp' ? new Date(value) : value
                );
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }
    return [defaultMessage];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('fitgenius_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert to Gemini history format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithCoach(history, input, profile, workoutPlan, nutritionPlan);
      
      const botMsg: ChatMessage = { role: 'model', text: responseText || "I'm having trouble thinking right now.", timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I encountered a connection error. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
      if (confirm("Clear chat history?")) {
          setMessages([defaultMessage]);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-zinc-400">Titan Online</span>
            </div>
            <button 
                onClick={handleClearChat}
                className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                title="Clear Chat History"
            >
                <Trash2 size={16} />
            </button>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-white rounded-tr-none' 
                  : 'bg-emerald-900/30 border border-emerald-500/20 text-zinc-100 rounded-tl-none'
              } prose prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none`}>
                <ReactMarkdown 
                    components={{
                        strong: ({node, ...props}) => <span className="text-emerald-400 font-bold" {...props} />
                    }}
                >
                    {msg.text}
                </ReactMarkdown>
                <div className="text-[10px] opacity-40 mt-2 text-right font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start animate-in fade-in">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full shadow-sm">
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                    <span className="text-xs text-zinc-400">Titan is thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about form, diet, or recovery..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-600"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-700 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatCoach;