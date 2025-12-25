import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightBar } from './components/RightBar';
import { TweetCard } from './components/TweetCard';
import { Composer } from './components/Composer';
import { BottomNav } from './components/BottomNav';
import { FloatingTweetButton } from './components/FloatingTweetButton';
import { UserProfile } from './components/UserProfile';
import { ReplyModal } from './components/ReplyModal';
import { QuoteModal } from './components/QuoteModal';
import { PostStatsModal } from './components/PostStatsModal';
import { TweetDetail } from './components/TweetDetail';
import { UserSearch } from './components/UserSearch';
import { Notifications } from './components/Notifications';
import { Messages } from './components/Messages';
import { Bookmarks } from './components/Bookmarks';
import { Lists } from './components/Lists';
import { Communities } from './components/Communities';
import { Premium } from './components/Premium';
import { GeminiPage } from './components/GeminiPage';
import { SettingsPage } from './components/SettingsPage';
import { AdminPage } from './components/AdminPage';
import { MobileSidebar } from './components/MobileSidebar';
import { AuthPage } from './components/AuthPage';
import { InstallPage } from './components/InstallPage'; // Import InstallPage
import { TweetData, NavigationItem, User, TweetComment, SiteConfig } from './types';
import { generateFeed } from './services/geminiService';
import { userService } from './services/userService';
import { MOCK_USERS } from './utils/mockData';
import { Loader2, RefreshCcw, ArrowLeft, MoreVertical, Mic, BadgeDollarSign, Radio } from 'lucide-react';
import { Button } from './components/Button';

const generateMockComments = (tweetId: string): TweetComment[] => [
  {
    id: `c1-${tweetId}`,
    authorName: 'Sarah Jenkins',
    authorHandle: 'sarahj_dev',
    avatarUrl: 'https://picsum.photos/seed/sarah/200/200',
    content: 'This is exactly what I was thinking! 🔥',
    timestamp: '2h',
    likes: 12
  },
  {
    id: `c2-${tweetId}`,
    authorName: 'Alex Rivera',
    authorHandle: 'arivera',
    avatarUrl: 'https://picsum.photos/seed/alex/200/200',
    content: 'Can you elaborate on the second point? I feel like there is more nuance to this.',
    timestamp: '1h',
    likes: 5
  },
   {
    id: `c3-${tweetId}`,
    authorName: 'Code Ninja',
    authorHandle: 'codeninja',
    avatarUrl: 'https://picsum.photos/seed/ninja/200/200',
    content: '100% agree. well said.',
    timestamp: '30m',
    likes: 8
  }
];

