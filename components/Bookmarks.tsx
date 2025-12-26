import React from 'react';
import { TweetData, User } from '../types';
import { TweetCard } from './TweetCard';
import { Bookmark } from 'lucide-react';
import { userService } from '../services/userService';

interface BookmarksProps {
  tweets: TweetData[];
  onReply: (tweet: TweetData) => void;
  onClick: (tweet: TweetData) => void;
  onBookmark: (tweetId: string) => void;
  onHashtagClick?: (tag: string) => void;
  onUserClick?: (handle: string) => void;
  onDelete?: (tweetId: string) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ tweets, onReply, onClick, onBookmark, onHashtagClick, onUserClick, onDelete }) => {
  const bookmarkedTweets = tweets.filter(t => t.isBookmarked);
  const currentUser = userService.getSession();

  return (
    <div>
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3">
        <h2 className="text-xl font-bold text-white">Bookmarks</h2>
        <p className="text-xs text-twitter-gray">@{bookmarkedTweets.length > 0 ? 'user' : ''}</p>
      </div>

      <div className="pb-20">
        {bookmarkedTweets.length > 0 ? (
          bookmarkedTweets.map(tweet => (
            <TweetCard 
              key={tweet.id} 
              tweet={tweet} 
              currentUser={currentUser}
              onReply={onReply}
              onClick={onClick}
              onBookmark={onBookmark}
              onHashtagClick={onHashtagClick}
              onUserClick={onUserClick}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="w-full max-w-xs mb-6">
               {/* Illustration placeholder */}
               <Bookmark className="w-20 h-20 text-twitter-gray mx-auto mb-4 opacity-50" />
             </div>
             <h2 className="text-3xl font-extrabold text-white mb-2">Save posts for later</h2>
             <p className="text-twitter-gray text-[15px] max-w-sm mb-6">
               Bookmark posts to easily find them again in the future.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};