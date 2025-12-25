import React, { useState, useEffect, useRef } from 'react';
import { Shield, Users, FileText, BarChart, Trash2, CheckCircle, Ban, Search, AlertTriangle, Upload, BadgeCheck, X, Square, Circle, Briefcase } from 'lucide-react';
import { User, TweetData, Community } from '../types';
import { userService } from '../services/userService';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';

interface AdminPageProps {
  currentUser: User;
  tweets: TweetData[];
  onDeleteTweet: (tweetId: string) => void;
  onRefreshFeed: () => void;
}

type AdminTab = 'overview' | 'users' | 'content' | 'verification' | 'communities';

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, tweets, onDeleteTweet, onRefreshFeed }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  
  // Badge Pool Management
  const [globalBadges, setGlobalBadges] = useState<(string | null)[]>(userService.getGlobalBadges());
  const badgeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // User Badge Selection Modal
  const [selectedUserForBadges, setSelectedUserForBadges] = useState<User | null>(null);
  
  // Communities
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAllUsers(userService.getAllUsers());
    setGlobalBadges(userService.getGlobalBadges());
    setAllCommunities(userService.getCommunities());
  };

  const handleDeleteUser = (handle: string) => {
    if (handle === currentUser.handle) {
        alert("You cannot delete yourself.");
        return;
    }
    if (confirm(`Are you sure you want to ban @${handle}? This cannot be undone.`)) {
        userService.deleteUser(handle);
        loadData();
    }
  };

  const handleVerifyToggle = (handle: string) => {
    userService.toggleVerifyUser(handle);
    loadData();
  };
  
  const handleProfileShapeToggle = (handle: string) => {
      userService.toggleProfileShape(handle);
      loadData();
  };

  const handleDeleteContent = (tweetId: string) => {
      if (confirm("Delete this post permanently?")) {
          onDeleteTweet(tweetId);
      }
  };

  // --- Badge Pool Logic ---
  const handleBadgeUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        userService.setGlobalBadge(index, base64String);
        setGlobalBadges(userService.getGlobalBadges()); // Refresh UI
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBadgeFromPool = (index: number) => {
      userService.setGlobalBadge(index, null);
      setGlobalBadges(userService.getGlobalBadges());
  };

  // --- User Badge Assignment ---
  const toggleUserBadge = (badgeUrl: string) => {
      if (!selectedUserForBadges) return;
      
      let currentBadges = selectedUserForBadges.verifiedBadges || [];
      
      if (currentBadges.includes(badgeUrl)) {
          currentBadges = currentBadges.filter(b => b !== badgeUrl);
      } else {
          if (currentBadges.length < 5) {
              currentBadges = [...currentBadges, badgeUrl];
          } else {
              alert("Max 5 badges allowed per user.");
              return;
          }
      }
      
      userService.updateUserBadges(selectedUserForBadges.handle, currentBadges);
      
      // Update local state for immediate UI feedback in modal
      setSelectedUserForBadges({ ...selectedUserForBadges, verifiedBadges: currentBadges });
      loadData(); // Refresh main list
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.handle.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Stats
  const totalUsers = allUsers.length;
  const totalViews = tweets.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalVerified = allUsers.filter(u => u.isVerified).length;

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
            </div>

            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">Verified Users</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{totalVerified.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
                        <BadgeCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">Community Count</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{allCommunities.length}</h3>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">Global Verified Badge Pool (Max 5)</h3>
            <p className="text-twitter-gray mb-6 text-sm">
                Upload up to 5 custom badges here. These badges can then be assigned to specific users in the "Users" tab.
            </p>

            <div className="grid grid-cols-5 gap-4">
                {globalBadges.map((badge, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-black border border-twitter-border rounded-lg flex items-center justify-center relative overflow-hidden group">
                            {badge ? (
                                <>
                                    <img src={badge} className="w-10 h-10 object-contain" />
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                                        <button onClick={() => handleRemoveBadgeFromPool(index)} className="text-red-500 p-1 bg-white rounded-full">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button onClick={() => badgeInputRefs.current[index]?.click()} className="w-full h-full flex items-center justify-center text-twitter-gray hover:text-white hover:bg-white/5 transition-colors">
                                    <Upload className="w-6 h-6" />
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={el => badgeInputRefs.current[index] = el}
                                accept="image/*"
                                onChange={(e) => handleBadgeUpload(index, e)}
                                className="hidden"
                            />
                        </div>
                        <span className="text-xs text-twitter-gray">Slot {index + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Manage Users</h3>
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
                        <th className="px-6 py-4">Shape</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-twitter-border">
                    {filteredUsers.map((user) => (
                        <tr key={user.handle} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt="" className={`w-10 h-10 bg-black object-cover ${user.profileShape === 'square' ? 'rounded-lg' : 'rounded-full'}`} />
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-1">
                                            {user.name}
                                            <VerifiedBadge user={user} className="w-3 h-3" />
                                        </div>
                                        <div className="text-sm text-twitter-gray">@{user.handle}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => handleProfileShapeToggle(user.handle)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-twitter-gray hover:text-white transition-colors flex items-center gap-2"
                                    title="Toggle Profile Shape"
                                >
                                    {user.profileShape === 'square' ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    <span className="text-xs">{user.profileShape === 'square' ? 'Square' : 'Circle'}</span>
                                </button>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleVerifyToggle(user.handle)}
                                        className={`p-2 rounded-full transition-colors ${user.isVerified ? 'text-twitter-accent bg-twitter-accent/10' : 'text-twitter-gray bg-white/5'}`}
                                        title="Toggle Verification"
                                    >
                                        <BadgeCheck className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedUserForBadges(user)}
                                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-white"
                                    >
                                        Badges ({user.verifiedBadges?.length || 0})
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
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

  const renderCommunities = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
             <h3 className="text-xl font-bold text-white mb-4">Manage Communities</h3>
             {allCommunities.length === 0 ? (
                 <p className="text-twitter-gray">No communities created yet.</p>
             ) : (
                 <div className="space-y-4">
                     {allCommunities.map(c => (
                         <div key={c.id} className="flex items-center justify-between border-b border-twitter-border pb-4">
                             <div className="flex items-center gap-3">
                                 <img src={c.avatarUrl} className="w-10 h-10 rounded-lg" />
                                 <div>
                                     <div className="font-bold text-white">{c.name}</div>
                                     <div className="text-xs text-twitter-gray">{c.memberCount} members</div>
                                 </div>
                             </div>
                             <div className="px-3 py-1 bg-white/5 rounded text-xs text-twitter-gray">
                                 ID: {c.id}
                             </div>
                         </div>
                     ))}
                 </div>
             )}
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
         <div className="flex gap-4 mb-8 border-b border-twitter-border pb-1 overflow-x-auto">
             {[
                 { id: 'overview', label: 'Overview', icon: BarChart },
                 { id: 'users', label: 'Users', icon: Users },
                 { id: 'verification', label: 'Badges', icon: BadgeCheck },
                 { id: 'communities', label: 'Communities', icon: Users },
                 { id: 'content', label: 'Content', icon: FileText },
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
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
         {activeTab === 'verification' && renderVerification()}
         {activeTab === 'users' && renderUsers()}
         {activeTab === 'communities' && renderCommunities()}
         {activeTab === 'content' && (
             // Content management logic from previous step
             <div className="space-y-4">
                 <div className="flex justify-between">
                    <h3 className="text-xl font-bold text-white">Latest Posts</h3>
                    <Button size="sm" onClick={onRefreshFeed} variant="outline">Refresh</Button>
                 </div>
                {tweets.map(tweet => (
                    <div key={tweet.id} className="bg-twitter-card border border-twitter-border p-4 rounded-xl flex gap-4">
                        <img src={tweet.avatarUrl} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold text-white mr-2">{tweet.authorName}</span>
                                    <span className="text-twitter-gray text-sm">@{tweet.authorHandle}</span>
                                </div>
                                <button onClick={() => handleDeleteContent(tweet.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-white mt-2">{tweet.content}</p>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>

      {/* Badge Selection Modal */}
      {selectedUserForBadges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Assign Badges</h3>
                      <button onClick={() => setSelectedUserForBadges(null)} className="text-twitter-gray hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <p className="text-twitter-gray mb-4">Select badges for <strong>@{selectedUserForBadges.handle}</strong> (Max 5)</p>
                  
                  <div className="grid grid-cols-5 gap-4 mb-6">
                      {globalBadges.map((badge, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => badge && toggleUserBadge(badge)}
                            className={`aspect-square rounded-lg border flex items-center justify-center cursor-pointer relative ${
                                badge && selectedUserForBadges.verifiedBadges?.includes(badge) 
                                ? 'border-twitter-accent bg-twitter-accent/10' 
                                : 'border-twitter-border hover:bg-white/5'
                            }`}
                          >
                              {badge ? (
                                  <>
                                    <img src={badge} className="w-8 h-8 object-contain" />
                                    {selectedUserForBadges.verifiedBadges?.includes(badge) && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-twitter-accent rounded-full"></div>
                                    )}
                                  </>
                              ) : (
                                  <span className="text-xs text-twitter-gray">Empty</span>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="flex justify-end">
                      <Button onClick={() => setSelectedUserForBadges(null)}>Done</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};