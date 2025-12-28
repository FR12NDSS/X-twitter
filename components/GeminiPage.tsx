import React, { useState } from 'react';
import { Send, ChevronDown, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const GrokIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <g>
            <path d="M2.5 2.5h19v19h-19z" fill="none" stroke="currentColor" strokeWidth="2"></path>
            <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square"></path>
        </g>
    </svg>
);

type GrokMode = 'regular' | 'fun';
type GrokModel = 'grok-2' | 'grok-2-mini';

export const GeminiPage: React.FC = () => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState<GrokMode>('fun');
    const [model, setModel] = useState<GrokModel>('grok-2');
    const [chat, setChat] = useState<{role: 'user'|'model', text: string}[]>([
        {role: 'model', text: 'Grok here.'}
    ]);
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = async () => {
        if(!input.trim()) return;
        
        const userMsg = input;
        const newChat = [...chat, { role: 'user' as const, text: userMsg }];
        setChat(newChat);
        setInput('');
        setIsThinking(true);

        try {
            const apiKey = process.env.API_KEY || '';
            const ai = new GoogleGenAI({ apiKey });
            
            // Adjust personality based on mode
            const systemInstruction = mode === 'fun' 
                ? "You are Grok, an AI modeled after the Hitchhiker's Guide to the Galaxy. You are witty, rebellious, slightly sarcastic, and have a sense of humor. You answer questions accurately but with flair and personality. Do not be overly safe or robotic."
                : "You are Grok, a helpful and accurate AI assistant. Provide direct, factual, and neutral answers.";

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMsg,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            setChat([...newChat, { role: 'model', text: response.text || "Thinking..." }]);
        } catch (e) {
            console.error(e);
            // Fallback for demo
            setTimeout(() => {
                const mockResponse = mode === 'fun' 
                    ? "My circuits are currently frying trying to process that. Try again later, human." 
                    : "I am unable to process that request at the moment.";
                setChat([...newChat, { role: 'model', text: mockResponse }]);
            }, 1000);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-53px)] sm:h-screen bg-black relative overflow-hidden">
             {/* Authentic Background Gradient */}
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                 <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-white blur-[150px] rounded-full"></div>
             </div>

             {/* Header Controls */}
             <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
                 <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
                     <span className="text-lg font-bold text-white flex items-center gap-1">
                         {model === 'grok-2' ? 'Grok 2' : 'Grok 2 mini'}
                         <ChevronDown className="w-4 h-4 text-twitter-gray" />
                     </span>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-twitter-card rounded-full p-1 border border-twitter-border">
                     <button 
                        onClick={() => setMode('regular')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${mode === 'regular' ? 'bg-white/10 text-white' : 'text-twitter-gray hover:text-white'}`}
                     >
                         Regular
                     </button>
                     <button 
                        onClick={() => setMode('fun')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all flex items-center gap-1 ${mode === 'fun' ? 'bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-white shadow-lg' : 'text-twitter-gray hover:text-white'}`}
                     >
                         <Sparkles className="w-3 h-3" /> Fun
                     </button>
                 </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {chat.length === 1 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center pb-20 animate-in fade-in zoom-in duration-500">
                        <GrokIcon className="w-24 h-24 text-white mb-6 opacity-90" />
                        <h1 className="text-3xl font-bold text-white mb-2">Grok</h1>
                        <p className="text-twitter-gray max-w-xs mx-auto">
                            The most powerful AI in the universe. Ask me anything.
                        </p>
                    </div>
                ) : (
                    chat.slice(1).map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                             <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed ${
                                 msg.role === 'user' 
                                 ? 'bg-twitter-accent text-white rounded-br-none' 
                                 : 'bg-transparent text-white'
                             }`}>
                                 {msg.role === 'model' && <div className="font-bold mb-1 flex items-center gap-2"><GrokIcon className="w-4 h-4"/> Grok</div>}
                                 {msg.text}
                             </div>
                        </div>
                    ))
                )}
                {isThinking && (
                    <div className="flex justify-start animate-in fade-in px-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-twitter-accent rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-twitter-accent rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-twitter-accent rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div className="h-12"></div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-twitter-border pb-20 sm:pb-6 bg-black/80 backdrop-blur-md">
                <div className="relative max-w-3xl mx-auto">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="w-full bg-twitter-card border border-twitter-border/50 rounded-2xl py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:ring-2 focus:ring-twitter-accent/50 focus:border-twitter-accent transition-all shadow-inner"
                        placeholder="Ask Grok..."
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4 fill-current" />
                    </button>
                </div>
                <p className="text-center text-[11px] text-twitter-gray mt-3 opacity-60">
                    Grok is an early feature and can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};