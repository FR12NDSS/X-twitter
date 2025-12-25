import React from 'react';
import { Heart, Repeat2, User, Star, Settings } from 'lucide-react';
import { Button } from './Button';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'follow' | 'reply' | 'mention';
  user: {
    name: string;
    handle: string;
    avatarUrl: string;
  };
  content?: string; // For replies/mentions or the text of the liked tweet
  timestamp: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: { name: 'Sam Altman', handle: 'sama', avatarUrl: 'https://picsum.photos/seed/sama/200/200' },
    content: 'Building the future of social media with AI 🤖',
    timestamp: '2m',
  },
  {
    id: '2',
    type: 'retweet',
    user: { name: 'Elon Musk', handle: 'elonmusk', avatarUrl: 'https://picsum.photos/seed/elon/200/200' },
    content: 'Just launched the new Gemini-powered feed feature! 🚀',
    timestamp: '15m',
  },
  {
    id: '3',
    type: 'follow',
    user: { name: 'React Team', handle: 'reactjs', avatarUrl: 'https://picsum.photos/seed/react/200/200' },
    timestamp: '1h',
  },
  {
    id: '4',
    type: 'reply',
    user: { name: 'Vercel', handle: 'vercel', avatarUrl: 'https://picsum.photos/seed/vercel/200/200' },
    content: 'This looks incredible! Can we integrate this?',
    timestamp: '3h',
  },
  {
    id: '5',
    type: 'like',
    user: { name: 'TypeScript', handle: 'typescript', avatarUrl: 'https://picsum.photos/seed/ts/200/200' },
    content: 'Loving the type safety in this project.',
    timestamp: '5h',
  },
  {
    id: '6',
    type: 'mention',
    user: { name: 'Google DeepMind', handle: 'DeepMind', avatarUrl: 'https://picsum.photos/seed/deepmind/200/200' },
    content: 'Hey @demouser, check out our latest Gemini 1.5 updates!',
    timestamp: '1d',
  },
];

export const Notifications: React.FC = () => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-7 h-7 text-pink-600 fill-current" />;
      case 'retweet': return <Repeat2 className="w-7 h-7 text-green-500" />;
      case 'follow': return <User className="w-7 h-7 text-twitter-accent fill-current" />;
      case 'reply': 
      case 'mention': return <Star className="w-7 h-7 text-purple-500 fill-current" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Notifications</h2>
        <Settings className="w-5 h-5 text-white cursor-pointer hover:text-twitter-accent" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-twitter-border sticky top-[53px] z-20 bg-black/60 backdrop-blur-md">
        <div className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4 relative">
            <span className="font-bold text-white">All</span>
            <div className="absolute bottom-0 h-1 w-10 bg-twitter-accent rounded-full"></div>
        </div>
        <div className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4">
            <span className="text-twitter-gray font-medium">Verified</span>
        </div>
        <div className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4">
            <span className="text-twitter-gray font-medium">Mentions</span>
        </div>
      </div>

      {/* List */}
      <div className="pb-20">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div key={notif.id} className="border-b border-twitter-border p-4 hover:bg-white/5 cursor-pointer transition-colors flex gap-3">
            <div className="flex-shrink-0 w-10 flex justify-end">
              {getIcon(notif.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <img src={notif.user.avatarUrl} alt={notif.user.handle} className="w-8 h-8 rounded-full object-cover" />
              </div>
              
              <p className="text-white text-[15px] mb-1">
                <span className="font-bold">{notif.user.name}</span>
                <span className="text-twitter-gray ml-1">
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'retweet' && 'reposted your post'}
                  {notif.type === 'follow' && 'followed you'}
                  {notif.type === 'reply' && 'replied to you'}
                  {notif.type === 'mention' && 'mentioned you'}
                </span>
              </p>

              {notif.content && (
                 <p className="text-twitter-gray text-[15px] leading-snug">
                   {notif.content}
                 </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};