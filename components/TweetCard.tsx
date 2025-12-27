import React, { useState, useRef, useEffect } from 'react';
import { TweetData, User } from '../types';
import { userService } from '../services/userService';
import { MOCK_USERS } from '../utils/mockData';
import { VerifiedBadge } from './VerifiedBadge';
import { formatText } from '../utils/textUtils';
import { 
  PlayCircle, CalendarClock, MoreHorizontal, Frown, 
  UserMinus, UserPlus, BarChart2, MessageCircle, Repeat2, PenLine, Heart, 
  Share, Link, Bookmark, Megaphone, Undo2, Pin, Trash2
} from 'lucide-react';

interface TweetCardProps {
  tweet: TweetData;
  currentUser?: User | null; // Added to check admin status
  onReply?: (tweet: TweetData) => void;
  onClick?: (tweet: TweetData) => void;
  onBookmark?: (tweetId: string) => void;
  onQuote?: (tweet: TweetData) => void;
  onAnalytics?: (tweet: TweetData) => void;
  onHashtagClick?: (tag: string) => void;
  onUserClick?: (handle: string) => void;
  onPin?: (tweetId: string, type: 'user' | 'admin') => void;
  onDelete?: (tweetId: string) => void; // New delete prop
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet, currentUser, onReply, onClick, onBookmark, onQuote, onAnalytics, onHashtagClick, onUserClick, onPin, onDelete }) => {
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

  // Profile Shape Logic
  const profileShapeClass = tweet.profileShape === 'square' ? 'rounded-md' : 'rounded-full';

  // Pin Logic
  const isAdminPinned = tweet.isPinned && tweet.pinnedBy === 'admin';
  const isUserPinned = tweet.isPinned && tweet.pinnedBy === 'user';
  
  // Check if user can delete (Owner or Admin)
  const canDelete = currentUser && (currentUser.handle === tweet.authorHandle || currentUser.isAdmin);

  // Card Styling based on Pin Status
  const cardBorderClass = isAdminPinned 
    ? 'border-2 border-red-500 bg-red-900/10' 
    : 'border-b border-twitter-border';

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
        await navigator.clipboard.writeText(`https://x.com/${tweet.authorHandle}/status/${tweet.id}`);
        alert("คัดลอกลิงก์แล้ว!");
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
        } else {
            user.followers -= 1;
        }
    }

    showUndoNotification('follow', newFollowState ? 'followed' : 'unfollowed');
    setShowMoreMenu(false);
  };

  const handlePinAction = (e: React.MouseEvent, type: 'user' | 'admin') => {
      e.stopPropagation();
      if (onPin) {
          onPin(tweet.id, type);
      }
      setShowMoreMenu(false);
  };

  const handleDeleteAction = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?')) {
          if (onDelete) onDelete(tweet.id);
      }
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

  const handleUserClickInternal = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUserClick) {
          onUserClick(tweet.authorHandle);
      }
  };

  const formatNumber = (num: number) => {
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
  };

  const isVideo = (url: string) => {
      // Basic check for video type in data URL or extension
      return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm');
  };

  // Helper to render image grid
  const renderImages = () => {
    if (!tweet.images || tweet.images.length === 0) return null;

    const count = tweet.images.length;
    
    // Helper to render media element (img or video)
    const renderMediaElement = (url: string, className: string) => {
        if (isVideo(url)) {
            return (
                <div className={`${className} relative bg-black group`}>
                    <video 
                      src={url} 
                      className="w-full h-full object-cover" 
                      poster={tweet.videoThumbnail} // Use thumbnail if available
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white opacity-80" />
                    </div>
                </div>
            );
        }
        return <img src={url} className={className} alt="" />;
    };

    if (count === 1) {
        return (
            <div className="mt-3 rounded-2xl overflow-hidden border border-twitter-border/50">
                {renderMediaElement(tweet.images[0], "w-full h-auto max-h-[500px] object-cover")}
            </div>
        );
    }

    if (count === 2) {
        return (
            <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden border border-twitter-border/50 h-[290px]">
                {renderMediaElement(tweet.images[0], "w-full h-full object-cover")}
                {renderMediaElement(tweet.images[1], "w-full h-full object-cover")}
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden border border-twitter-border/50 h-[290px]">
                <div className="relative">
                    {renderMediaElement(tweet.images[0], "w-full h-full object-cover")}
                </div>
                <div className="grid grid-rows-2 gap-0.5 h-full">
                    {renderMediaElement(tweet.images[1], "w-full h-full object-cover")}
                    {renderMediaElement(tweet.images[2], "w-full h-full object-cover")}
                </div>
            </div>
        );
    }

    if (count >= 4) {
        return (
            <div className="mt-3 grid grid-cols-2 grid-rows-2 gap-0.5 rounded-2xl overflow-hidden border border-twitter-border/50 h-[290px]">
                {renderMediaElement(tweet.images[0], "w-full h-full object-cover")}
                {renderMediaElement(tweet.images[1], "w-full h-full object-cover")}
                {renderMediaElement(tweet.images[2], "w-full h-full object-cover")}
                {renderMediaElement(tweet.images[3], "w-full h-full object-cover")}
            </div>
        );
    }
  };

  // Ensure view count has a fallback if data is missing, but respect 0
  const displayViews = tweet.views !== undefined ? tweet.views : (tweet.likes * 42) || 0;

  return (
    <>
        <article 
        onClick={handleCardClick}
        className={`${cardBorderClass} p-4 hover:bg-white/5 transition-colors cursor-pointer relative`}
        >
        {/* Pinned Label */}
        {(isAdminPinned || isUserPinned) && (
            <div className={`flex items-center gap-2 text-xs font-bold mb-2 ml-14 ${isAdminPinned ? 'text-red-500' : 'text-twitter-gray'}`}>
                <Pin className={`w-3 h-3 fill-current`} />
                <span>{isAdminPinned ? 'ประกาศจากระบบ' : 'ปักหมุดแล้ว'}</span>
            </div>
        )}

        <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0" onClick={handleUserClickInternal}>
            <img 
                src={tweet.avatarUrl} 
                alt={tweet.authorName} 
                className={`w-10 h-10 object-cover ${profileShapeClass} hover:opacity-80 transition-opacity`}
            />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-[15px] mb-1 overflow-hidden flex-wrap">
                    <div className="flex items-center gap-1 cursor-pointer hover:underline decoration-white" onClick={handleUserClickInternal}>
                        <span className="font-bold text-white truncate">{tweet.authorName}</span>
                        <VerifiedBadge user={tweet} className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span className="text-twitter-gray truncate cursor-pointer hover:underline decoration-twitter-gray" onClick={handleUserClickInternal}>@{tweet.authorHandle}</span>
                    <span className="text-twitter-gray flex-shrink-0">·</span>
                    
                    {tweet.isScheduled ? (
                    <div className="flex items-center gap-1 text-twitter-gray flex-shrink-0">
                        <CalendarClock className="w-3 h-3" />
                        <span className="text-twitter-gray hover:underline">{tweet.timestamp}</span>
                    </div>
                    ) : (
                    <span className="text-twitter-gray hover:underline flex-shrink-0">{tweet.timestamp}</span>
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
                        <div className="absolute top-6 right-0 bg-black border border-twitter-border rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] z-50 w-56 overflow-hidden">
                            {/* Delete Option (For Author or Admin) */}
                            {canDelete && (
                                <div 
                                    onClick={handleDeleteAction}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-red-500 text-[15px]"
                                >
                                    <Trash2 className="w-4 h-4" /> ลบโพสต์
                                </div>
                            )}

                            {/* Pin Options */}
                            {currentUser?.isAdmin && (
                                <div 
                                    onClick={(e) => handlePinAction(e, 'admin')}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                                >
                                    <Pin className="w-4 h-4" /> 
                                    {isAdminPinned ? 'เลิกปักหมุดประกาศ' : 'ปักหมุดประกาศ (Admin)'}
                                </div>
                            )}
                            
                            {/* User Pin Option (Show if own tweet or generally available logic) */}
                            {currentUser?.handle === tweet.authorHandle && !isAdminPinned && (
                                <div 
                                    onClick={(e) => handlePinAction(e, 'user')}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                                >
                                    <Pin className="w-4 h-4" /> 
                                    {isUserPinned ? 'เลิกปักหมุดจากโปรไฟล์' : 'ปักหมุดไปยังโปรไฟล์'}
                                </div>
                            )}

                            <div 
                                onClick={(e) => handleMoreAction(e, 'not_interested')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Frown className="w-4 h-4" /> ไม่สนใจ
                            </div>
                            <div 
                                onClick={(e) => handleMoreAction(e, 'follow')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus className="w-4 h-4" /> เลิกติดตาม @{tweet.authorHandle}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" /> ติดตาม @{tweet.authorHandle}
                                    </>
                                )}
                            </div>
                            <div 
                                onClick={(e) => handleMoreAction(e, 'analytics')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <BarChart2 className="w-4 h-4" /> ดูการมีส่วนร่วมกับโพสต์
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Text */}
            <div className="text-[15px] text-white whitespace-pre-wrap leading-normal mb-1">
                {formatText(tweet.content, onHashtagClick)}
                {tweet.hashtags && tweet.hashtags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2 pt-1">
                        {tweet.hashtags.map((tag, i) => (
                            <span 
                                key={i} 
                                className="text-twitter-accent hover:underline cursor-pointer font-normal"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onHashtagClick) {
                                        onHashtagClick(tag.startsWith('#') ? tag : `#${tag}`);
                                    } else {
                                        console.log(`Clicked hashtag: ${tag}`);
                                    }
                                }}
                            >
                                {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Images */}
            {renderImages()}

            {/* Quoted Tweet */}
            {tweet.quotedTweet && (
                <div className="mt-3 mb-3 border border-twitter-border rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer overflow-hidden" onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick(tweet.quotedTweet!);
                }}>
                    <div className="flex items-center gap-1 mb-1">
                        <img 
                            src={tweet.quotedTweet.avatarUrl} 
                            alt="" 
                            className={`w-5 h-5 object-cover ${tweet.quotedTweet.profileShape === 'square' ? 'rounded-md' : 'rounded-full'}`} 
                        />
                        <span className="font-bold text-white text-sm truncate">{tweet.quotedTweet.authorName}</span>
                        <VerifiedBadge user={tweet.quotedTweet} className="w-3 h-3" />
                        <span className="text-twitter-gray text-sm truncate">@{tweet.quotedTweet.authorHandle}</span>
                        <span className="text-twitter-gray text-sm">· {tweet.quotedTweet.timestamp}</span>
                    </div>
                    <div className="text-white text-sm whitespace-pre-wrap">{formatText(tweet.quotedTweet.content, onHashtagClick)}</div>
                    {/* Render images for quoted tweet as well, but smaller/simpler */}
                    {tweet.quotedTweet.images && tweet.quotedTweet.images.length > 0 && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-twitter-border/50 h-32">
                            <img src={tweet.quotedTweet.images[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center text-twitter-gray max-w-md relative mt-3">
                
                {/* Reply */}
                <button 
                onClick={handleReplyClick}
                className="group flex items-center gap-2 hover:text-twitter-accent transition-colors"
                title="Reply"
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
                    title="Repost"
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
                                <Repeat2 className="w-4 h-4" /> รีโพสต์
                            </div>
                            <div 
                                onClick={(e) => handleRetweetAction(e, 'quote')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <PenLine className="w-4 h-4" /> อ้างอิง
                            </div>
                        </div>
                    )}
                </div>

                {/* Like */}
                <button 
                onClick={handleLike}
                className={`group flex items-center gap-2 transition-colors ${isLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                title="Like"
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
                title={`${displayViews.toLocaleString()} Views`}
                aria-label={`${displayViews} Views`}
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
                    title="Share"
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
                                <Link className="w-4 h-4" /> คัดลอกลิงก์
                            </div>
                            <div 
                                onClick={(e) => handleShareAction(e, 'bookmark')}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer font-bold text-white text-[15px]"
                            >
                                <Bookmark className={`w-4 h-4 ${tweet.isBookmarked ? 'fill-current text-twitter-accent' : ''}`} /> 
                                {tweet.isBookmarked ? 'ลบบุ๊กมาร์ก' : 'บุ๊กมาร์ก'}
                            </div>
                        </div>
                    )}
                </div>

            </div>
            {/* Promoted Status Indicator */}
            {tweet.isPromoted && (
                <div className="flex items-center gap-1 text-xs text-twitter-gray mt-2">
                    <Megaphone className="w-3 h-3" />
                    <span>ได้รับการโปรโมท</span>
                </div>
            )}
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
                        {undoToast.type === 'like' && 'ถูกใจ'}
                        {undoToast.type === 'retweet' && 'รีโพสต์แล้ว'}
                        {undoToast.type === 'follow' && (
                             undoToast.action === 'followed' ? `ติดตาม @${tweet.authorHandle} แล้ว` : `เลิกติดตาม @${tweet.authorHandle} แล้ว`
                        )}
                    </span>
                </div>
                
                <div className="w-px h-4 bg-white/30"></div>

                <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 hover:bg-white/20 rounded-full px-2 py-1 -mr-2 transition-colors"
                >
                    <Undo2 className="w-4 h-4" />
                    <span className="text-xs font-bold">เลิกทำ</span>
                </button>
            </div>
        )}
    </>
  );
};