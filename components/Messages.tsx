import React, { useState } from 'react';
import { Settings, MailPlus, ArrowLeft, Send, Image, Smile, Info } from 'lucide-react';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    handle: string;
    avatarUrl: string;
    isVerified?: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  history: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: { name: 'Elon Musk', handle: 'elonmusk', avatarUrl: 'https://picsum.photos/seed/elon/200/200', isVerified: true },
    lastMessage: 'Let’s talk about the API integration.',
    timestamp: '2h',
    unread: true,
    history: [
      { id: 'm1', text: 'Hey, nice work on the app!', sender: 'them', timestamp: '10:30 AM' },
      { id: 'm2', text: 'Thanks Elon! Means a lot.', sender: 'me', timestamp: '10:32 AM' },
      { id: 'm3', text: 'Let’s talk about the API integration.', sender: 'them', timestamp: '11:00 AM' }
    ]
  },
  {
    id: '2',
    user: { name: 'Sam Altman', handle: 'sama', avatarUrl: 'https://picsum.photos/seed/sama/200/200' },
    lastMessage: 'See you at the event.',
    timestamp: '1d',
    history: [
      { id: 'm1', text: 'Are you coming to the AI safety summit?', sender: 'me', timestamp: 'Yesterday' },
      { id: 'm2', text: 'Yes, I will be there.', sender: 'them', timestamp: 'Yesterday' },
      { id: 'm3', text: 'See you at the event.', sender: 'them', timestamp: 'Yesterday' }
    ]
  },
  {
    id: '3',
    user: { name: 'Guillermo Rauch', handle: 'rauchg', avatarUrl: 'https://picsum.photos/seed/vercel/200/200' },
    lastMessage: 'Deployed successfully! ▲',
    timestamp: '3d',
    history: [
        { id: 'm1', text: 'Deployed successfully! ▲', sender: 'them', timestamp: '3 days ago' }
    ]
  }
];

export const Messages: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [inputMessage, setInputMessage] = useState('');

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedConversationId) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversationId) {
        return {
          ...conv,
          lastMessage: inputMessage,
          timestamp: 'Just now',
          history: [
            ...conv.history,
            { id: Date.now().toString(), text: inputMessage, sender: 'me', timestamp: 'Just now' }
          ]
        };
      }
      return conv;
    }));
    setInputMessage('');
  };

  const renderConversationList = () => (
    <div>
       {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Messages</h2>
        <div className="flex gap-4">
             <Settings className="w-5 h-5 text-white cursor-pointer hover:text-twitter-accent" />
             <MailPlus className="w-5 h-5 text-white cursor-pointer hover:text-twitter-accent" />
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2 border-b border-twitter-border">
          <input 
            type="text" 
            placeholder="Search Direct Messages" 
            className="w-full bg-twitter-card rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-twitter-accent text-sm"
          />
      </div>

      {/* List */}
      <div className="pb-20">
        {conversations.map(conv => (
          <div 
            key={conv.id} 
            onClick={() => setSelectedConversationId(conv.id)}
            className={`px-4 py-4 border-b border-twitter-border hover:bg-white/5 cursor-pointer transition-colors flex gap-3 ${conv.unread ? 'bg-white/5' : ''}`}
          >
             <img src={conv.user.avatarUrl} alt={conv.user.handle} className="w-10 h-10 rounded-full object-cover" />
             <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-white truncate text-[15px]">{conv.user.name}</span>
                        <span className="text-twitter-gray text-[14px]">@{conv.user.handle}</span>
                    </div>
                    <span className="text-twitter-gray text-xs">{conv.timestamp}</span>
                </div>
                <p className={`text-[15px] truncate ${conv.unread ? 'text-white font-bold' : 'text-twitter-gray'}`}>
                    {conv.lastMessage}
                </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatView = () => {
    if (!selectedConversation) return null;

    return (
      <div className="flex flex-col h-screen fixed inset-0 sm:relative z-40 bg-black">
        {/* Chat Header */}
        <div className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-twitter-border px-4 py-2 flex items-center gap-4">
            <button onClick={() => setSelectedConversationId(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
                <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 flex flex-col">
                <span className="font-bold text-white text-[16px] leading-5">{selectedConversation.user.name}</span>
                <span className="text-twitter-gray text-xs">@{selectedConversation.user.handle}</span>
            </div>
            <Info className="w-5 h-5 text-white" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 no-scrollbar">
             {/* Profile Spacer */}
             <div className="flex flex-col items-center justify-center border-b border-twitter-border pb-8 mb-4">
                 <img src={selectedConversation.user.avatarUrl} className="w-16 h-16 rounded-full mb-3 object-cover" alt="" />
                 <h3 className="text-lg font-bold text-white">{selectedConversation.user.name}</h3>
                 <p className="text-twitter-gray text-sm">@{selectedConversation.user.handle}</p>
                 <p className="text-twitter-gray text-sm mt-2 flex items-center gap-1 justify-center">
                    {selectedConversation.user.isVerified ? (
                        <>Verified Account <VerifiedBadge className="w-3 h-3" /></>
                    ) : (
                        'Joined March 2025'
                    )}
                 </p>
             </div>

             {selectedConversation.history.map(msg => (
                 <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] ${
                         msg.sender === 'me' 
                         ? 'bg-twitter-accent text-white rounded-br-none' 
                         : 'bg-twitter-card text-white rounded-bl-none'
                     }`}>
                         {msg.text}
                         <div className={`text-[11px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                             {msg.timestamp}
                         </div>
                     </div>
                 </div>
             ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-twitter-border p-3 bg-black sticky bottom-0 sm:bottom-0 bottom-14">
            <div className="bg-twitter-card rounded-2xl flex items-center px-3 py-1">
                <button className="p-2 text-twitter-accent hover:bg-twitter-accent/10 rounded-full">
                    <Image className="w-5 h-5" />
                </button>
                <button className="p-2 text-twitter-accent hover:bg-twitter-accent/10 rounded-full">
                    <Smile className="w-5 h-5" />
                </button>
                <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Start a new message" 
                    className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-gray-500 py-3 px-2"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="p-2 text-twitter-accent hover:bg-twitter-accent/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    );
  };

  if (selectedConversationId) {
    return renderChatView();
  }

  return renderConversationList();
};