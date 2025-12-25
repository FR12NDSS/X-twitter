import React, { useState, useEffect, useRef } from 'react';
import { X, Image, Smile, CalendarClock, MapPin, BadgeCheck } from 'lucide-react';
import { TweetData, User } from '../types';
import { Button } from './Button';
import { MOCK_USERS } from '../utils/mockData';

interface ReplyModalProps {
  tweet: TweetData | null;
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onReply: (tweetId: string, content: string) => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({ tweet, isOpen, currentUser, onClose, onReply }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Mention State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setShowMentions(false);
      // Focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen || !tweet) return null;

  const handleSubmit = () => {
    if (content.trim()) {
      onReply(tweet.id, content);
      onClose();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (handle: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBefore = content.slice(0, cursor);
    const textAfter = content.slice(cursor);
    const lastAtPos = textBefore.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const newTextBefore = textBefore.slice(0, lastAtPos) + `@${handle} `;
      const newContent = newTextBefore + textAfter;
      setContent(newContent);
      setShowMentions(false);
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  };

  const filteredUsers = MOCK_USERS.filter(user => 
    user.handle.toLowerCase().includes(mentionQuery.toLowerCase()) || 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-blue-500/20 backdrop-blur-sm pt-[5%] px-4 animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-twitter-border relative overflow-visible">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-twitter-border/50">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim()} 
            size="sm" 
            className="font-bold"
          >
            Reply
          </Button>
        </div>

        <div className="p-4">
          {/* Original Tweet Context */}
          <div className="flex gap-4 relative">
            <div className="flex flex-col items-center flex-shrink-0 w-10">
               <img 
                 src={tweet.avatarUrl} 
                 alt={tweet.authorName} 
                 className="w-10 h-10 rounded-full object-cover"
               />
               <div className="w-0.5 grow bg-twitter-border my-2"></div>
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-1 text-[15px] mb-1">
                <span className="font-bold text-white truncate">{tweet.authorName}</span>
                <span className="text-twitter-gray truncate">@{tweet.authorHandle}</span>
                <span className="text-twitter-gray">·</span>
                <span className="text-twitter-gray">{tweet.timestamp}</span>
              </div>
              <p className="text-white text-[15px] mb-3">{tweet.content}</p>
              <div className="text-twitter-gray text-[15px]">
                Replying to <span className="text-twitter-accent">@{tweet.authorHandle}</span>
              </div>
            </div>
          </div>

          {/* Reply Input Area */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10">
               <img 
                 src={currentUser.avatarUrl} 
                 alt={currentUser.name} 
                 className="w-10 h-10 rounded-full object-cover"
               />
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Post your reply"
                className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none focus:ring-0 resize-none min-h-[120px] p-2 no-scrollbar outline-none mt-1"
              />
              
              {/* Mention Dropdown */}
              {showMentions && filteredUsers.length > 0 && (
                <div className="absolute top-12 left-0 bg-black border border-twitter-border rounded-xl shadow-2xl z-50 w-64 overflow-hidden max-h-60 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <div 
                            key={user.handle}
                            onClick={() => handleSelectMention(user.handle)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                            <img src={user.avatarUrl} alt={user.handle} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white text-sm truncate">{user.name}</span>
                                    {user.isVerified && <BadgeCheck className="w-3 h-3 text-twitter-accent fill-current" />}
                                </div>
                                <span className="text-twitter-gray text-xs truncate">@{user.handle}</span>
                            </div>
                        </div>
                    ))}
                </div>
              )}
              
              {/* Tools */}
              <div className="flex items-center justify-between border-t border-twitter-border/50 pt-3 mt-2">
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