import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, Loader2, Sparkles, User } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "现在首套房贷款利率是多少？",
  "等额本息和等额本金有什么区别？",
  "LPR是什么意思？",
  "办理经营贷需要什么材料？",
  "提前还款有违约金吗？"
];

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '您好，我是您的智能信贷助手。请问有什么可以帮您？'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await generateAIResponse(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - iOS Navigation Bar Style */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3 mx-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles size={16} fill="white" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-900">智能助手</h2>
            <p className="text-[10px] text-gray-500 font-medium">Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-white to-[#F9F9FB]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              
              {msg.role === 'model' && (
                 <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mb-1">
                    <Bot size={14} className="text-gray-600" />
                 </div>
              )}
              
              <div 
                className={`px-4 py-3 text-[15px] leading-relaxed shadow-sm break-words ${
                  msg.role === 'user' 
                    ? 'bg-[#007AFF] text-white rounded-[20px] rounded-br-sm' 
                    : 'bg-[#E9E9EB] text-gray-900 rounded-[20px] rounded-bl-sm'
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex items-end gap-2">
               <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mb-1">
                  <Bot size={14} className="text-gray-600" />
               </div>
               <div className="px-4 py-3 bg-[#E9E9EB] rounded-[20px] rounded-bl-sm">
                  <Loader2 size={16} className="text-gray-500 animate-spin" />
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 shrink-0 mb-[80px] lg:mb-0">
        {/* Chips */}
        {messages.length < 3 && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mask-linear">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(q)}
                className="text-xs font-medium px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
        </div>
        )}

        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="iMessage"
            className="w-full pl-5 pr-12 py-3.5 bg-gray-100 border-none rounded-full focus:ring-0 focus:bg-gray-200/70 outline-none transition-all text-[15px] text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 p-2 bg-[#007AFF] text-white rounded-full hover:bg-blue-600 disabled:opacity-0 disabled:scale-75 transition-all shadow-md"
          >
            <Send size={16} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;