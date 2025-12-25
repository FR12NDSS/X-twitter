import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Repeat2, Heart, Share, BarChart2, BadgeCheck, CalendarClock, PenLine, Link, Bookmark, Trash2, MoreHorizontal, UserPlus, UserMinus, Frown, Undo2 } from 'lucide-react';
import { TweetData } from '../types';
import { formatText } from '../utils/textUtils';
import { MOCK_USERS } from '../utils/mockData';

interface TweetCardProps {
  tweet: TweetData;
  onReply?: (tweet: TweetData) => void;
  onClick?: (tweet: TweetData) => void;
  onBookmark?: (tweetId: string) => void;
  onQuote?: (tweet: TweetData) => void;
  onAnalytics?: (tweet: TweetData) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet, onReply, onClick, onBookmark, onQuote, onAnalytics }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likes);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Undo State
  const [undoToast, setUndoToast] = useState<{ 
    type: 'like' | 'retweet' | 'follow', 
    action?: 'followed' | 'unfollowed',
    visible: boolean 
  } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Dropdown states
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const retweetRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (retweetRef.current && !retweetRef.current.contains(event.target as Node)) {
        setShowRetweetMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const showUndoNotification = (type: 'like' | 'retweet' | 'follow', action?: 'followed' | 'unfollowed') => {
    // Clear existing timer
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    setUndoToast({ type, action, visible: true });
    
    // Set new timer
    undoTimeoutRef.current = setTimeout(() => {
        setUndoToast(null);
    }, 4000);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    if (undoToast?.type === 'like') {
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
    } else if (undoToast?.type === 'retweet') {
        setRetweetsCount(prev => prev - 1);
        setIsRetweeted(false);
    } else if (undoToast?.type === 'follow') {
        const wasFollowed = undoToast.action === 'followed';
        setIsFollowing(!wasFollowed);
        
        // Revert mock data
        const user = MOCK_USERS.find(u => u.handle.toLowerCase() === tweet.authorHandle.toLowerCase());
        if (user) {
            if (user.followers === undefined) user.followers = 0;
            if (wasFollowed) {
                user.followers -= 1; // Revert follow
            } else {
                user.followers += 1; // Revert unfollow
            }
        }
    }
    
    setUndoToast(null);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we are currently showing an undo toast for this action, clear it
    if (undoToast?.type === 'like') {
        setUndoToast(null);
    }

    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
      showUndoNotification('like');
    }
  };

  const toggleRetweetMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRetweetMenu(!showRetweetMenu);
    setShowShareMenu(false);
    setShowMoreMenu(false);
  };

  const handleRetweetAction = (e: React.MouseEvent, type: 'repost' | 'quote') => {
    e.stopPropagation();
    setShowRetweetMenu(false);
    
    if (type === 'repost') {
      // If we are currently showing an undo toast for this action, clear it
      if (undoToast?.type === 'retweet') {
         setUndoToast(null);
      }

      if (isRetweeted) {
        setRetweetsCount(prev => prev - 1);
        setIsRetweeted(false);
      } else {
        setRetweetsCount(prev => prev + 1);
        setIsRetweeted(true);
        showUndoNotification('retweet');
      }
    } else {
      if (onQuote) {
        onQuote(tweet);
      }
    }
  };

  const toggleShareMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
    setShowRetweetMenu(false);
    setShowMoreMenu(false);
  };

  const handleShareAction = async (e: React.MouseEvent, type: 'copy' | 'bookmark') => {
    e.stopPropagation();
    setShowShareMenu(false);
    
    if (type === 'bookmark') {
      if (onBookmark) onBookmark(tweet.id);
    } else if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(`https://buzzstream.ai/${tweet.authorHandle}/status/${tweet.id}`);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const toggleMoreMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
    setShowRetweetMenu(false);
    setShowShareMenu(false);
  };

  const handleFollowUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle state
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    
    // Update Mock Data
    const user = MOCK_USERS.find(u => u.handle.toLowerCase() === tweet.authorHandle.toLowerCase());
    
    if (user) {
        if (!user.followers) user.followers = 1000;
        
        if (newFollowState) {
            user.followers += 1;
            console.log(`Followed ${user.handle}. Followers: ${user.followers}`);
        } else {
            user.followers -= 1;
            console.log(`Unfollowed ${user.handle}. Followers: ${user.followers}`);
        }
    } else {
        console.warn(`User @${tweet.authorHandle} not found in mock data, but local state updated.`);
    }

    showUndoNotification('follow', newFollowState ? 'followed' : 'unfollowed');
    setShowMoreMenu(false);
  };

  const handleMoreAction = (e: React.MouseEvent, action: 'analytics' | 'not_interested' | 'follow') => {
    e.stopPropagation();
    setShowMoreMenu(false);
    
    if (action === 'analytics') {
      if (onAnalytics) onAnalytics(tweet);
    } else if (action === 'follow') {
        handleFollowUser(e);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) {
      onReply(tweet);
    }
  };

  const handleAnalyticsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAnalytics) {
        onAnalytics(tweet);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(tweet);
    }
  };

  const formatNumber = (num: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
  };

  // Ensure view count has a fallback if data is missing
  const displayViews = tweet.views || (tweet.likes * 42) || 0;

  return (
    <>
        <article 
        onClick={handleCardClick}
        className="border-b border-twitter-border p-4 hover:bg-white/5 transition-colors cursor-pointer relative"
        >
        <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
            <img 
                src={tweet.avatarUrl} 
                alt={tweet.authorName} 
                className="w-10 h-10 rounded-full object-cover"
            />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-[15px] mb-1 overflow-hidden flex-wrap">
                    <span className="font-bold text-white truncate">{tweet.authorName}</span>
                    {tweet.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-twitter-accent fill-current flex-shrink-0" />
                    )}
                    <span className="text-twitter-gray truncate">@{tweet.authorHandle}</span>
                    <span className="text-twitter-gray flex-shrink-0">·</span>
                    
                    {tweet.isScheduled ? (
                    <div className="flex items-center gap-1 text-twitter-gray flex-shrink-0">
                        <CalendarClock className="w-3 h-3" />
                        <span className="text-twitter-gray hover:underline">{tweet.timestamp}</span>
                    </div>
                    ) : (
                    <span className="text-twitter-gray hover:underline flex-shrink-0">{tweet.timestamp}</span>
                    )}

                    {/* Follow Button (Visible if not following) */}
                    {!isFollowing && (
                        <button 
                            onClick={handleFollowUser}
                            className="ml-2 text-twitter-accent text-xs font-bold hover:bg-twitter-accent/10 px-2 py-0.5 rounded-full transition-colors z-10"
                        >
                            Follow
                        </button>
                    )}
                </div>

                {/* More Menu (Three Dots) */}
                <div className="relative" ref={moreRef}>
                    <button 
                    onClick={toggleMoreMenu}
                    className="text-twitter-gray hover:text-twitter-accent p-1 rounded-full hover:bg-twitter-accent/10 transition-colors -mt-1 -mr-2"
                    >
                    <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {/* Dropdown */}
                    {showMoreMenu && (
                        <div className="absolute top-6 right-0 bg-black border border-twitter-border rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] z-50 w-52 overflow-hidden">
                            <div 
                                onClick={(e) => handleMoreAction(e, 'not_interested')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Frown className="w-4 h-4" /> Not interested
                            </div>
                            <div 
                                onClick={(e) => handleMoreAction(e, 'follow')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus className="w-4 h-4" /> Unfollow @{tweet.authorHandle}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" /> Follow @{tweet.authorHandle}
                                    </>
                                )}
                            </div>
                            <div 
                                onClick={(e) => handleMoreAction(e, 'analytics')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <BarChart2 className="w-4 h-4" /> View post engagements
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Text */}
            <div className="text-[15px] text-white whitespace-pre-wrap leading-normal mb-3">
                {formatText(tweet.content)}
            </div>

            {/* Quoted Tweet */}
            {tweet.quotedTweet && (
                <div className="mt-2 mb-3 border border-twitter-border rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer overflow-hidden" onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(tweet.quotedTweet!);
                }}>
                    <div className="flex items-center gap-1 mb-1">
                        <img src={tweet.quotedTweet.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-white text-sm truncate">{tweet.quotedTweet.authorName}</span>
                        <span className="text-twitter-gray text-sm truncate">@{tweet.quotedTweet.authorHandle}</span>
                        <span className="text-twitter-gray text-sm">· {tweet.quotedTweet.timestamp}</span>
                    </div>
                    <div className="text-white text-sm whitespace-pre-wrap">{formatText(tweet.quotedTweet.content)}</div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center text-twitter-gray max-w-md relative">
                
                {/* Reply */}
                <button 
                onClick={handleReplyClick}
                className="group flex items-center gap-2 hover:text-twitter-accent transition-colors"
                >
                <div className="p-2 rounded-full group-hover:bg-twitter-accent/10 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs group-hover:text-twitter-accent">{formatNumber(tweet.replies)}</span>
                </button>

                {/* Retweet */}
                <div className="relative" ref={retweetRef}>
                    <button 
                    onClick={toggleRetweetMenu}
                    className={`group flex items-center gap-2 transition-colors ${isRetweeted ? 'text-green-500' : 'hover:text-green-500'}`}
                    >
                    <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                        <Repeat2 className="w-4 h-4" />
                    </div>
                    <span className={`text-xs ${isRetweeted ? 'text-green-500' : 'group-hover:text-green-500'}`}>{formatNumber(retweetsCount)}</span>
                    </button>
                    {/* Dropdown */}
                    {showRetweetMenu && (
                        <div className="absolute top-8 -left-2 bg-black border border-twitter-border rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] z-50 w-40 overflow-hidden">
                            <div 
                                onClick={(e) => handleRetweetAction(e, 'repost')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Repeat2 className="w-4 h-4" /> Repost
                            </div>
                            <div 
                                onClick={(e) => handleRetweetAction(e, 'quote')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <PenLine className="w-4 h-4" /> Quote
                            </div>
                        </div>
                    )}
                </div>

                {/* Like */}
                <button 
                onClick={handleLike}
                className={`group flex items-center gap-2 transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                >
                <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors relative">
                    <Heart 
                    className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current' : ''} ${isAnimating ? 'animate-like' : ''}`} 
                    />
                </div>
                <span className={`text-xs ${isLiked ? 'text-pink-600' : 'group-hover:text-pink-600'}`}>{formatNumber(likesCount)}</span>
                </button>

                {/* Views (Analytics) */}
                <button 
                onClick={handleAnalyticsClick}
                className="group flex items-center gap-2 hover:text-twitter-accent transition-colors"
                >
                <div className="p-2 rounded-full group-hover:bg-twitter-accent/10 transition-colors">
                    <BarChart2 className="w-4 h-4" />
                </div>
                <span className="text-xs group-hover:text-twitter-accent">
                    {formatNumber(displayViews)}
                </span>
                </button>

                {/* Share */}
                <div className="relative" ref={shareRef}>
                    <button 
                    onClick={toggleShareMenu}
                    className="group flex items-center gap-2 hover:text-twitter-accent transition-colors"
                    >
                    <div className="p-2 rounded-full group-hover:bg-twitter-accent/10 transition-colors">
                        <Share className="w-4 h-4" />
                    </div>
                    </button>
                    {/* Dropdown */}
                    {showShareMenu && (
                        <div className="absolute top-8 right-0 bg-black border border-twitter-border rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] z-50 w-44 overflow-hidden">
                            <div 
                                onClick={(e) => handleShareAction(e, 'copy')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Link className="w-4 h-4" /> Copy link
                            </div>
                            <div 
                                onClick={(e) => handleShareAction(e, 'bookmark')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Bookmark className={`w-4 h-4 ${tweet.isBookmarked ? 'fill-current text-twitter-accent' : ''}`} /> 
                                {tweet.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                            </div>
                        </div>
                    )}
                </div>

            </div>
            </div>
        </div>
        </article>

        {/* Undo Toast Notification - Fixed Position */}
        {undoToast && undoToast.visible && (
            <div 
                className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-twitter-accent text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 cursor-default" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2">
                    {undoToast.type === 'like' && <Heart className="w-4 h-4 fill-current" />}
                    {undoToast.type === 'retweet' && <Repeat2 className="w-4 h-4" />}
                    {undoToast.type === 'follow' && (
                        undoToast.action === 'followed' ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />
                    )}
                    
                    <span className="text-sm font-medium">
                        {undoToast.type === 'like' && 'Liked'}
                        {undoToast.type === 'retweet' && 'Reposted'}
                        {undoToast.type === 'follow' && (
                             undoToast.action === 'followed' ? `Followed @${tweet.authorHandle}` : `Unfollowed @${tweet.authorHandle}`
                        )}
                    </span>
                </div>
                
                <div className="w-px h-4 bg-white/30"></div>

                <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 hover:bg-white/20 rounded-full px-2 py-1 -mr-2 transition-colors"
                >
                    <Undo2 className="w-4 h-4" />
                    <span className="text-xs font-bold">Undo</span>
                </button>
            </div>
        )}
    </>
  );
};