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
import { AdminPage } from './components/AdminPage'; // Import AdminPage
import { MobileSidebar } from './components/MobileSidebar'; // Import MobileSidebar
import { AuthPage } from './components/AuthPage';
import { TweetData, NavigationItem, User, TweetComment } from './types';
import { generateFeed } from './services/geminiService';
import { userService } from './services/userService';
import { MOCK_USERS } from './utils/mockData';
import { Loader2, RefreshCcw, ArrowLeft, MoreVertical, Mic, BadgeDollarSign } from 'lucide-react';
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
  // Default to authenticated for demo purposes
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Set default tab to ADMIN to show the panel immediately
  const [activeTab, setActiveTab] = useState<NavigationItem>(NavigationItem.ADMIN);
  
  // Initialize with ADMIN user
  const [currentUser, setCurrentUser] = useState<User | null>({
      name: 'System Admin',
      handle: 'admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
      bio: 'Official System Administrator',
      joinedDate: 'Joined Jan 2024',
      following: 0,
      followers: 0,
      isVerified: true,
      isAdmin: true
  });

  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Feed State
  const [currentTrend, setCurrentTrend] = useState<string | null>(null);

  // Navigation State
  const [selectedTweet, setSelectedTweet] = useState<TweetData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Mobile Drawer State

  // Modal States
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<TweetData | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quotingTweet, setQuotingTweet] = useState<TweetData | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [analyzingTweet, setAnalyzingTweet] = useState<TweetData | null>(null);

  // Check for existing session on mount (overrides default demo state if session exists)
  useEffect(() => {
    const sessionUser = userService.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      // If the session user is admin, allow staying on admin tab, otherwise reset to HOME
      if (!sessionUser.isAdmin) {
          setActiveTab(NavigationItem.HOME);
      }
    }
  }, []);

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

  const handleTweet = (content: string, scheduledDate?: string) => {
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
    };
    setTweets(prev => [newTweet, ...prev]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    userService.updateUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  // Admin: Delete Tweet
  const handleDeleteTweet = (tweetId: string) => {
      setTweets(prev => prev.filter(t => t.id !== tweetId));
  };

  const refreshFeed = async () => {
    setLoading(true);
    // Respect current trend filter when refreshing
    const aiTweets = await generateFeed(currentTrend || undefined);
    setTweets(prev => [...aiTweets, ...prev]);
    setLoading(false);
  };

  const handleTrendClick = async (topic: string) => {
    setLoading(true);
    setActiveTab(NavigationItem.HOME);
    setSelectedTweet(null);
    setCurrentTrend(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch tweets specifically for this topic
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
  
  // Open reply modal from anywhere
  const handleReplyClick = (tweet: TweetData) => {
    setReplyingTo(tweet);
    setReplyModalOpen(true);
  };

  // Open quote modal
  const handleQuoteClick = (tweet: TweetData) => {
    setQuotingTweet(tweet);
    setQuoteModalOpen(true);
  };

  // Open analytics modal
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

  // Open detail view
  const handleViewTweet = (tweet: TweetData) => {
    // If tweet doesn't have comments, add mocks for demo purposes
    if (!tweet.comments || tweet.comments.length === 0) {
      tweet.comments = generateMockComments(tweet.id);
    }
    setSelectedTweet(tweet);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedTweet(null);
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
        // Check if this tweet is the target OR if one of its comments is the target
        const isTargetTweet = t.id === targetId;
        const isTargetComment = t.comments?.some(c => c.id === targetId);

        if (isTargetTweet || isTargetComment) {
          const updatedComments = t.comments ? [newReply, ...t.comments] : [newReply];
          return { ...t, replies: t.replies + 1, comments: updatedComments };
        }
        return t;
      })
    );

    // If currently viewing this tweet, update the selectedTweet state as well
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
    
    // Add new tweet to top of feed
    setTweets(prev => [newTweet, ...prev]);

    // Also update retweets count of original tweet
    setTweets(prev => prev.map(t => {
      if (t.id === quotedTweet.id) {
        return { ...t, retweets: t.retweets + 1 };
      }
      return t;
    }));
  };

  const renderContent = () => {
    if (!currentUser) return null;

    if (selectedTweet) {
      return (
        <TweetDetail 
          tweet={selectedTweet}
          onBack={handleBackToFeed}
          onReply={handleReplyClick}
        />
      );
    }

    switch (activeTab) {
      case NavigationItem.PROFILE:
        const userTweets = tweets.filter(t => t.authorHandle === currentUser.handle);
        return (
          <UserProfile 
            user={currentUser} 
            tweets={userTweets} 
            onBack={() => setActiveTab(NavigationItem.HOME)}
            loading={loading}
            onUpdateProfile={handleUpdateProfile}
            onReply={handleReplyClick}
          />
        );
      case NavigationItem.EXPLORE:
        return <UserSearch />;
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
      case NavigationItem.SPACES: // Placeholder for Spaces
         return (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                 <Mic className="w-16 h-16 text-twitter-accent mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">Spaces</h2>
                 <p className="text-twitter-gray">บทสนทนาเสียงสดที่เกิดขึ้นในขณะนี้</p>
             </div>
         );
      case NavigationItem.MONETIZATION: // Placeholder for Monetization
         return (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                 <BadgeDollarSign className="w-16 h-16 text-green-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">ครีเอเตอร์สตูดิโอ</h2>
                 <p className="text-twitter-gray">จัดการรายได้และการสมัครสมาชิกของคุณ</p>
             </div>
         );
      case NavigationItem.ADMIN:
        // Protect Route
        if (currentUser.isAdmin) {
            return (
                <AdminPage 
                    currentUser={currentUser} 
                    tweets={tweets} 
                    onDeleteTweet={handleDeleteTweet}
                    onRefreshFeed={refreshFeed}
                />
            );
        }
        return null;
      case NavigationItem.HOME:
      default:
        return (
          <>
            {/* Header Structure */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-twitter-border transition-all">
                {/* Top Bar (Avatar, Logo, Upgrade) - Visible mostly on Mobile, Logo on Desktop */}
                <div className="flex items-center justify-between px-4 h-[53px]">
                    {/* Left: Avatar (Mobile Only) */}
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

                    {/* Center: Logo */}
                    <div className="flex justify-center" onClick={scrollToComposer}>
                         <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-white fill-current cursor-pointer">
                            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
                        </svg>
                    </div>

                    {/* Right: Upgrade & Menu */}
                    <div className="flex items-center justify-end gap-3 w-[56px]">
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

                {/* Tab Selection OR Trend Header */}
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
    
            {/* Compose Tweet (Only show if not in trend mode, or keep it? Standard Twitter keeps it) */}
            <Composer currentUser={currentUser} onTweet={handleTweet} />
    
            {/* Tweet Feed */}
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
                  />
                ))
              )}
              
              {/* Load More Trigger (Simulated) */}
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

  if (!isAuthenticated || !currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center pb-14 sm:pb-0">
      
      {/* Mobile Sidebar (Drawer) */}
      <MobileSidebar 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={currentUser}
        onNavigate={(item) => {
            if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
                handleClearTrend();
            } else {
                setActiveTab(item);
                setSelectedTweet(null);
            }
        }}
        onLogout={handleLogout}
      />

      {/* Reply Modal */}
      <ReplyModal 
        isOpen={replyModalOpen}
        tweet={replyingTo}
        currentUser={currentUser}
        onClose={() => setReplyModalOpen(false)}
        onReply={handleSubmitReply}
      />

      {/* Quote Modal */}
      <QuoteModal
        isOpen={quoteModalOpen}
        tweet={quotingTweet}
        currentUser={currentUser}
        onClose={() => setQuoteModalOpen(false)}
        onQuote={handleSubmitQuote}
      />

      {/* Analytics Modal */}
      <PostStatsModal
        isOpen={statsModalOpen}
        tweet={analyzingTweet}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Left Sidebar Spacer - Hidden on Mobile */}
      <header className="hidden sm:block flex-shrink-0 w-[88px] xl:w-[275px]">
        <Sidebar 
          activeItem={activeTab} 
          onNavigate={(item) => {
            // If clicking Home while in a trend, clear the trend.
            if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
                handleClearTrend();
            } else {
                setActiveTab(item);
                setSelectedTweet(null); // Reset selection when changing tabs
            }
          }} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </header>

      {/* Main Feed Section */}
      <main className="flex-grow max-w-[600px] border-r border-twitter-border min-h-screen w-full relative z-0">
        {renderContent()}
      </main>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[350px] flex-shrink-0 relative">
        <RightBar onTrendClick={handleTrendClick} />
      </div>

      {/* Mobile Elements */}
      {activeTab === NavigationItem.HOME && !selectedTweet && (
        <FloatingTweetButton onClick={scrollToComposer} />
      )}
      <BottomNav activeItem={activeTab} onNavigate={(item) => {
        if (item === NavigationItem.HOME && activeTab === NavigationItem.HOME && currentTrend) {
            handleClearTrend();
        } else {
            setActiveTab(item);
            setSelectedTweet(null);
        }
      }} />

    </div>
  );
};

export default App;