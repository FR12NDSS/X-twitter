import React from 'react';
import { X, BarChart2, Users, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { TweetData } from '../types';

interface PostStatsModalProps {
  tweet: TweetData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostStatsModal: React.FC<PostStatsModalProps> = ({ tweet, isOpen, onClose }) => {
  if (!isOpen || !tweet) return null;

  // Fallback calculation if reach isn't provided by API
  const reach = tweet.reach || Math.floor(tweet.views * 0.85);
  const engagementRate = ((tweet.likes + tweet.retweets + tweet.replies) / tweet.views * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-md rounded-2xl shadow-2xl border border-twitter-border overflow-hidden">
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-twitter-border">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-twitter-accent" />
            Post Activity
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
           <div className="mb-6 border-b border-twitter-border pb-6">
             <p className="text-twitter-gray text-sm mb-2 uppercase font-bold tracking-wider">Impressions</p>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">{tweet.views.toLocaleString()}</span>
                <span className="text-sm text-green-500 font-medium">Views</span>
             </div>
             <p className="text-sm text-twitter-gray mt-1">Times this post was seen on screen.</p>
           </div>

           <div className="mb-6 border-b border-twitter-border pb-6">
             <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-twitter-gray" />
                <p className="text-twitter-gray text-sm uppercase font-bold tracking-wider">Reach</p>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{reach.toLocaleString()}</span>
             </div>
             <p className="text-sm text-twitter-gray mt-1">Unique accounts that saw this post.</p>
           </div>

           <div className="grid grid-cols-3 gap-4">
             <div className="bg-twitter-card rounded-xl p-3 text-center">
                <Heart className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                <div className="font-bold text-white text-lg">{tweet.likes}</div>
                <div className="text-xs text-twitter-gray">Likes</div>
             </div>
             <div className="bg-twitter-card rounded-xl p-3 text-center">
                <Repeat2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <div className="font-bold text-white text-lg">{tweet.retweets}</div>
                <div className="text-xs text-twitter-gray">Reposts</div>
             </div>
             <div className="bg-twitter-card rounded-xl p-3 text-center">
                <MessageCircle className="w-5 h-5 text-twitter-accent mx-auto mb-1" />
                <div className="font-bold text-white text-lg">{tweet.replies}</div>
                <div className="text-xs text-twitter-gray">Replies</div>
             </div>
           </div>

           <div className="mt-6 text-center">
              <span className="text-twitter-gray text-sm">Engagement Rate: </span>
              <span className="text-white font-bold">{engagementRate}%</span>
           </div>
        </div>

      </div>
    </div>
  );
};