const App: React.FC = () => {
  // Check if system is installed
  const [isSystemChecked, setIsSystemChecked] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Tabs & Nav
  const [activeTab, setActiveTab] = useState<NavigationItem>(NavigationItem.ADMIN);
  
  // Data State
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrend, setCurrentTrend] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(true); // Default to True for "Real-time" feel

  // Navigation State
  const [selectedTweet, setSelectedTweet] = useState<TweetData | null>(null);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null); // New state for viewing user profile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal States
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TweetData | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotingTweet, setQuotingTweet] = useState<TweetData | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [analyzingTweet, setAnalyzingTweet] = useState<TweetData | null>(null);

  // Check for installation and session on mount
  useEffect(() => {
    const initSystem = async () => {
        const installed = await userService.checkInstallationStatus();
        setIsConfigured(installed);
        
        if (installed) {
            const config = userService.getSiteConfig();
            setSiteConfig(config);
            // Set Document Title
            if (config?.siteName) {
                document.title = config.siteName;
            }

            const sessionUser = userService.getSession();
            if (sessionUser) {
                setCurrentUser(sessionUser);
                setIsAuthenticated(true);
            }
        }
        setIsSystemChecked(true);
    };
    initSystem();
  }, []);

  // Update document title when siteConfig changes
  useEffect(() => {
      if (siteConfig?.siteName) {
          document.title = siteConfig.siteName;
      }
  }, [siteConfig]);

  // Initialize Feed with AI content
  useEffect(() => {
    if (isAuthenticated) {
        const loadFeed = async () => {
        setLoading(true);
        const aiTweets = await generateFeed();
        setTweets(aiTweets);
        setLoading(false);
        };

        loadFeed();
    }
  }, [isAuthenticated]);

  // Simulation Loop for Real-time Content
  useEffect(() => {
      let intervalId: any;

      if (isAuthenticated && isRealTime) {
          intervalId = setInterval(async () => {
              // Only fetch if we are on Home tab and not viewing a tweet details to avoid disruption
              if (activeTab === NavigationItem.HOME && !selectedTweet && !viewingProfile) {
                  // Fetch 1 new tweet about a random topic or general
                  const newTweets = await generateFeed(currentTrend || undefined);
                  if (newTweets.length > 0) {
                      // Take only the first one to simulate "incoming" stream
                      const incomingTweet = { ...newTweets[0], timestamp: 'เมื่อสักครู่', id: `live-${Date.now()}` };
                      setTweets(prev => [incomingTweet, ...prev]);
                  }
              }
          }, 45000); // Every 45 seconds
      }

      return () => clearInterval(intervalId);
  }, [isAuthenticated, isRealTime, activeTab, selectedTweet, currentTrend, viewingProfile]);

  const handleInstallComplete = (adminUser: User) => {
      setIsConfigured(true);
      setSiteConfig(userService.getSiteConfig()); // Load new config
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setActiveTab(NavigationItem.ADMIN); // Redirect to admin panel after install
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab(NavigationItem.HOME);
  };

  const handleLogout = () => {
    userService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab(NavigationItem.HOME);
    setTweets([]);
    setIsDrawerOpen(false);
  };

  const handleTweet = (content: string, scheduledDate?: string, images?: string[], videoThumbnail?: string) => {
    if (!currentUser) return;
    const newTweet: TweetData = {
      id: Date.now().toString(),
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      avatarUrl: currentUser.avatarUrl,
      content,
      timestamp: scheduledDate ? `Scheduled: ${new Date(scheduledDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'เมื่อสักครู่',
      likes: 0,
      retweets: 0,
      replies: 0,
      views: 0,
      isVerified: currentUser.isVerified,
      isScheduled: !!scheduledDate,
      isBookmarked: false,
      images: images,
      videoThumbnail: videoThumbnail // Save video thumbnail
    };
    setTweets(prev => [newTweet, ...prev]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    userService.updateUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleUpdateSiteConfig = (newConfig: SiteConfig) => {
      setSiteConfig(newConfig);
      userService.configureSite(newConfig);
  };

  // Admin: Delete Tweet
  const handleDeleteTweet = (tweetId: string) => {
      setTweets(prev => prev.filter(t => t.id !== tweetId));
  };

  // Admin: Promote Tweet
  const handlePromoteTweet = (tweetId: string) => {
      setTweets(prev => prev.map(t => 
          t.id === tweetId ? { ...t, isPromoted: !t.isPromoted } : t
      ));
  };

  const refreshFeed = async () => {
    setLoading(true);
    const aiTweets = await generateFeed(currentTrend || undefined);
    setTweets(prev => [...aiTweets, ...prev]);
    setLoading(false);
  };

  const handleTrendClick = async (topic: string) => {
    setLoading(true);
    setActiveTab(NavigationItem.HOME);
    setSelectedTweet(null);
    setViewingProfile(null);
    setCurrentTrend(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const aiTweets = await generateFeed(topic);
    setTweets(aiTweets);
    setLoading(false);
  };

  const handleClearTrend = async () => {
    setLoading(true);
    setCurrentTrend(null);
    const aiTweets = await generateFeed();
    setTweets(aiTweets);
    setLoading(false);
  };

  const scrollToComposer = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleReplyClick = (tweet: TweetData) => {
    setReplyingTo(tweet);
    setReplyModalOpen(true);
  };

  const handleQuoteClick = (tweet: TweetData) => {
    setQuotingTweet(tweet);
    setQuoteModalOpen(true);
  };

  const handleAnalyticsClick = (tweet: TweetData) => {
    setAnalyzingTweet(tweet);
    setStatsModalOpen(true);
  };

  const handleBookmarkToggle = (tweetId: string) => {
    setTweets(prev => prev.map(t => 
        t.id === tweetId ? { ...t, isBookmarked: !t.isBookmarked } : t
    ));
    if (selectedTweet && selectedTweet.id === tweetId) {
        setSelectedTweet(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleViewTweet = (tweet: TweetData) => {
    if (!tweet.comments || tweet.comments.length === 0) {
      tweet.comments = generateMockComments(tweet.id);
    }
    setSelectedTweet(tweet);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedTweet(null);
  };

  const handleUserClick = (handle: string) => {
      const user = userService.getUser(handle);
      if (user) {
          setViewingProfile(user);
          setSelectedTweet(null); // Clear selected tweet if open
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          console.warn('User not found:', handle);
          // Optional: Fetch mock data if not in local storage?
      }
  };

  const handleSubmitReply = (targetId: string, content: string) => {
    if (!currentUser) return;
    const newReply: TweetComment = {
      id: `reply-${Date.now()}`,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      avatarUrl: currentUser.avatarUrl,
      content: content,
      timestamp: 'เมื่อสักครู่',
      likes: 0
    };

    setTweets(prevTweets => 
      prevTweets.map(t => {
        const isTargetTweet = t.id === targetId;
        const isTargetComment = t.comments?.some(c => c.id === targetId);

        if (isTargetTweet || isTargetComment) {
          const updatedComments = t.comments ? [newReply, ...t.comments] : [newReply];
          return { ...t, replies: t.replies + 1, comments: updatedComments };
        }
        return t;
      })
    );

    if (selectedTweet) {
       const isTargetTweet = selectedTweet.id === targetId;
       const isTargetComment = selectedTweet.comments?.some(c => c.id === targetId);
       
       if (isTargetTweet || isTargetComment) {
          setSelectedTweet(prev => {
             if (!prev) return null;
             const updatedComments = prev.comments ? [newReply, ...prev.comments] : [newReply];
             return { ...prev, replies: prev.replies + 1, comments: updatedComments };
           });
       }
    }
  };

  const handleSubmitQuote = (content: string, quotedTweet: TweetData) => {
    if (!currentUser) return;
    const newTweet: TweetData = {
      id: Date.now().toString(),
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      avatarUrl: currentUser.avatarUrl,
      content: content,
      timestamp: 'เมื่อสักครู่',
      likes: 0,
      retweets: 0,
      replies: 0,
      views: 0,
      isVerified: currentUser.isVerified,
      quotedTweet: quotedTweet
    };
    
    setTweets(prev => [newTweet, ...prev]);

    setTweets(prev => prev.map(t => {
      if (t.id === quotedTweet.id) {
        return { ...t, retweets: t.retweets + 1 };
      }
      return t;
    }));
  };

  // --- Render Flow ---

  // 0. System Check Loader
  if (!isSystemChecked) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
              <Loader2 className="w-10 h-10 animate-spin text-twitter-accent mb-4" />
              <p className="text-twitter-gray text-sm">กำลังเชื่อมต่อกับระบบ...</p>
          </div>
      );
  }

  // 1. Not Installed -> Show Install Page
  if (!isConfigured) {
      return <InstallPage onInstallComplete={handleInstallComplete} />;
  }

  // 2. Not Authenticated -> Show Auth Page
  if (!isAuthenticated || !currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // 3. Main App Content
  const renderContent = () => {
    // 3.1 Viewing Tweet Detail
    if (selectedTweet) {
      return (
        <TweetDetail 
          tweet={selectedTweet}
          onBack={handleBackToFeed}
          onReply={handleReplyClick}
          onHashtagClick={handleTrendClick}
          onUserClick={handleUserClick}
        />
      );
    }

    // 3.2 Viewing Other User Profile
    if (viewingProfile) {
        // Filter tweets for this user (including current mock feeds + maybe some generation if needed)
        // For simplicity, we just filter current loaded tweets
        const userTweets = tweets.filter(t => t.authorHandle === viewingProfile.handle);
        return (
            <UserProfile 
                user={viewingProfile}
                currentUser={currentUser}
                tweets={userTweets}
                onBack={() => setViewingProfile(null)}
                loading={false}
                // No update profile here as we are viewing another user (UserProfile handles edit button visibility)
                onReply={handleReplyClick}
                onHashtagClick={handleTrendClick}
                onUserClick={handleUserClick}
            />
        );
    }

    // 3.3 Main Tabs
    switch (activeTab) {
      case NavigationItem.PROFILE:
        const userTweets = tweets.filter(t => t.authorHandle === currentUser.handle);
        return (
          <UserProfile 
            user={currentUser} 
            currentUser={currentUser}
            tweets={userTweets} 
            onBack={() => setActiveTab(NavigationItem.HOME)}
            loading={loading}
            onUpdateProfile={handleUpdateProfile}
            onReply={handleReplyClick}
            onHashtagClick={handleTrendClick}
            onUserClick={handleUserClick}
          />
        );
      case NavigationItem.EXPLORE:
        return <UserSearch onUserClick={handleUserClick} />;
      case NavigationItem.NOTIFICATIONS:
        return <Notifications />;
      case NavigationItem.MESSAGES:
        return <Messages />;
      case NavigationItem.BOOKMARKS:
        return (
            <Bookmarks 
                tweets={tweets} 
                onReply={handleReplyClick} 
                onClick={handleViewTweet}
                onBookmark={handleBookmarkToggle}
                onHashtagClick={handleTrendClick}
                onUserClick={handleUserClick}
            />
        );
      case NavigationItem.LISTS:
        return <Lists />;
      case NavigationItem.COMMUNITIES:
        return <Communities />;
      case NavigationItem.PREMIUM:
        return <Premium />;
      case NavigationItem.GEMINI:
        return <GeminiPage />;
      case NavigationItem.SETTINGS:
        return <SettingsPage currentUser={currentUser} onUpdateUser={handleUpdateProfile} />;
      case NavigationItem.SPACES:
         return (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                 <Mic className="w-16 h-16 text-twitter-accent mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">Spaces</h2>
                 <p className="text-twitter-gray">บทสนทนาเสียงสดที่เกิดขึ้นในขณะนี้</p>
             </div>
         );
      case NavigationItem.MONETIZATION:
         return (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                 <BadgeDollarSign className="w-16 h-16 text-green-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">ครีเอเตอร์สตูดิโอ</h2>
                 <p className="text-twitter-gray">จัดการรายได้และการสมัครสมาชิกของคุณ</p>
             </div>
         );
      case NavigationItem.ADMIN:
        if (currentUser.isAdmin) {
            return (
                <AdminPage 
                    currentUser={currentUser} 
                    tweets={tweets} 
                    onDeleteTweet={handleDeleteTweet}
                    onRefreshFeed={refreshFeed}
                    onPromoteTweet={handlePromoteTweet}
                    siteConfig={siteConfig}
                    onUpdateSiteConfig={handleUpdateSiteConfig}
                />
            );
        }
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500 font-bold mb-4">Access Denied</p>
                <Button onClick={() => setActiveTab(NavigationItem.HOME)}>Go Home</Button>
            </div>
        );
      case NavigationItem.HOME:
      default:
        return (
          <>
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-twitter-border transition-all">
                <div className="flex items-center justify-between px-4 h-[53px]">
                    <div className="w-[56px]">
                        <div className="sm:hidden">
                             <button onClick={() => setIsDrawerOpen(true)} className="block rounded-full overflow-hidden">
                               <img 
                                 src={currentUser.avatarUrl} 
                                 alt="Profile" 
                                 className="w-8 h-8 object-cover"
                               />
                             </button>
                        </div>
                    </div>

                    <div className="flex justify-center" onClick={scrollToComposer}>
                         {/* Dynamic Logo or Default */}
                         {siteConfig?.logoUrl ? (
                             <img src={siteConfig.logoUrl} alt="Logo" className="h-8 w-8 object-contain cursor-pointer" />
                         ) : (
                             <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-white fill-current cursor-pointer">
                                <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
                            </svg>
                         )}
                    </div>

                    <div className="flex items-center justify-end gap-3 w-[56px]">
                        {isRealTime && (
                            <div className="flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-md animate-pulse">
                                <Radio className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-bold text-red-500 hidden sm:inline">LIVE</span>
                            </div>
                        )}
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="hidden sm:flex h-8 px-3 text-xs font-bold"
                            onClick={() => setActiveTab(NavigationItem.PREMIUM)}
                        >
                            อัปเกรด
                        </Button>
                         <button onClick={refreshFeed} disabled={loading} className="p-2 -mr-2 text-white rounded-full hover:bg-white/10 transition-colors">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {currentTrend ? (
                    <div className="flex items-center gap-4 px-4 py-3 animate-in fade-in slide-in-from-top-1">
                        <button 
                            onClick={handleClearTrend}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white leading-tight">
                                {currentTrend}
                            </h2>
                            <span className="text-xs text-twitter-gray">เทรนด์ฮิต</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex">
                        <div className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4 relative">
                            <span className="font-bold text-white">สำหรับคุณ</span>
                            <div className="absolute bottom-0 h-1 w-14 bg-twitter-accent rounded-full"></div>
                        </div>
                        <div className="flex-1 hover:bg-white/5 transition-colors cursor-pointer flex justify-center py-4">
                            <span className="text-twitter-gray font-medium">กำลังติดตาม</span>
                        </div>
                    </div>
                )}
            </div>
    
            <Composer currentUser={currentUser} onTweet={handleTweet} />
    
            <div className="pb-20">
              {loading && tweets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-twitter-accent mb-4" />
                  <p className="text-twitter-gray">
                    {currentTrend ? `กำลังหาโพสต์เกี่ยวกับ ${currentTrend}...` : 'กำลังสร้างฟีด AI ให้คุณ...'}
                  </p>
                </div>
              ) : (
                tweets.map((tweet) => (
                  <TweetCard 
                    key={tweet.id} 
                    tweet={tweet} 
                    onReply={handleReplyClick} 
                    onClick={handleViewTweet}
                    onBookmark={handleBookmarkToggle}
                    onQuote={handleQuoteClick}
                    onAnalytics={handleAnalyticsClick}
                    onHashtagClick={handleTrendClick}
                    onUserClick={handleUserClick}
                  />
                ))
              )}
              
              {!loading && tweets.length > 0 && (
                <div className="p-8 flex justify-center border-t border-twitter-border">
                   <Loader2 className="w-6 h-6 animate-spin text-twitter-accent" />
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center pb-14 sm:pb-0">
      <MobileSidebar 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={currentUser}
        siteConfig={siteConfig}
        onNavigate={(item) => {
            if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
                handleClearTrend();
            } else {
                setActiveTab(item);
                setSelectedTweet(null);
                setViewingProfile(null);
            }
        }}
        onLogout={handleLogout}
      />

      <ReplyModal 
        isOpen={replyModalOpen}
        tweet={replyingTo}
        currentUser={currentUser}
        onClose={() => setReplyModalOpen(false)}
        onReply={handleSubmitReply}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        tweet={quotingTweet}
        currentUser={currentUser}
        onClose={() => setQuoteModalOpen(false)}
        onQuote={handleSubmitQuote}
      />

      <PostStatsModal
        isOpen={statsModalOpen}
        tweet={analyzingTweet}
        onClose={() => setStatsModalOpen(false)}
      />

      <header className="hidden sm:block flex-shrink-0 w-[88px] xl:w-[275px]">
        <Sidebar 
          activeItem={activeTab} 
          siteConfig={siteConfig}
          onNavigate={(item) => {
            if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
                handleClearTrend();
            } else {
                setActiveTab(item);
                setSelectedTweet(null); 
                setViewingProfile(null);
            }
          }} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </header>

      <main className="flex-grow max-w-[600px] border-r border-twitter-border min-h-screen w-full relative z-0">
        {renderContent()}
      </main>

      <div className="hidden lg:block w-[350px] flex-shrink-0 relative">
        <RightBar onTrendClick={handleTrendClick} onUserClick={handleUserClick} />
      </div>

      {activeTab === NavigationItem.HOME && !selectedTweet && (
        <FloatingTweetButton onClick={scrollToComposer} />
      )}
      <BottomNav activeItem={activeTab} onNavigate={(item) => {
        if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
            handleClearTrend();
        } else {
            setActiveTab(item);
            setSelectedTweet(null);
            setViewingProfile(null);
        }
      }} />

    </div>
  );
};

export default App;