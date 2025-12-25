import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, BarChart, Trash2, CheckCircle, Ban, Search, AlertTriangle } from 'lucide-react';
import { User, TweetData } from '../types';
import { userService } from '../services/userService';
import { Button } from './Button';

interface AdminPageProps {
  currentUser: User;
  tweets: TweetData[];
  onDeleteTweet: (tweetId: string) => void;
  onRefreshFeed: () => void;
}

type AdminTab = 'overview' | 'users' | 'content';

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, tweets, onDeleteTweet, onRefreshFeed }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setAllUsers(userService.getAllUsers());
  };

  const handleDeleteUser = (handle: string) => {
    if (handle === currentUser.handle) {
        alert("You cannot delete yourself.");
        return;
    }
    if (confirm(`Are you sure you want to ban @${handle}? This cannot be undone.`)) {
        userService.deleteUser(handle);
        loadUsers();
    }
  };

  const handleVerifyToggle = (handle: string) => {
    userService.toggleVerifyUser(handle);
    loadUsers();
  };

  const handleDeleteContent = (tweetId: string) => {
      if (confirm("Delete this post permanently?")) {
          onDeleteTweet(tweetId);
      }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.handle.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Stats
  const totalUsers = allUsers.length;
  const totalTweets = tweets.length; // In a real app this would fetch total from DB
  const totalViews = tweets.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">Total Users</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{totalUsers.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-sm text-green-500 mt-4 flex items-center gap-1">
                    <span className="font-bold">+12%</span> from last month
                </p>
            </div>

            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">Active Posts</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{totalTweets.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-sm text-green-500 mt-4 flex items-center gap-1">
                    <span className="font-bold">+5%</span> from yesterday
                </p>
            </div>

            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">Total Impressions</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{(totalViews / 1000).toFixed(1)}K</h3>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500">
                        <BarChart className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-sm text-green-500 mt-4 flex items-center gap-1">
                    <span className="font-bold">+24%</span> viral growth
                </p>
            </div>
        </div>

        <div className="bg-twitter-card border border-twitter-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-twitter-border">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-white">Database Status</span>
                    </div>
                    <span className="text-green-500 text-sm font-bold">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-twitter-border">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-white">Gemini AI API</span>
                    </div>
                    <span className="text-green-500 text-sm font-bold">Connected</span>
                </div>
            </div>
        </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">User Management</h3>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-twitter-card border border-twitter-border rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-twitter-accent w-64"
                />
                <Search className="w-4 h-4 text-twitter-gray absolute left-3 top-3" />
            </div>
        </div>

        <div className="bg-twitter-card border border-twitter-border rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-twitter-gray text-xs uppercase">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-twitter-border">
                    {filteredUsers.map((user) => (
                        <tr key={user.handle} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-black object-cover" />
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-1">
                                            {user.name}
                                            {user.isVerified && <CheckCircle className="w-3 h-3 text-twitter-accent fill-current" />}
                                        </div>
                                        <div className="text-sm text-twitter-gray">@{user.handle}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-bold">
                                    Active
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {user.isAdmin ? (
                                    <span className="text-red-400 font-bold text-xs border border-red-400/50 px-2 py-1 rounded">ADMIN</span>
                                ) : (
                                    <span className="text-twitter-gray text-xs">USER</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleVerifyToggle(user.handle)}
                                        title={user.isVerified ? "Remove Verification" : "Verify User"}
                                        className={`p-2 rounded-lg transition-colors ${user.isVerified ? 'bg-twitter-accent text-white' : 'bg-white/10 text-twitter-gray hover:text-white'}`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    {!user.isAdmin && (
                                        <button 
                                            onClick={() => handleDeleteUser(user.handle)}
                                            title="Ban User"
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Ban className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Recent Content Management</h3>
            <Button size="sm" onClick={onRefreshFeed} variant="outline">Refresh Feed Data</Button>
        </div>

        <div className="space-y-4">
            {tweets.map(tweet => (
                <div key={tweet.id} className="bg-twitter-card border border-twitter-border p-4 rounded-xl flex gap-4">
                    <img src={tweet.avatarUrl} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <div>
                                <span className="font-bold text-white mr-2">{tweet.authorName}</span>
                                <span className="text-twitter-gray text-sm">@{tweet.authorHandle}</span>
                                <span className="text-twitter-gray text-sm mx-2">·</span>
                                <span className="text-twitter-gray text-sm">{tweet.timestamp}</span>
                             </div>
                             <button 
                                onClick={() => handleDeleteContent(tweet.id)}
                                className="text-twitter-gray hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                        <p className="text-white mt-2">{tweet.content}</p>
                        
                        <div className="flex gap-4 mt-3 text-xs text-twitter-gray">
                            <span>❤️ {tweet.likes}</span>
                            <span>🔁 {tweet.retweets}</span>
                            <span>👀 {tweet.views}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="bg-red-500 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white fill-current" />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                 <p className="text-xs text-twitter-gray">System Administration</p>
             </div>
         </div>
         <div className="text-sm text-twitter-gray">
             Logged in as <span className="text-white font-bold">{currentUser.name}</span>
         </div>
      </div>

      {/* Main Layout */}
      <div className="p-6 max-w-6xl mx-auto">
         {/* Tabs */}
         <div className="flex gap-4 mb-8 border-b border-twitter-border pb-1">
             {[
                 { id: 'overview', label: 'Overview', icon: BarChart },
                 { id: 'users', label: 'User Management', icon: Users },
                 { id: 'content', label: 'Content', icon: FileText },
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-twitter-accent text-twitter-accent font-bold' 
                        : 'border-transparent text-twitter-gray hover:text-white'
                    }`}
                 >
                     <tab.icon className="w-4 h-4" />
                     {tab.label}
                 </button>
             ))}
         </div>

         {/* Tab Content */}
         {activeTab === 'overview' && renderOverview()}
         {activeTab === 'users' && renderUsers()}
         {activeTab === 'content' && renderContent()}

      </div>
    </div>
  );
};