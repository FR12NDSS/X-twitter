import React, { useState, useRef } from 'react';
import { Image, Smile, CalendarClock, MapPin, Wand2, Loader2, X, BadgeCheck, PlayCircle } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';
import { refineTweetText } from '../services/geminiService';
import { MOCK_USERS } from '../utils/mockData';
import { userService } from '../services/userService';
import { generateVideoThumbnail, dataURLtoFile } from '../utils/mediaUtils';

interface ComposerProps {
  currentUser: User;
  onTweet: (content: string, scheduledDate?: string, images?: string[], videoThumbnail?: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({ currentUser, onTweet }) => {
  const [content, setContent] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [videoThumbnail, setVideoThumbnail] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  // Mention State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character Limits
  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  // Circle Progress
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(content.length / MAX_CHARS, 1);
  const dashOffset = circumference - (progress * circumference);

  const handleTweet = () => {
    if ((content.trim() || attachments.length > 0) && !isOverLimit) {
      onTweet(content, showScheduler && scheduleTime ? scheduleTime : undefined, attachments, videoThumbnail);
      setContent('');
      setScheduleTime('');
      setAttachments([]);
      setVideoThumbnail(undefined);
      setShowScheduler(false);
      setShowMentions(false);
    }
  };

  const handleMagicRefine = async (tone: 'funny' | 'professional' | 'viral') => {
    if (!content) return;
    setIsRefining(true);
    const newText = await refineTweetText(content, tone);
    setContent(newText);
    setIsRefining(false);
  };

  const toggleScheduler = () => {
    if (showScheduler) {
      setScheduleTime('');
    }
    setShowScheduler(!showScheduler);
  };

  // --- Media Upload Logic ---
  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        setIsUploading(true);
        const uploadPromises: Promise<string>[] = [];
        let generatedThumbUrl: string | undefined = undefined;

        // Process files
        for (const file of Array.from(files)) {
            // Upload the original file
            uploadPromises.push(userService.uploadMedia(file));

            // If it's a video, generate thumbnail
            if (file.type.startsWith('video/')) {
                try {
                    const thumbDataUrl = await generateVideoThumbnail(file);
                    // Convert Data URL to File object for uploading
                    const thumbFile = dataURLtoFile(thumbDataUrl, `thumb_${file.name}.jpg`);
                    // Upload thumbnail
                    generatedThumbUrl = await userService.uploadMedia(thumbFile);
                } catch (err) {
                    console.error("Error generating thumbnail:", err);
                }
            }
        }

        try {
            const uploadedUrls = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedUrls]);
            if (generatedThumbUrl) {
                setVideoThumbnail(generatedThumbUrl);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
  };

  const removeAttachment = (index: number) => {
      // If we are removing the video, we should probably also remove the thumbnail if it's the only one.
      // For simplicity, if attachments becomes empty, clear thumbnail.
      setAttachments(prev => {
          const newAttachments = prev.filter((_, i) => i !== index);
          if (newAttachments.length === 0) setVideoThumbnail(undefined);
          
          // Check if any video remains (simple check)
          const hasVideo = newAttachments.some(url => isVideo(url));
          if (!hasVideo) setVideoThumbnail(undefined);
          
          return newAttachments;
      });
  };

  const isVideo = (url: string) => {
      return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm');
  };

  // --- Mention Logic ---
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
      // Focus back and set cursor
      setTimeout(() => {
        textarea.focus();
        // textarea.setSelectionRange(newTextBefore.length, newTextBefore.length);
      }, 0);
    }
  };

  const filteredUsers = MOCK_USERS.filter(user => 
    user.handle.toLowerCase().includes(mentionQuery.toLowerCase()) || 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="border-b border-twitter-border p-4 bg-black/50 backdrop-blur-sm sticky top-0 z-10 relative">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
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
            placeholder="มีอะไรเกิดขึ้นบ้าง?!"
            className="w-full bg-transparent text-xl text-white placeholder-gray-500 border-none focus:ring-0 resize-none h-24 p-2 no-scrollbar outline-none"
          />
          
          {/* Media Previews */}
          {attachments.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2 overflow-x-auto">
                  {attachments.map((url, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-twitter-border">
                          {isVideo(url) ? (
                              <div className="w-full h-48 bg-black relative">
                                  <video 
                                    src={url} 
                                    className="w-full h-full object-cover" 
                                    poster={videoThumbnail} // Show thumbnail in preview if available
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <PlayCircle className="w-10 h-10 text-white/80" />
                                  </div>
                              </div>
                          ) : (
                              <img src={url} className="w-full h-48 object-cover" alt="Preview" />
                          )}
                          <button 
                            onClick={() => removeAttachment(index)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/90 transition-colors z-10"
                          >
                              <X className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          )}

          {/* Mention Dropdown */}
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute top-full left-0 bg-black border border-twitter-border rounded-xl shadow-2xl z-50 w-64 overflow-hidden max-h-60 overflow-y-auto">
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
          
          {/* Scheduler Input */}
          {showScheduler && (
            <div className="mb-3 p-3 bg-twitter-card/50 rounded-xl border border-twitter-border/50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-twitter-accent">
                  <CalendarClock className="w-4 h-4" />
                  <span className="font-medium">กำหนดเวลาโพสต์</span>
                </div>
                <button 
                  onClick={toggleScheduler}
                  className="text-twitter-gray hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-black border border-twitter-border rounded-lg p-2 text-white text-sm focus:border-twitter-accent focus:outline-none"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          {content && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-twitter-accent font-semibold flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> AI ช่วยแต่ง:
              </span>
              <button 
                onClick={() => handleMagicRefine('funny')}
                disabled={isRefining}
                className="text-xs bg-twitter-accent/10 text-twitter-accent px-2 py-1 rounded-full hover:bg-twitter-accent/20 transition-colors disabled:opacity-50"
              >
                ตลก
              </button>
              <button 
                onClick={() => handleMagicRefine('professional')}
                disabled={isRefining}
                className="text-xs bg-twitter-accent/10 text-twitter-accent px-2 py-1 rounded-full hover:bg-twitter-accent/20 transition-colors disabled:opacity-50"
              >
                ทางการ
              </button>
              <button 
                onClick={() => handleMagicRefine('viral')}
                disabled={isRefining}
                className="text-xs bg-twitter-accent/10 text-twitter-accent px-2 py-1 rounded-full hover:bg-twitter-accent/20 transition-colors disabled:opacity-50"
              >
                ไวรัล
              </button>
              {isRefining && <Loader2 className="w-3 h-3 animate-spin text-twitter-accent" />}
            </div>
          )}

          <div className="border-t border-twitter-border pt-3 flex items-center justify-between">
            <div className="flex gap-1 text-twitter-accent">
              <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
              />
              <button onClick={handleMediaClick} className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors" title="Media">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleScheduler}
                className={`p-2 rounded-full transition-colors ${showScheduler ? 'bg-twitter-accent/20 text-twitter-accent' : 'hover:bg-twitter-accent/10'}`}
              >
                <CalendarClock className="w-5 h-5" />
              </button>
               <button className="p-2 rounded-full hover:bg-twitter-accent/10 transition-colors">
                <MapPin className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                 <div className="flex items-center gap-3 animate-in fade-in duration-200">
                    {/* Character Count for near limit */}
                    {isNearLimit && (
                        <span className={`text-xs font-bold ${isOverLimit ? 'text-red-500' : 'text-yellow-500'}`}>
                            {remainingChars}
                        </span>
                    )}
                    
                    {/* Progress Circle SVG */}
                    <div className="relative w-6 h-6 transform -rotate-90">
                        <svg width="24" height="24" className="block">
                            <circle
                                cx="12"
                                cy="12"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-twitter-border opacity-60"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="round"
                                className={`transition-all duration-200 ${
                                    isOverLimit 
                                        ? 'text-red-500' 
                                        : isNearLimit 
                                            ? 'text-yellow-500' 
                                            : 'text-twitter-accent'
                                }`}
                            />
                        </svg>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-6 bg-twitter-border"></div>
                 </div>
              )}
              <Button 
                onClick={handleTweet} 
                disabled={(!content.trim() && attachments.length === 0) || isRefining || (showScheduler && !scheduleTime) || isOverLimit || isUploading} 
                className="shadow-sm"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : (showScheduler && scheduleTime ? 'กำหนดเวลา' : 'โพสต์')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};