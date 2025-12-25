import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Repeat2, Heart, Share, BarChart2, MoreHorizontal } from 'lucide-react';
import { TweetData, TweetComment } from '../types';
import { Button } from './Button';
import { formatText } from '../utils/textUtils';
import { VerifiedBadge } from './VerifiedBadge';

interface TweetDetailProps {
  tweet: TweetData;
  onBack: () => void;
  onReply: (tweet: TweetData) => void;
}

export const TweetDetail: React.FC<TweetDetailProps> = ({ tweet, onBack, onReply }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likes);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets);
  
  // Use tweet.views or fallback
  const viewCount = tweet.views || (tweet.likes * 42) || 1000;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleRetweet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRetweeted) {
      setRetweetsCount(prev => prev - 1);
      setIsRetweeted(false);
    } else {
      setRetweetsCount(prev => prev + 1);
      setIsRetweeted(true);
    }
  };

  const formatFullDate = () => {
    const date = new Date(); // Using current date for demo as timestamp is relative
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' · ' + 
           date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatNumber = (num: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
  };

  // Convert a comment to TweetData structure so it can be passed to ReplyModal
  const handleReplyToComment = (comment: TweetComment) => {
    const commentAsTweet: TweetData = {
        id: comment.id,
        authorName: comment.authorName,
        authorHandle: comment.authorHandle,
        avatarUrl: comment.avatarUrl,
        content: comment.content,
        timestamp: comment.timestamp,
        likes: comment.likes,
        retweets: 0,
        replies: 0,
        views: 0,
        comments: []
    };
    onReply(commentAsTweet);
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Post</h2>
      </div>

      <div className="p-4">
        {/* Main Tweet Author */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <img 
              src={tweet.avatarUrl} 
              alt={tweet.authorName} 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white">{tweet.authorName}</span>
                {tweet.isVerified && (
                  <VerifiedBadge className="w-4 h-4" />
                )}
              </div>
              <span className="text-twitter-gray">@{tweet.authorHandle}</span>
            </div>
          </div>
          <button className="text-twitter-gray hover:text-twitter-accent p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="text-xl text-white whitespace-pre-wrap leading-normal mb-4">
          {formatText(tweet.content)}
        </div>

        {/* Date and Views */}
        <div className="border-b border-twitter-border pb-4 mb-4">
          <div className="text-twitter-gray text-[15px] mb-1">
            {formatFullDate()}
            <span className="mx-1">·</span>
            <span className="text-white font-bold">{viewCount.toLocaleString()}</span>
            <span className="ml-1">Views</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 border-b border-twitter-border pb-4 mb-4">
          <div className="text-sm">
            <span className="font-bold text-white mr-1">{formatNumber(retweetsCount)}</span>
            <span className="text-twitter-gray">Retweets</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-white mr-1">12</span>
            <span className="text-twitter-gray">Quotes</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-white mr-1">{formatNumber(likesCount)}</span>
            <span className="text-twitter-gray">Likes</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex justify-around border-b border-twitter-border pb-4 mb-4">
           <button 
             onClick={() => onReply(tweet)}
             className="p-2 text-twitter-gray hover:text-twitter-accent rounded-full hover:bg-twitter-accent/10 transition-colors"
           >
             <MessageCircle className="w-5 h-5" />
           </button>
           <button 
             onClick={handleRetweet}
             className={`p-2 rounded-full transition-colors ${isRetweeted ? 'text-green-500 bg-green-500/10' : 'text-twitter-gray hover:text-green-500 hover:bg-green-500/10'}`}
           >
             <Repeat2 className="w-5 h-5" />
           </button>
           <button 
             onClick={handleLike}
             className={`p-2 rounded-full transition-colors ${isLiked ? 'text-pink-600 bg-pink-600/10' : 'text-twitter-gray hover:text-pink-600 hover:bg-pink-600/10'}`}
           >
             <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
           </button>
           <button className="p-2 text-twitter-gray hover:text-twitter-accent rounded-full hover:bg-twitter-accent/10 transition-colors">
             <Share className="w-5 h-5" />
           </button>
        </div>

        {/* Reply Composer Placeholder */}
        <div className="flex gap-4 items-center mb-6 py-2">
           <div className="w-10 h-10 rounded-full bg-twitter-border/50 overflow-hidden">
               <img src="https://picsum.photos/seed/currentUser/200/200" alt="Me" className="w-full h-full object-cover" />
           </div>
           <div 
             className="text-twitter-gray text-xl cursor-text flex-1"
             onClick={() => onReply(tweet)}
           >
             Post your reply
           </div>
           <Button disabled size="sm" className="opacity-50">Reply</Button>
        </div>

        {/* Comments List */}
        <div className="space-y-0">
          {tweet.comments && tweet.comments.length > 0 ? (
            tweet.comments.map((comment) => (
              <div key={comment.id} className="border-b border-twitter-border py-3">
                <div className="flex gap-3">
                  <img 
                    src={comment.avatarUrl} 
                    alt={comment.authorName} 
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-[15px] mb-0.5">
                      <span className="font-bold text-white">{comment.authorName}</span>
                      <span className="text-twitter-gray">@{comment.authorHandle}</span>
                      <span className="text-twitter-gray">·</span>
                      <span className="text-twitter-gray">{comment.timestamp}</span>
                    </div>
                    <div className="text-twitter-gray text-[13px] mb-1">
                      Replying to <span className="text-twitter-accent">@{tweet.authorHandle}</span>
                    </div>
                    <p className="text-white text-[15px] mb-2">{formatText(comment.content)}</p>
                    
                    {/* Comment Actions */}
                    <div className="flex justify-between max-w-xs text-twitter-gray">
                       <button 
                        onClick={() => handleReplyToComment(comment)}
                        className="group flex items-center gap-1 hover:text-twitter-accent transition-colors text-xs"
                       >
                         <div className="p-2 rounded-full group-hover:bg-twitter-accent/10">
                            <MessageCircle className="w-4 h-4" />
                         </div>
                       </button>
                       <button className="group flex items-center gap-1 hover:text-green-500 transition-colors text-xs">
                         <div className="p-2 rounded-full group-hover:bg-green-500/10">
                            <Repeat2 className="w-4 h-4" />
                         </div>
                       </button>
                       <button className="group flex items-center gap-1 hover:text-pink-600 transition-colors text-xs">
                         <div className="p-2 rounded-full group-hover:bg-pink-600/10">
                            <Heart className="w-4 h-4" />
                         </div>
                         <span>{comment.likes > 0 ? comment.likes : ''}</span>
                       </button>
                       <button className="group flex items-center gap-1 hover:text-twitter-accent transition-colors text-xs">
                         <div className="p-2 rounded-full group-hover:bg-twitter-accent/10">
                            <BarChart2 className="w-4 h-4" />
                         </div>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-twitter-gray">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};