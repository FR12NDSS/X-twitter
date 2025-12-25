import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export const GeminiPage: React.FC = () => {
    const [input, setInput] = useState('');
    const [chat, setChat] = useState<{role: 'user'|'model', text: string}[]>([
        {role: 'model', text: 'Hi! I\'m Gemini, your AI assistant integrated directly into BuzzStream. Ask me anything about the trends, code, or just to write a tweet for you!'}
    ]);

    const handleSend = () => {
        if(!input.trim()) return;
        const newChat = [...chat, { role: 'user' as const, text: input }];
        setChat(newChat);
        setInput('');
        
        // Mock response
        setTimeout(() => {
            setChat([...newChat, { role: 'model', text: "I'm a simulated response for the UI demo. In a real app, I would call the Gemini API here! 🤖" }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-53px)] sm:h-screen">
             <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-twitter-accent" />
                 <h2 className="text-xl font-bold text-white">Gemini</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-twitter-accent text-white rounded-br-none' : 'bg-twitter-card text-white rounded-bl-none'}`}>
                             {msg.text}
                         </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-twitter-border pb-20 sm:pb-4">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="w-full bg-twitter-card border-none rounded-2xl py-3 pl-4 pr-12 text-white focus:ring-1 focus:ring-twitter-accent"
                        placeholder="Ask Gemini..."
                    />
                    <button 
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-twitter-accent hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-center text-xs text-twitter-gray mt-2">Gemini may display inaccurate info, including about people, so double-check its responses.</p>
            </div>
        </div>
    );
};