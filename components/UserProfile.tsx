import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, X, Camera, Undo2, UserPlus, UserMinus } from 'lucide-react';
import { User, TweetData } from '../types';
import { TweetCard } from './TweetCard';
import { Button } from './Button';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setFormData(user);
        setShowDiscardAlert(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(user) !== JSON.stringify(formData);

  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowDiscardAlert(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardAlert(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-twitter-border max-h-[90vh] overflow-y-auto relative">
        
        {/* Confirmation Overlay */}
        {showDiscardAlert && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl p-6 animate-in fade-in duration-100">
            <div className="bg-black border border-twitter-border p-6 rounded-2xl shadow-2xl max-w-xs w-full">
              <h3 className="text-xl font-bold text-white mb-2">Discard changes?</h3>
              <p className="text-twitter-gray text-[15px] mb-6 leading-5">
                This can't be undone and you'll lose your changes.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white border-none h-11"
                  fullWidth
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                  className="h-11 border-twitter-border text-white hover:bg-white/10"
                  onClick={() => setShowDiscardAlert(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-twitter-border">
          <div className="flex items-center gap-4">
            <button onClick={handleCloseAttempt} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">Edit profile</h2>
          </div>
          <Button onClick={() => onSave(formData)} size="sm" variant="secondary" className="font-bold">
            Save
          </Button>
        </div>
        
        {/* Body */}
        <div className="p-4 space-y-4">
             {/* Banner & Avatar edits (Mock Visuals) */}
             <div className="relative h-32 sm:h-48 bg-twitter-card mb-12">
                {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} className="w-full h-full object-cover opacity-60" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-twitter-card flex items-center justify-center text-twitter-gray text-sm">Add Banner</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                    <div className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"><Camera className="w-5 h-5 text-white" /></div>
                    {formData.bannerUrl && (
                        <div 
                          className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                          onClick={() => setFormData({...formData, bannerUrl: undefined})}
                        >
                            <X className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-10 left-4">
                    <div className="relative">
                        <img src={formData.avatarUrl} className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-black object-cover opacity-80" alt="Avatar" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"><Camera className="w-5 h-5 text-white" /></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Inputs */}
             <div className="space-y-4 pt-4">
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">Name</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">Bio</label>
                    <textarea 
                        value={formData.bio || ''} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-transparent text-white outline-none resize-none h-20"
                    />
                 </div>
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">Location</label>
                    <input 
                        type="text" 
                        value={formData.location || ''} 
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
                  <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">Website</label>
                    <input 
                        type="text" 
                        value={formData.website || ''} 
                        onChange={e => setFormData({...formData, website: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
             </div>
        </div>
      </div>
    </div>
  )
};

interface UserProfileProps {
  user: User;
  tweets: TweetData[];
  onBack: () => void;
  loading?: boolean;
  onUpdateProfile?: (user: User) => void;
  onReply?: (tweet: TweetData) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, tweets, onBack, loading = false, onUpdateProfile, onReply }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followers || 0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');

  // Undo State
  const [undoToast, setUndoToast] = useState<{ action: 'followed' | 'unfollowed', visible: boolean } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const showUndoNotification = (action: 'followed' | 'unfollowed') => {
    // Clear existing timer
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    setUndoToast({ action, visible: true });
    
    // Set new timer
    undoTimeoutRef.current = setTimeout(() => {
        setUndoToast(null);
    }, 4000);
  };

  const handleFollow = () => {
    const newIsFollowing = !isFollowing;
    
    if (isFollowing) {
      setFollowerCount(prev => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowerCount(prev => prev + 1);
      setIsFollowing(true);
    }

    showUndoNotification(newIsFollowing ? 'followed' : 'unfollowed');
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    if (undoToast) {
        const wasFollowed = undoToast.action === 'followed';
        // Undo the action
        if (wasFollowed) {
            setFollowerCount(prev => prev - 1);
            setIsFollowing(false);
        } else {
            setFollowerCount(prev => prev + 1);
            setIsFollowing(true);
        }
    }
    setUndoToast(null);
  };

  const handleSaveProfile = (updatedUser: User) => {
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    setIsEditModalOpen(false);
  };

  const TweetSkeleton = () => (
    <div className="border-b border-twitter-border p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-twitter-border/50 flex-shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="flex gap-2 items-center">
            <div className="h-4 w-24 bg-twitter-border/50 rounded" />
            <div className="h-4 w-16 bg-twitter-border/30 rounded" />
          </div>
          <div className="space-y-2">
             <div className="h-4 w-full bg-twitter-border/30 rounded" />
             <div className="h-4 w-5/6 bg-twitter-border/30 rounded" />
             <div className="h-4 w-4/6 bg-twitter-border/30 rounded" />
          </div>
          <div className="flex justify-between pt-2 max-w-md">
             <div className="h-8 w-8 bg-twitter-border/20 rounded-full" />
             <div className="h-8 w-8 bg-twitter-border/20 rounded-full" />
             <div className="h-8 w-8 bg-twitter-border/20 rounded-full" />
             <div className="h-8 w-8 bg-twitter-border/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Posts':
        return (
          <>
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} onReply={onReply} />
            ))}
            {tweets.length === 0 && (
              <div className="p-8 text-center text-twitter-gray">
                No tweets to show yet.
              </div>
            )}
          </>
        );
      case 'Replies':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">No replies yet</p>
            <p className="text-twitter-gray max-w-sm">When you reply to posts, they will show up here.</p>
          </div>
        );
      case 'Highlights':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">No highlights yet</p>
            <p className="text-twitter-gray max-w-sm">Pin your favorite posts to your profile.</p>
          </div>
        );
      case 'Media':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <div className="w-full max-w-xs h-40 bg-twitter-card mb-6 rounded-xl flex items-center justify-center mx-auto">
                <Camera className="w-10 h-10 text-twitter-gray" />
            </div>
            <p className="text-xl font-bold text-white mb-2">Lights, camera... attachment!</p>
            <p className="text-twitter-gray max-w-sm">When you send tweets with photos or videos, they will show up here.</p>
          </div>
        );
      case 'Likes':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">No likes yet</p>
            <p className="text-twitter-gray max-w-sm">Tap the heart on any post to show it some love. When you do, it'll show up here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <EditProfileModal 
        user={user} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveProfile} 
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-1 flex items-center gap-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white leading-5">{user.name}</h2>
          <span className="text-xs text-twitter-gray">{tweets.length} posts</span>
        </div>
      </div>

      {/* Sticky Profile Info & Tabs */}
      <div className="sticky top-[53px] z-20 bg-black border-b border-twitter-border">
        {/* Banner */}
        <div className="h-32 sm:h-48 bg-twitter-card relative">
          {user.bannerUrl ? (
            <img 
              src={user.bannerUrl} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-twitter-card/50" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-0 relative">
          {/* Avatar & Edit Profile Button */}
          <div className="flex justify-between items-start mb-3">
            <div className="relative -mt-10 sm:-mt-16 transition-all duration-200">
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-black object-cover bg-black"
              />
            </div>
            <div className="mt-3 flex gap-3">
              <Button 
                variant="outline" 
                className="font-bold border-gray-500 text-white hover:bg-white/10"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit profile
              </Button>
              <Button 
                variant={isFollowing ? "outline" : "secondary"}
                className={`font-bold ${isFollowing ? 'border-gray-500 text-white hover:bg-white/10' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-white leading-tight">{user.name}</h1>
            <p className="text-twitter-gray text-sm mb-3">@{user.handle}</p>
            {user.bio && (
              <p className="text-white text-[15px] mb-3 whitespace-pre-wrap">{user.bio}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-twitter-gray text-sm mb-3">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <a href={`https://${user.website}`} className="text-twitter-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{user.joinedDate}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">{user.following?.toLocaleString()}</span> 
                <span className="text-twitter-gray ml-1">Following</span>
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">{followerCount.toLocaleString()}</span> 
                <span className="text-twitter-gray ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4 relative"
            >
              <span className={`font-medium text-[15px] ${activeTab === tab ? 'text-white font-bold' : 'text-twitter-gray'}`}>
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 h-1 w-14 bg-twitter-accent rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[50vh] relative z-0">
        {loading ? (
          <>
            <TweetSkeleton />
            <TweetSkeleton />
            <TweetSkeleton />
          </>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Undo Toast Notification - Fixed Position */}
      {undoToast && undoToast.visible && (
            <div 
                className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-twitter-accent text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 cursor-default" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2">
                    {undoToast.action === 'followed' ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                    
                    <span className="text-sm font-medium">
                        {undoToast.action === 'followed' ? `Followed @${user.handle}` : `Unfollowed @${user.handle}`}
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
    </div>
  );
};