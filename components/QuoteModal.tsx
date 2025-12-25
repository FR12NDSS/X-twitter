import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Smile, CalendarClock, MapPin } from 'lucide-react';
import { TweetData, User } from '../types';
import { Button } from './Button';

interface QuoteModalProps {
  tweet: TweetData | null;
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onQuote: (content: string, quotedTweet: TweetData) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ tweet, isOpen, currentUser, onClose, onQuote }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      // Focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !tweet) return null;

  const handleSubmit = () => {
    onQuote(content, tweet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-blue-500/20 backdrop-blur-sm pt-[5%] px-4 animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-twitter-border relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-twitter-border/50">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <Button 
            onClick={handleSubmit} 
            size="sm" 
            className="font-bold"
          >
            Post
          </Button>
        </div>

        <div className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10">
               <img 
                 src={currentUser.avatarUrl} 
                 alt={currentUser.name} 
                 className="w-10 h-10 rounded-full object-cover"
               />
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment!"
                className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none focus:ring-0 resize-none min-h-[60px] p-2 no-scrollbar outline-none mt-1"
              />
              
              {/* Quoted Tweet Preview */}
              <div className="mt-2 border border-twitter-border rounded-xl p-3 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                    <img src={tweet.avatarUrl} alt={tweet.authorHandle} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-bold text-white text-sm truncate">{tweet.authorName}</span>
                    <span className="text-twitter-gray text-sm truncate">@{tweet.authorHandle}</span>
                    <span className="text-twitter-gray text-sm">· {tweet.timestamp}</span>
                </div>
                <p className="text-white text-sm whitespace-pre-wrap line-clamp-3">{tweet.content}</p>
              </div>

              {/* Tools */}
              <div className="flex items-center justify-between border-t border-twitter-border/50 pt-3 mt-4">
                 <div className="flex gap-0 text-twitter-accent">
                    <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                      <CalendarClock className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </button>
                 </div>
                 
                 {content.length > 0 && (
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full border-2 border-twitter-border relative">
                        <div 
                            className="absolute inset-0 rounded-full border-2 border-twitter-accent transition-all duration-300"
                            style={{ clipPath: `inset(0 ${Math.max(0, 100 - (content.length / 2.8))}% 0 0)` }} 
                        />
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};