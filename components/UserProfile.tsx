import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, X, Camera, Undo2, UserPlus, UserMinus, PlayCircle } from 'lucide-react';
import { User, TweetData } from '../types';
import { TweetCard } from './TweetCard';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { userService } from '../services/userService';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(user);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setFormData(user);
        setShowDiscardAlert(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(user) !== JSON.stringify(formData);
  const profileShapeClass = user.profileShape === 'square' ? 'rounded-2xl' : 'rounded-full';

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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const url = await userService.uploadMedia(file);
              setFormData({ ...formData, bannerUrl: url });
          } catch (err) {
              alert("Failed to upload banner");
          }
      }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const url = await userService.uploadMedia(file);
              setFormData({ ...formData, avatarUrl: url });
          } catch (err) {
              alert("Failed to upload avatar");
          }
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-black w-full max-w-lg rounded-2xl shadow-2xl border border-twitter-border max-h-[90vh] overflow-y-auto relative">
        
        {/* Confirmation Overlay */}
        {showDiscardAlert && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl p-6 animate-in fade-in duration-100">
            <div className="bg-black border border-twitter-border p-6 rounded-2xl shadow-2xl max-w-xs w-full">
              <h3 className="text-xl font-bold text-white mb-2">ทิ้งการเปลี่ยนแปลง?</h3>
              <p className="text-twitter-gray text-[15px] mb-6 leading-5">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้ และคุณจะสูญเสียการเปลี่ยนแปลง
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white border-none h-11"
                  fullWidth
                  onClick={handleDiscard}
                >
                  ทิ้ง
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                  className="h-11 border-twitter-border text-white hover:bg-white/10"
                  onClick={() => setShowDiscardAlert(false)}
                >
                  ยกเลิก
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
            <h2 className="text-xl font-bold text-white">แก้ไขข้อมูลส่วนตัว</h2>
          </div>
          <Button onClick={() => onSave(formData)} size="sm" variant="secondary" className="font-bold">
            บันทึก
          </Button>
        </div>
        
        {/* Body */}
        <div className="p-4 space-y-4">
             {/* Banner & Avatar edits */}
             <div className="relative h-32 sm:h-48 bg-twitter-card mb-12">
                {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} className="w-full h-full object-cover opacity-60" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-twitter-card flex items-center justify-center text-twitter-gray text-sm">เพิ่มแบนเนอร์</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                    <div 
                        onClick={() => bannerInputRef.current?.click()}
                        className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                    >
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    {formData.bannerUrl && (
                        <div 
                          className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                          onClick={() => setFormData({...formData, bannerUrl: undefined})}
                        >
                            <X className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={bannerInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleBannerUpload}
                    />
                </div>
                <div className="absolute -bottom-10 left-4">
                    <div className="relative">
                        <img src={formData.avatarUrl} className={`w-20 h-20 sm:w-28 sm:h-28 border-4 border-black object-cover opacity-80 ${profileShapeClass}`} alt="Avatar" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div 
                                onClick={() => avatarInputRef.current?.click()}
                                className="p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                            >
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <input 
                                type="file" 
                                ref={avatarInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                    </div>
                </div>
             </div>

             {/* Inputs */}
             <div className="space-y-4 pt-4">
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">ชื่อ</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">ประวัติโดยย่อ</label>
                    <textarea 
                        value={formData.bio || ''} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-transparent text-white outline-none resize-none h-20"
                    />
                 </div>
                 <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">ตำแหน่งที่ตั้ง</label>
                    <input 
                        type="text" 
                        value={formData.location || ''} 
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
                  <div className="border border-twitter-border rounded-md px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray">เว็บไซต์</label>
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
  user: User; // The profile being viewed
  currentUser?: User | null; // The logged in user
  tweets: TweetData[];
  onBack: () => void;
  loading?: boolean;
  onUpdateProfile?: (user: User) => void;
  onReply?: (tweet: TweetData) => void;
  onHashtagClick?: (tag: string) => void;
  onUserClick?: (handle: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, currentUser, tweets, onBack, loading = false, onUpdateProfile, onReply, onHashtagClick, onUserClick }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followers || 0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('โพสต์');
  
  const isOwnProfile = currentUser?.handle === user.handle;
  const profileShapeClass = user.profileShape === 'square' ? 'rounded-2xl' : 'rounded-full';

  // Undo State
  const [undoToast, setUndoToast] = useState<{ action: 'followed' | 'unfollowed', visible: boolean } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  // Update follow state if user changes
  useEffect(() => {
      setFollowerCount(user.followers || 0);
      setIsFollowing(false); // Reset follow state when viewing new profile (mock)
  }, [user]);

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
      case 'โพสต์':
        return (
          <>
            {tweets.map((tweet) => (
              <TweetCard 
                key={tweet.id} 
                tweet={tweet} 
                onReply={onReply} 
                onHashtagClick={onHashtagClick}
                onUserClick={onUserClick}
              />
            ))}
            {tweets.length === 0 && (
              <div className="p-8 text-center text-twitter-gray">
                ยังไม่มีโพสต์ให้แสดง
              </div>
            )}
          </>
        );
      case 'การตอบกลับ':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">ยังไม่มีการตอบกลับ</p>
            <p className="text-twitter-gray max-w-sm">เมื่อคุณตอบกลับโพสต์ มันจะแสดงที่นี่</p>
          </div>
        );
      case 'ไฮไลท์':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">ยังไม่มีไฮไลท์</p>
            <p className="text-twitter-gray max-w-sm">ปักหมุดโพสต์โปรดของคุณไว้ที่โปรไฟล์</p>
          </div>
        );
      case 'สื่อ':
        const mediaContent = tweets
            .filter(t => t.images && t.images.length > 0)
            .flatMap(t => t.images!.map((img, idx) => ({
                id: `${t.id}_${idx}`,
                url: img,
                isVideo: img.startsWith('data:video') || img.endsWith('.mp4') || img.endsWith('.mov') || img.endsWith('.webm')
            })));

        if (mediaContent.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <div className="w-full max-w-xs h-40 bg-twitter-card mb-6 rounded-xl flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-twitter-gray" />
                </div>
                <p className="text-xl font-bold text-white mb-2">แสง สี เสียง... แอคชั่น!</p>
                <p className="text-twitter-gray max-w-sm">เมื่อคุณส่งทวีตพร้อมรูปภาพหรือวิดีโอ มันจะแสดงที่นี่</p>
              </div>
            );
        }

        return (
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {mediaContent.map((media) => (
                    <div key={media.id} className="aspect-square relative cursor-pointer bg-twitter-card group">
                        {media.isVideo ? (
                            <>
                                <video src={media.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10">
                                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                        <PlayCircle className="w-5 h-5 text-white fill-white/20" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <img src={media.url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                        )}
                    </div>
                ))}
            </div>
        );
      case 'ถูกใจ':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
            <p className="text-xl font-bold text-white mb-2">ยังไม่มีการกดถูกใจ</p>
            <p className="text-twitter-gray max-w-sm">แตะที่หัวใจบนโพสต์ใดก็ได้เพื่อแสดงความรัก เมื่อคุณทำเช่นนั้น มันจะแสดงที่นี่</p>
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
          <span className="text-xs text-twitter-gray">{tweets.length} โพสต์</span>
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
                className={`w-20 h-20 sm:w-32 sm:h-32 border-4 border-black object-cover bg-black ${profileShapeClass}`}
              />
            </div>
            <div className="mt-3 flex gap-3">
              {isOwnProfile ? (
                  <Button 
                    variant="outline" 
                    className="font-bold border-gray-500 text-white hover:bg-white/10"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    แก้ไขข้อมูลส่วนตัว
                  </Button>
              ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "secondary"}
                    className={`font-bold ${isFollowing ? 'border-gray-500 text-white hover:bg-white/10' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
                  </Button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-4">
            <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold text-white leading-tight">{user.name}</h1>
                <VerifiedBadge user={user} className="w-5 h-5" />
            </div>
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
                <span className="text-twitter-gray ml-1">กำลังติดตาม</span>
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">{followerCount.toLocaleString()}</span> 
                <span className="text-twitter-gray ml-1">ผู้ติดตาม</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {['โพสต์', 'การตอบกลับ', 'ไฮไลท์', 'สื่อ', 'ถูกใจ'].map((tab) => (
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
                        {undoToast.action === 'followed' ? `ติดตาม @${user.handle} แล้ว` : `เลิกติดตาม @${user.handle} แล้ว`}
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
    </div>
  );
};