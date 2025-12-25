import React, { useState, useEffect, useRef } from 'react';
import { Shield, Users, FileText, BarChart, Trash2, CheckCircle, Ban, Search, AlertTriangle, Upload, BadgeCheck, X, Square, Circle, Briefcase, Eye, Edit3, Save, KeyRound, Crown, CreditCard, Clock, Check, Star, Type, ArrowUpCircle, Smartphone, Zap, Heart, DollarSign, Building, User as UserIcon, LayoutDashboard, Flag, Menu, Camera, Megaphone, Settings, Globe, Mail, Plus } from 'lucide-react';
import { User, TweetData, Community, SiteConfig, EmailConfig } from '../types';
import { userService, PremiumPrivilege, PremiumPlan } from '../services/userService';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';

interface AdminPageProps {
  currentUser: User;
  tweets: TweetData[];
  onDeleteTweet: (tweetId: string) => void;
  onRefreshFeed: () => void;
  onPromoteTweet: (tweetId: string) => void;
  siteConfig: SiteConfig | null;
  onUpdateSiteConfig: (config: SiteConfig) => void;
}

type AdminTab = 'overview' | 'users' | 'content' | 'verification' | 'communities' | 'premium' | 'settings' | 'email';

// Map icon strings to components for display
const ICON_MAP: Record<string, React.FC<any>> = {
    Check, Star, Zap, Crown, Shield, BadgeCheck, Type, Edit3, ArrowUpCircle, Smartphone, Heart, Clock, Building
};

export const AdminPage: React.FC<AdminPageProps> = ({ currentUser, tweets, onDeleteTweet, onRefreshFeed, onPromoteTweet, siteConfig, onUpdateSiteConfig }) => {
  // State definitions
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  
  // Settings Management
  const [configName, setConfigName] = useState('');
  const [configLogo, setConfigLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Badge Pool Management
  const [globalBadges, setGlobalBadges] = useState<(string | null)[]>(userService.getGlobalBadges());
  const badgeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Premium Config Management
  const [premiumBadgeUrl, setPremiumBadgeUrl] = useState<string | null>(userService.getPremiumBadgeUrl());
  const [businessBadgeUrl, setBusinessBadgeUrl] = useState<string | null>(userService.getBusinessBadgeUrl());
  const premiumBadgeInputRef = useRef<HTMLInputElement>(null);
  const businessBadgeInputRef = useRef<HTMLInputElement>(null);
  const [premiumPrivileges, setPremiumPrivileges] = useState<PremiumPrivilege[]>(userService.getPremiumPrivileges());
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>(userService.getPremiumPlans());
  
  // Email Config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(userService.getEmailConfig());

  // Privilege Editing
  const [editingPrivilege, setEditingPrivilege] = useState<PremiumPrivilege | null>(null);
  const [isAddingPrivilege, setIsAddingPrivilege] = useState(false);
  
  // Plan Editing
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);

  // User Badge Selection Modal
  const [selectedUserForBadges, setSelectedUserForBadges] = useState<User | null>(null);
  
  // User Management Modals
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [originalEditingHandle, setOriginalEditingHandle] = useState<string>(''); // Track handle before edit
  const [newPassword, setNewPassword] = useState('');
  
  // Communities
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [communityMembers, setCommunityMembers] = useState<User[]>([]);
  const [communityTab, setCommunityTab] = useState<'general' | 'members'>('general');
  const communityAvatarInputRef = useRef<HTMLInputElement>(null);
  
  // Premium Management
  const [managePremiumUser, setManagePremiumUser] = useState<User | null>(null);
  const [premiumDuration, setPremiumDuration] = useState<number | 'lifetime'>(30); // Default 30 days
  const [premiumType, setPremiumType] = useState<'individual' | 'business'>('individual');
  const [userPrivileges, setUserPrivileges] = useState<string[]>([]); // New state for selected privileges for a user
  const [premiumSearch, setPremiumSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
      if (siteConfig) {
          setConfigName(siteConfig.siteName);
          setConfigLogo(siteConfig.logoUrl || null);
      }
  }, [siteConfig]);

  const loadData = () => {
    setAllUsers(userService.getAllUsers());
    setGlobalBadges(userService.getGlobalBadges());
    setAllCommunities(userService.getCommunities());
    setPremiumBadgeUrl(userService.getPremiumBadgeUrl());
    setBusinessBadgeUrl(userService.getBusinessBadgeUrl());
    setPremiumPrivileges(userService.getPremiumPrivileges());
    setPremiumPlans(userService.getPremiumPlans());
    setEmailConfig(userService.getEmailConfig());
  };

  // Update privilege checkboxes when plan type changes or user is selected
  useEffect(() => {
      if (managePremiumUser) {
          // If user already has custom privileges saved, use them
          if (managePremiumUser.customPrivileges && managePremiumUser.customPrivileges.length > 0) {
              setUserPrivileges(managePremiumUser.customPrivileges);
          } else {
              // Otherwise, default to all privileges available for the selected plan type
              const defaultPrivileges = premiumPrivileges
                  .filter(p => p.plans?.includes(premiumType))
                  .map(p => p.id);
              setUserPrivileges(defaultPrivileges);
          }
      }
  }, [managePremiumUser, premiumType, premiumPrivileges]);

  const handleDeleteUser = (handle: string) => {
    if (handle === currentUser.handle) {
        alert("คุณไม่สามารถลบบัญชีตัวเองได้");
        return;
    }
    if (confirm(`คุณแน่ใจหรือไม่ที่จะระงับการใช้งาน @${handle}? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
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
      if (confirm("ลบโพสต์นี้ถาวร?")) {
          onDeleteTweet(tweetId);
      }
  };

  const handleBadgeUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const url = await userService.uploadMedia(file);
        userService.setGlobalBadge(index, url);
        setGlobalBadges(userService.getGlobalBadges());
      } catch (e) {
        alert('Upload failed');
      }
    }
  };

  const handleRemoveBadgeFromPool = (index: number) => {
      userService.setGlobalBadge(index, null);
      setGlobalBadges(userService.getGlobalBadges());
  };

  const handlePremiumBadgeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          try {
              const url = await userService.uploadMedia(file);
              userService.setPremiumBadgeUrl(url);
              setPremiumBadgeUrl(url);
          } catch (e) {
              alert('Upload failed');
          }
      }
  };

  const handleRemovePremiumBadge = () => {
      userService.setPremiumBadgeUrl(null);
      setPremiumBadgeUrl(null);
  };

  const handleBusinessBadgeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          try {
              const url = await userService.uploadMedia(file);
              userService.setBusinessBadgeUrl(url);
              setBusinessBadgeUrl(url);
          } catch (e) {
              alert('Upload failed');
          }
      }
  };

  const handleRemoveBusinessBadge = () => {
      userService.setBusinessBadgeUrl(null);
      setBusinessBadgeUrl(null);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          try {
              const url = await userService.uploadMedia(file);
              setConfigLogo(url);
          } catch (e) {
              alert('Upload failed');
          }
      }
  };

  const handleSaveSiteConfig = () => {
      if (siteConfig) {
          const newConfig = {
              ...siteConfig,
              siteName: configName,
              logoUrl: configLogo || undefined
          };
          onUpdateSiteConfig(newConfig);
          alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
      }
  };

  const handleSaveEmailConfig = () => {
      userService.updateEmailConfig(emailConfig);
      alert('บันทึกการตั้งค่าอีเมลเรียบร้อยแล้ว');
  };

  const handleSavePrivilege = () => {
      if (!editingPrivilege) return;
      let newPrivileges = [...premiumPrivileges];
      if (isAddingPrivilege) {
          newPrivileges.push(editingPrivilege);
      } else {
          const index = newPrivileges.findIndex(p => p.id === editingPrivilege.id);
          if (index !== -1) newPrivileges[index] = editingPrivilege;
      }
      userService.updatePremiumPrivileges(newPrivileges);
      setPremiumPrivileges(newPrivileges);
      setEditingPrivilege(null);
      setIsAddingPrivilege(false);
  };

  const handleDeletePrivilege = (id: string) => {
      if(confirm('ลบสิทธิพิเศษนี้?')) {
          const newPrivileges = premiumPrivileges.filter(p => p.id !== id);
          userService.updatePremiumPrivileges(newPrivileges);
          setPremiumPrivileges(newPrivileges);
      }
  };

  const openAddPrivilegeModal = () => {
      setEditingPrivilege({
          id: `priv-${Date.now()}`,
          icon: 'Check',
          title: '',
          description: '',
          plans: ['individual']
      });
      setIsAddingPrivilege(true);
  };

  const handleSavePlan = () => {
      if (!editingPlan) return;
      const updatedPlans = premiumPlans.map(p => p.id === editingPlan.id ? editingPlan : p);
      userService.updatePremiumPlans(updatedPlans);
      setPremiumPlans(updatedPlans);
      setEditingPlan(null);
  };

  const toggleUserBadge = (badgeUrl: string) => {
      if (!selectedUserForBadges) return;
      let currentBadges = selectedUserForBadges.verifiedBadges || [];
      if (currentBadges.includes(badgeUrl)) {
          currentBadges = currentBadges.filter(b => b !== badgeUrl);
      } else {
          if (currentBadges.length < 5) {
              currentBadges = [...currentBadges, badgeUrl];
          } else {
              alert("อนุญาตให้มีตราสัญลักษณ์สูงสุด 5 รายการต่อผู้ใช้");
              return;
          }
      }
      userService.updateUserBadges(selectedUserForBadges.handle, currentBadges);
      setSelectedUserForBadges({ ...selectedUserForBadges, verifiedBadges: currentBadges });
      loadData();
  };

  const handleEditUserClick = (user: User) => {
      setEditingUser(user);
      setOriginalEditingHandle(user.handle);
      setNewPassword('');
  };

  const handleSaveUser = () => {
      if (editingUser) {
          userService.adminUpdateUser(originalEditingHandle, editingUser);
          if (newPassword.trim()) {
              userService.adminResetPassword(editingUser.handle, newPassword);
          }
          setEditingUser(null);
          setNewPassword('');
          loadData();
      }
  };

  const handleOpenEditCommunity = (comm: Community) => {
      setEditingCommunity(comm);
      setCommunityMembers(userService.getCommunityMembers(comm.id));
      setCommunityTab('general');
  };

  const handleCommunityAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && editingCommunity) {
          try {
              const url = await userService.uploadMedia(file);
              setEditingCommunity({ ...editingCommunity, avatarUrl: url });
          } catch (e) {
              alert('Upload failed');
          }
      }
  };

  const handleSaveCommunity = () => {
      if (editingCommunity) {
          userService.updateCommunity(editingCommunity.id, editingCommunity);
          setEditingCommunity(null);
          loadData();
      }
  };
  
  const handleToggleBanCommunity = (comm: Community) => {
      const newStatus = !comm.isBanned;
      if (confirm(`คุณแน่ใจหรือไม่ที่จะ ${newStatus ? 'ระงับ' : 'ยกเลิกการระงับ'} ชุมชน ${comm.name}?`)) {
          userService.updateCommunity(comm.id, { isBanned: newStatus });
          loadData();
      }
  };
  
  const handleDeleteCommunity = (id: string) => {
      if (confirm("คุณแน่ใจหรือไม่ที่จะลบชุมชนนี้ถาวร?")) {
          userService.deleteCommunity(id);
          loadData();
      }
  };

  const handleBanUserFromCommunity = (handle: string) => {
      if (!editingCommunity) return;
      if (confirm(`คุณแน่ใจหรือไม่ที่จะแบน @${handle} จากชุมชนนี้?`)) {
          userService.banUserFromCommunity(editingCommunity.id, handle);
          // Refresh local state
          const updatedComm = userService.getCommunities().find(c => c.id === editingCommunity.id);
          if (updatedComm) {
              setEditingCommunity(updatedComm);
              setCommunityMembers(userService.getCommunityMembers(updatedComm.id));
          }
      }
  };

  const handleUnbanUserFromCommunity = (handle: string) => {
      if (!editingCommunity) return;
      if (confirm(`ยกเลิกการแบน @${handle}?`)) {
          userService.unbanUserFromCommunity(editingCommunity.id, handle);
          // Refresh local state
          const updatedComm = userService.getCommunities().find(c => c.id === editingCommunity.id);
          if (updatedComm) {
              setEditingCommunity(updatedComm);
          }
      }
  };

  const handleOpenPremiumModal = (handle?: string) => {
      if (!handle) {
          alert('กรุณาระบุชื่อผู้ใช้');
          return;
      }
      const user = allUsers.find(u => u.handle.toLowerCase() === handle.toLowerCase().replace('@', ''));
      if (user) {
          setManagePremiumUser(user);
          setPremiumSearch('');
          setPremiumType(user.premiumType || 'individual');
      } else {
          alert('ไม่พบผู้ใช้');
      }
  };

  const confirmGrantPremium = () => {
      if (managePremiumUser) {
          if (premiumDuration === 'lifetime') {
              userService.grantPremiumUser(managePremiumUser.handle, undefined, premiumType, userPrivileges);
          } else {
              userService.grantPremiumUser(managePremiumUser.handle, premiumDuration as number, premiumType, userPrivileges);
          }
          setManagePremiumUser(null);
          loadData();
      }
  };

  const confirmRevokePremium = () => {
       if (managePremiumUser) {
           userService.revokePremiumUser(managePremiumUser.handle);
           setManagePremiumUser(null);
           loadData();
       }
  };

  const handleTabChange = (tab: AdminTab) => {
      setActiveTab(tab);
      setIsSidebarOpen(false); // Close mobile sidebar on selection
  };


  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.handle.toLowerCase().includes(userSearch.toLowerCase())
  );
  
  const premiumUsers = allUsers.filter(u => u.isPremium);
  const totalVerified = allUsers.filter(u => u.isVerified).length;
  const totalUsers = allUsers.length;


  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">ผู้ใช้ทั้งหมด</p>
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
                        <p className="text-twitter-gray font-medium">ผู้ใช้ที่ยืนยันตัวตน</p>
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
                        <p className="text-twitter-gray font-medium">สมาชิก Premium</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{premiumUsers.length.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-twitter-accent/20 rounded-lg text-twitter-accent">
                        <Crown className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-twitter-gray font-medium">จำนวนชุมชน</p>
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

  const renderUsers = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-twitter-card border border-twitter-border p-4 rounded-xl">
             <div className="relative w-full sm:w-96">
                 <Search className="absolute left-3 top-3 w-4 h-4 text-twitter-gray" />
                 <input 
                    type="text" 
                    placeholder="ค้นหาผู้ใช้ (ชื่อ, @username)..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-black border border-twitter-border rounded-full pl-10 pr-4 py-2 text-white focus:border-twitter-accent outline-none"
                 />
             </div>
             <div className="text-twitter-gray text-sm">
                 ทั้งหมด {filteredUsers.length} บัญชี
             </div>
        </div>

        <div className="bg-twitter-card border border-twitter-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-twitter-border/50 text-twitter-gray text-sm">
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-twitter-border/20">
                        {filteredUsers.map(user => (
                            <tr key={user.handle} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} className={`w-10 h-10 object-cover ${user.profileShape === 'square' ? 'rounded-md' : 'rounded-full'}`} />
                                        <div>
                                            <div className="font-bold text-white text-sm flex items-center gap-1">
                                                {user.name}
                                                <VerifiedBadge user={user} className="w-3 h-3" />
                                            </div>
                                            <div className="text-twitter-gray text-xs">@{user.handle}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        {user.isAdmin && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold w-fit"><Shield className="w-3 h-3" /> Admin</span>}
                                        {user.isPremium && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-twitter-accent/20 text-twitter-accent font-bold w-fit"><Crown className="w-3 h-3" /> Premium</span>}
                                        {!user.isAdmin && !user.isPremium && <span className="text-twitter-gray text-sm">User</span>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleVerifyToggle(user.handle)}
                                            className={`p-1.5 rounded-lg transition-colors ${user.isVerified ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-800 text-gray-500 hover:text-blue-500'}`}
                                            title="Toggle Verification"
                                        >
                                            <BadgeCheck className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleProfileShapeToggle(user.handle)}
                                            className={`p-1.5 rounded-lg transition-colors ${user.profileShape === 'square' ? 'bg-purple-500/20 text-purple-500' : 'bg-gray-800 text-gray-500 hover:text-purple-500'}`}
                                            title="Toggle Profile Shape"
                                        >
                                            <Square className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setSelectedUserForBadges(user)} className="p-2 hover:bg-white/10 rounded-full text-yellow-500" title="Manage Badges"><Star className="w-4 h-4" /></button>
                                        <button onClick={() => handleOpenPremiumModal(user.handle)} className="p-2 hover:bg-white/10 rounded-full text-twitter-accent" title="Manage Premium"><Crown className="w-4 h-4" /></button>
                                        <button onClick={() => handleEditUserClick(user)} className="p-2 hover:bg-white/10 rounded-full text-white" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                        {!user.isAdmin && (
                                            <button onClick={() => handleDeleteUser(user.handle)} className="p-2 hover:bg-red-500/20 rounded-full text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-twitter-gray">ไม่พบผู้ใช้งาน</div>
            )}
        </div>
    </div>
  );

  const renderContent = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-twitter-card border border-twitter-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-twitter-border/50 flex justify-between items-center">
                  <h3 className="font-bold text-white">จัดการเนื้อหาล่าสุด</h3>
                  <div className="text-xs text-twitter-gray">แสดง {tweets.length} โพสต์ล่าสุด</div>
              </div>
              <div className="divide-y divide-twitter-border/20">
                  {tweets.map(tweet => (
                      <div key={tweet.id} className="p-4 hover:bg-white/5 transition-colors flex gap-4">
                          <img src={tweet.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-sm">{tweet.authorName}</span>
                                      <span className="text-twitter-gray text-xs">@{tweet.authorHandle}</span>
                                  </div>
                                  <span className="text-twitter-gray text-xs">{tweet.timestamp}</span>
                              </div>
                              <p className="text-white text-sm mb-2 line-clamp-2">{tweet.content}</p>
                              <div className="flex items-center gap-4 text-xs text-twitter-gray">
                                  <span>Likes: {tweet.likes}</span>
                                  <span>Retweets: {tweet.retweets}</span>
                                  <span>Views: {tweet.views}</span>
                                  {tweet.isPromoted && <span className="text-yellow-500 font-bold flex items-center gap-1"><Megaphone className="w-3 h-3" /> Promoted</span>}
                              </div>
                          </div>
                          <div className="flex flex-col gap-2 justify-center">
                              <button 
                                onClick={() => onPromoteTweet(tweet.id)}
                                className={`p-2 rounded-full transition-colors ${tweet.isPromoted ? 'bg-yellow-500 text-black' : 'hover:bg-yellow-500/20 text-yellow-500'}`}
                                title="Promote Tweet"
                              >
                                  <Megaphone className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteContent(tweet.id)}
                                className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
                                title="Delete Tweet"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderVerification = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">Global Badges</h3>
              <p className="text-twitter-gray text-sm mb-6">
                  อัปโหลดตราสัญลักษณ์พิเศษ (สูงสุด 5 รายการ) เพื่อมอบให้กับผู้ใช้ที่ได้รับการยืนยัน
              </p>

              <div className="flex flex-wrap gap-4">
                  {globalBadges.map((badge, index) => (
                      <div key={index} className="relative group">
                          <div 
                              onClick={() => badgeInputRefs.current[index]?.click()}
                              className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${badge ? 'border-twitter-accent bg-twitter-accent/10' : 'border-twitter-gray hover:border-white hover:bg-white/5'}`}
                          >
                              {badge ? (
                                  <img src={badge} className="w-8 h-8 object-contain" />
                              ) : (
                                  <Upload className="w-6 h-6 text-twitter-gray" />
                              )}
                          </div>
                          
                          {badge && (
                              <button 
                                  onClick={() => handleRemoveBadgeFromPool(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <X className="w-3 h-3" />
                              </button>
                          )}
                          
                          <input 
                              type="file" 
                              ref={(el) => { badgeInputRefs.current[index] = el; }}
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleBadgeUpload(index, e)}
                          />
                          <div className="text-center text-xs text-twitter-gray mt-2">Slot {index + 1}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderCommunities = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center bg-twitter-card border border-twitter-border p-4 rounded-xl">
               <div>
                   <h3 className="font-bold text-white">ชุมชนทั้งหมด</h3>
                   <p className="text-xs text-twitter-gray">{allCommunities.length} Active Communities</p>
               </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allCommunities.map(comm => (
                  <div key={comm.id} className="bg-twitter-card border border-twitter-border p-4 rounded-xl flex gap-4 group hover:border-twitter-accent transition-colors">
                      <img src={comm.avatarUrl} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white truncate">{comm.name}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleOpenEditCommunity(comm)} className="p-1.5 hover:bg-white/10 rounded text-white"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={() => handleToggleBanCommunity(comm)} className={`p-1.5 hover:bg-white/10 rounded ${comm.isBanned ? 'text-red-500' : 'text-orange-500'}`}><Ban className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteCommunity(comm.id)} className="p-1.5 hover:bg-white/10 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                          </div>
                          <p className="text-twitter-gray text-xs mb-2 truncate">{comm.description}</p>
                          <div className="flex items-center gap-2">
                              <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">{comm.memberCount} Members</span>
                              {comm.isBanned && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold">BANNED</span>}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderPremium = () => (
      <div className="space-y-8 animate-in fade-in">
          {/* Badge Configuration */}
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-6">Badge Configuration</h3>
              <div className="flex gap-8">
                  <div>
                      <label className="block text-sm text-twitter-gray mb-2">Premium Badge (Individual)</label>
                      <div className="relative group w-20 h-20">
                          <div 
                              onClick={() => premiumBadgeInputRef.current?.click()}
                              className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${premiumBadgeUrl ? 'border-twitter-accent bg-twitter-accent/10' : 'border-twitter-gray hover:border-white'}`}
                          >
                              {premiumBadgeUrl ? <img src={premiumBadgeUrl} className="w-10 h-10 object-contain" /> : <Upload className="w-8 h-8 text-twitter-gray" />}
                          </div>
                          {premiumBadgeUrl && (
                              <button onClick={handleRemovePremiumBadge} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          )}
                          <input type="file" ref={premiumBadgeInputRef} className="hidden" accept="image/*" onChange={handlePremiumBadgeUpload} />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm text-twitter-gray mb-2">Business Badge (Organization)</label>
                      <div className="relative group w-20 h-20">
                          <div 
                              onClick={() => businessBadgeInputRef.current?.click()}
                              className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${businessBadgeUrl ? 'border-twitter-accent bg-twitter-accent/10' : 'border-twitter-gray hover:border-white'}`}
                          >
                              {businessBadgeUrl ? <img src={businessBadgeUrl} className="w-10 h-10 object-contain" /> : <Upload className="w-8 h-8 text-twitter-gray" />}
                          </div>
                          {businessBadgeUrl && (
                              <button onClick={handleRemoveBusinessBadge} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          )}
                          <input type="file" ref={businessBadgeInputRef} className="hidden" accept="image/*" onChange={handleBusinessBadgeUpload} />
                      </div>
                  </div>
              </div>
          </div>

          {/* Plan Configuration */}
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {premiumPlans.map(plan => (
                      <div key={plan.id} className="border border-twitter-border rounded-xl p-4 relative group">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-white">{plan.name}</h4>
                              <button onClick={() => setEditingPlan(plan)} className="text-twitter-accent hover:text-white"><Edit3 className="w-4 h-4" /></button>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">{plan.currency}{plan.price} <span className="text-sm text-twitter-gray font-normal">/{plan.interval}</span></div>
                          <p className="text-xs text-twitter-gray mb-3">{plan.description}</p>
                          <div className="flex flex-wrap gap-1">
                              {plan.features.map((f, i) => (
                                  <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">{f}</span>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Privileges Configuration */}
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Privileges</h3>
                  <Button size="sm" onClick={openAddPrivilegeModal}><Plus className="w-4 h-4 mr-1" /> Add Privilege</Button>
              </div>
              <div className="space-y-2">
                  {premiumPrivileges.map(priv => (
                      <div key={priv.id} className="flex items-center justify-between p-3 border border-twitter-border rounded-lg bg-black/20">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-twitter-accent/20 rounded text-twitter-accent">
                                  {/* Just render a generic icon or try to map */}
                                  <Check className="w-4 h-4" />
                              </div>
                              <div>
                                  <div className="font-bold text-white text-sm">{priv.title}</div>
                                  <div className="text-xs text-twitter-gray">{priv.description}</div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                  {priv.plans.map(p => <span key={p} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 uppercase">{p.slice(0,3)}</span>)}
                              </div>
                              <button onClick={() => { setEditingPrivilege(priv); setIsAddingPrivilege(false); }} className="p-1.5 hover:bg-white/10 rounded text-white"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeletePrivilege(priv.id)} className="p-1.5 hover:bg-white/10 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderEmailSettings = () => (
      <div className="space-y-6 animate-in fade-in max-w-4xl">
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-twitter-accent" />
                  ตั้งค่าเทมเพลตอีเมล (Email Templates)
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Verification Email */}
                  <div className="space-y-4">
                      <h4 className="text-white font-bold border-b border-twitter-border pb-2">อีเมลยืนยันตัวตน (Verification)</h4>
                      
                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">หัวข้ออีเมล (Subject)</label>
                          <input 
                              type="text" 
                              value={emailConfig.verification.subject}
                              onChange={(e) => setEmailConfig({...emailConfig, verification: {...emailConfig.verification, subject: e.target.value}})}
                              className="w-full bg-black border border-twitter-border rounded-lg px-3 py-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>

                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">เนื้อหาอีเมล (Body)</label>
                          <textarea 
                              value={emailConfig.verification.body}
                              onChange={(e) => setEmailConfig({...emailConfig, verification: {...emailConfig.verification, body: e.target.value}})}
                              className="w-full bg-black border border-twitter-border rounded-lg px-3 py-2 text-white outline-none focus:border-twitter-accent h-40 resize-none font-mono text-sm"
                          />
                          <p className="text-xs text-twitter-gray mt-2">
                              ตัวแปรที่ใช้ได้: <span className="text-twitter-accent">{`{name}`}</span>, <span className="text-twitter-accent">{`{siteName}`}</span>, <span className="text-twitter-accent">{`{code}`}</span>, <span className="text-twitter-accent">{`{handle}`}</span>
                          </p>
                      </div>
                  </div>

                  {/* Welcome Email */}
                  <div className="space-y-4">
                      <h4 className="text-white font-bold border-b border-twitter-border pb-2">อีเมลต้อนรับ (Welcome)</h4>
                      
                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">หัวข้ออีเมล (Subject)</label>
                          <input 
                              type="text" 
                              value={emailConfig.welcome.subject}
                              onChange={(e) => setEmailConfig({...emailConfig, welcome: {...emailConfig.welcome, subject: e.target.value}})}
                              className="w-full bg-black border border-twitter-border rounded-lg px-3 py-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>

                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">เนื้อหาอีเมล (Body)</label>
                          <textarea 
                              value={emailConfig.welcome.body}
                              onChange={(e) => setEmailConfig({...emailConfig, welcome: {...emailConfig.welcome, body: e.target.value}})}
                              className="w-full bg-black border border-twitter-border rounded-lg px-3 py-2 text-white outline-none focus:border-twitter-accent h-40 resize-none font-mono text-sm"
                          />
                          <p className="text-xs text-twitter-gray mt-2">
                              ตัวแปรที่ใช้ได้: <span className="text-twitter-accent">{`{name}`}</span>, <span className="text-twitter-accent">{`{siteName}`}</span>, <span className="text-twitter-accent">{`{handle}`}</span>
                          </p>
                      </div>
                  </div>
              </div>

              <div className="pt-6 mt-6 border-t border-twitter-border flex justify-end">
                  <Button onClick={handleSaveEmailConfig}>บันทึกการตั้งค่าอีเมล</Button>
              </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="bg-twitter-card border border-twitter-border p-6 rounded-xl max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm text-twitter-gray mb-2">Site Name</label>
                      <input 
                          type="text" 
                          value={configName}
                          onChange={(e) => setConfigName(e.target.value)}
                          className="w-full bg-black border border-twitter-border rounded-lg px-4 py-2 text-white outline-none focus:border-twitter-accent"
                      />
                  </div>

                  <div>
                      <label className="block text-sm text-twitter-gray mb-2">Site Logo</label>
                      <div className="flex items-center gap-4">
                          <div 
                              onClick={() => logoInputRef.current?.click()}
                              className="w-20 h-20 bg-black border border-twitter-border rounded-xl flex items-center justify-center cursor-pointer hover:border-twitter-accent transition-colors"
                          >
                              {configLogo ? (
                                  <img src={configLogo} className="w-12 h-12 object-contain" />
                              ) : (
                                  <Upload className="w-6 h-6 text-twitter-gray" />
                              )}
                          </div>
                          <div className="text-sm text-twitter-gray">
                              <p>Recommended: 512x512px PNG</p>
                              <p>Click to upload new logo</p>
                          </div>
                          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                  </div>

                  <div className="pt-4 border-t border-twitter-border">
                      <Button onClick={handleSaveSiteConfig}>Save Changes</Button>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-twitter-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-twitter-border flex justify-between items-center">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Shield className="w-6 h-6 text-twitter-accent" />
             Admin Panel
           </h2>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
            <button 
                onClick={() => handleTabChange('overview')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                <span>ภาพรวม</span>
            </button>
            <button 
                onClick={() => handleTabChange('users')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <Users className="w-5 h-5" />
                <span>ผู้ใช้งาน</span>
            </button>
            <button 
                onClick={() => handleTabChange('premium')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'premium' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <Crown className="w-5 h-5" />
                <span>Premium & Plans</span>
            </button>
            <button 
                onClick={() => handleTabChange('content')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'content' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <FileText className="w-5 h-5" />
                <span>เนื้อหา (Tweets)</span>
            </button>
            <button 
                onClick={() => handleTabChange('verification')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'verification' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <BadgeCheck className="w-5 h-5" />
                <span>ตราสัญลักษณ์</span>
            </button>
            <button 
                onClick={() => handleTabChange('communities')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'communities' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <Users className="w-5 h-5" />
                <span>ชุมชน</span>
            </button>
            <button 
                onClick={() => handleTabChange('email')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'email' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <Mail className="w-5 h-5" />
                <span>ตั้งค่าอีเมล</span>
            </button>
            <button 
                onClick={() => handleTabChange('settings')}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'border-r-2 border-twitter-accent bg-white/5 text-white' : 'text-twitter-gray hover:bg-white/5 hover:text-white'}`}
            >
                <Settings className="w-5 h-5" />
                <span>ตั้งค่าเว็บไซต์</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="p-6 border-b border-twitter-border bg-black/50 backdrop-blur-sm sticky top-0 z-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white"><Menu className="w-6 h-6" /></button>
                <h1 className="text-xl md:text-2xl font-bold capitalize truncate">
                    {activeTab === 'overview' && 'ภาพรวมระบบ'}
                    {activeTab === 'users' && 'จัดการผู้ใช้งาน'}
                    {activeTab === 'premium' && 'Premium & Plans'}
                    {activeTab === 'content' && 'จัดการเนื้อหา'}
                    {activeTab === 'verification' && 'คลังตราสัญลักษณ์'}
                    {activeTab === 'communities' && 'จัดการชุมชน'}
                    {activeTab === 'email' && 'ตั้งค่าเทมเพลตอีเมล'}
                    {activeTab === 'settings' && 'ตั้งค่าเว็บไซต์'}
                </h1>
            </div>
            {activeTab !== 'settings' && activeTab !== 'email' && <Button size="sm" variant="secondary" onClick={onRefreshFeed}>รีเฟรชข้อมูล</Button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'content' && renderContent()}
            {activeTab === 'verification' && renderVerification()}
            {activeTab === 'communities' && renderCommunities()}
            {activeTab === 'premium' && renderPremium()}
            {activeTab === 'email' && renderEmailSettings()}
            {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Edit Community Modal */}
      {editingCommunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">แก้ไขชุมชน</h3>
                      <button onClick={() => setEditingCommunity(null)} className="text-twitter-gray hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-twitter-border mb-4">
                      <button 
                        onClick={() => setCommunityTab('general')}
                        className={`flex-1 py-2 text-sm font-bold ${communityTab === 'general' ? 'text-twitter-accent border-b-2 border-twitter-accent' : 'text-twitter-gray hover:text-white'}`}
                      >
                          ทั่วไป
                      </button>
                      <button 
                        onClick={() => setCommunityTab('members')}
                        className={`flex-1 py-2 text-sm font-bold ${communityTab === 'members' ? 'text-twitter-accent border-b-2 border-twitter-accent' : 'text-twitter-gray hover:text-white'}`}
                      >
                          สมาชิก ({editingCommunity.memberCount})
                      </button>
                  </div>
                  
                  {communityTab === 'general' && (
                      <div className="space-y-4">
                          <div className="flex justify-center mb-4">
                              <div className="relative group cursor-pointer" onClick={() => communityAvatarInputRef.current?.click()}>
                                  <img src={editingCommunity.avatarUrl} className="w-24 h-24 rounded-2xl object-cover border-2 border-twitter-border" />
                                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-2xl">
                                      <Camera className="w-8 h-8 text-white" />
                                  </div>
                                  <input 
                                      type="file" 
                                      ref={communityAvatarInputRef}
                                      accept="image/*"
                                      onChange={handleCommunityAvatarUpload}
                                      className="hidden"
                                  />
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs text-twitter-gray mb-1">ชื่อชุมชน</label>
                              <input 
                                  value={editingCommunity.name}
                                  onChange={(e) => setEditingCommunity({...editingCommunity, name: e.target.value})}
                                  className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent"
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-twitter-gray mb-1">คำอธิบาย</label>
                              <textarea 
                                  value={editingCommunity.description}
                                  onChange={(e) => setEditingCommunity({...editingCommunity, description: e.target.value})}
                                  className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent resize-none h-20"
                              />
                          </div>
                          <div className="flex justify-end pt-4">
                              <Button onClick={handleSaveCommunity}>บันทึก</Button>
                          </div>
                      </div>
                  )}

                  {communityTab === 'members' && (
                      <div className="space-y-4">
                          <div className="bg-twitter-card rounded-lg p-3 max-h-60 overflow-y-auto">
                              <h4 className="text-white font-bold text-sm mb-2 sticky top-0 bg-twitter-card pb-2 border-b border-twitter-border/50">สมาชิกปัจจุบัน</h4>
                              {communityMembers.length > 0 ? (
                                  communityMembers.map(member => (
                                      <div key={member.handle} className="flex items-center justify-between py-2 border-b border-twitter-border/20 last:border-0">
                                          <div className="flex items-center gap-2">
                                              <img src={member.avatarUrl} className="w-8 h-8 rounded-full" />
                                              <div>
                                                  <div className="text-sm text-white font-bold">{member.name}</div>
                                                  <div className="text-xs text-twitter-gray">@{member.handle}</div>
                                              </div>
                                          </div>
                                          <button 
                                            onClick={() => handleBanUserFromCommunity(member.handle)}
                                            className="text-xs text-red-500 hover:bg-red-500/10 px-2 py-1 rounded font-bold"
                                          >
                                              แบน
                                          </button>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center text-twitter-gray py-4 text-sm">ไม่มีสมาชิกในขณะนี้</div>
                              )}
                          </div>

                          <div className="bg-twitter-card rounded-lg p-3 max-h-40 overflow-y-auto">
                              <h4 className="text-white font-bold text-sm mb-2 sticky top-0 bg-twitter-card pb-2 border-b border-twitter-border/50">ผู้ใช้ที่ถูกแบน</h4>
                              {editingCommunity.bannedUsers && editingCommunity.bannedUsers.length > 0 ? (
                                  editingCommunity.bannedUsers.map(handle => (
                                      <div key={handle} className="flex items-center justify-between py-2 border-b border-twitter-border/20 last:border-0">
                                          <div className="text-sm text-white">@{handle}</div>
                                          <button 
                                            onClick={() => handleUnbanUserFromCommunity(handle)}
                                            className="text-xs text-green-500 hover:bg-green-500/10 px-2 py-1 rounded font-bold"
                                          >
                                              ปลดแบน
                                          </button>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center text-twitter-gray py-4 text-sm">ไม่มีผู้ใช้ที่ถูกแบน</div>
                              )}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Select Badges Modal */}
      {selectedUserForBadges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-sm w-full">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">จัดการตราสัญลักษณ์</h3>
                      <button onClick={() => setSelectedUserForBadges(null)} className="text-twitter-gray hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <p className="text-sm text-twitter-gray mb-4">เลือกตราสัญลักษณ์ที่ต้องการแสดงบนโปรไฟล์ของ @{selectedUserForBadges.handle}</p>
                  
                  <div className="grid grid-cols-5 gap-2 mb-4">
                       {globalBadges.map((badge, i) => (
                           badge ? (
                               <div 
                                   key={i} 
                                   onClick={() => toggleUserBadge(badge)}
                                   className={`w-12 h-12 rounded-lg border flex items-center justify-center cursor-pointer ${selectedUserForBadges.verifiedBadges?.includes(badge) ? 'border-twitter-accent bg-twitter-accent/20' : 'border-twitter-gray hover:border-white'}`}
                               >
                                   <img src={badge} className="w-8 h-8 object-contain" />
                               </div>
                           ) : (
                               <div key={i} className="w-12 h-12 rounded-lg border border-twitter-border/30 bg-white/5 flex items-center justify-center opacity-50">
                                   <span className="text-xs text-twitter-gray">{i+1}</span>
                               </div>
                           )
                       ))}
                  </div>
                  <div className="text-xs text-twitter-gray">
                      อัปโหลดตราสัญลักษณ์เพิ่มเติมในแท็บ "คลังตราสัญลักษณ์"
                  </div>
              </div>
          </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">แก้ไขข้อมูลผู้ใช้</h3>
                      <button onClick={() => setEditingUser(null)} className="text-twitter-gray hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">ชื่อที่แสดง</label>
                          <input 
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">ชื่อผู้ใช้ (Handle)</label>
                          <input 
                              value={editingUser.handle}
                              onChange={(e) => setEditingUser({...editingUser, handle: e.target.value})}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-twitter-gray mb-1">อีเมล</label>
                          <input 
                              value={editingUser.email || ''}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>
                      <div className="pt-4 border-t border-twitter-border">
                          <label className="block text-xs text-twitter-gray mb-1">เปลี่ยนรหัสผ่าน (เว้นว่างหากไม่เปลี่ยน)</label>
                          <input 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="ตั้งรหัสผ่านใหม่"
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none focus:border-twitter-accent"
                          />
                      </div>
                      <div className="flex justify-end pt-2">
                          <Button onClick={handleSaveUser}>บันทึกการเปลี่ยนแปลง</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Manage Premium Modal */}
      {managePremiumUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">จัดการสถานะ Premium</h3>
                      <button onClick={() => setManagePremiumUser(null)} className="text-twitter-gray hover:text-white"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="flex items-center gap-3 mb-6 bg-twitter-card p-3 rounded-lg">
                      <img src={managePremiumUser.avatarUrl} className="w-12 h-12 rounded-full" />
                      <div>
                          <div className="font-bold text-white">{managePremiumUser.name}</div>
                          <div className="text-sm text-twitter-gray">@{managePremiumUser.handle}</div>
                      </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-xs text-twitter-gray mb-2">ประเภทบัญชี</label>
                          <div className="flex bg-twitter-card rounded-lg p-1">
                              <button 
                                  onClick={() => setPremiumType('individual')}
                                  className={`flex-1 py-2 rounded text-sm font-bold ${premiumType === 'individual' ? 'bg-twitter-accent text-white' : 'text-twitter-gray hover:text-white'}`}
                              >
                                  Individual
                              </button>
                              <button 
                                  onClick={() => setPremiumType('business')}
                                  className={`flex-1 py-2 rounded text-sm font-bold ${premiumType === 'business' ? 'bg-twitter-accent text-white' : 'text-twitter-gray hover:text-white'}`}
                              >
                                  Business
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs text-twitter-gray mb-2">ระยะเวลา</label>
                          <select 
                              value={premiumDuration} 
                              onChange={(e) => setPremiumDuration(e.target.value === 'lifetime' ? 'lifetime' : Number(e.target.value))}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white outline-none"
                          >
                              <option value={30}>30 วัน</option>
                              <option value={90}>3 เดือน</option>
                              <option value={365}>1 ปี</option>
                              <option value="lifetime">ตลอดชีพ (Lifetime)</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-xs text-twitter-gray mb-2">สิทธิพิเศษ (เลือกได้มากกว่า 1)</label>
                          <div className="max-h-40 overflow-y-auto space-y-2 border border-twitter-border rounded p-2 bg-twitter-card">
                              {premiumPrivileges
                                  .filter(p => p.plans?.includes(premiumType))
                                  .map(priv => (
                                      <label key={priv.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                                          <input 
                                              type="checkbox" 
                                              checked={userPrivileges.includes(priv.id)}
                                              onChange={(e) => {
                                                  if (e.target.checked) {
                                                      setUserPrivileges([...userPrivileges, priv.id]);
                                                  } else {
                                                      setUserPrivileges(userPrivileges.filter(id => id !== priv.id));
                                                  }
                                              }}
                                              className="accent-twitter-accent"
                                          />
                                          <span className="text-sm text-white">{priv.title}</span>
                                      </label>
                                  ))}
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      {managePremiumUser.isPremium && (
                          <Button variant="outline" className="flex-1 text-red-500 border-red-500/50 hover:bg-red-500/10" onClick={confirmRevokePremium}>
                              ยกเลิก Premium
                          </Button>
                      )}
                      <Button fullWidth onClick={confirmGrantPremium}>
                          {managePremiumUser.isPremium ? 'อัปเดตสถานะ' : 'มอบสถานะ Premium'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Edit Privilege Modal */}
      {isAddingPrivilege && editingPrivilege && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white mb-4">Add/Edit Privilege</h3>
                  <div className="space-y-4">
                      <input 
                          placeholder="Title" 
                          value={editingPrivilege.title}
                          onChange={e => setEditingPrivilege({...editingPrivilege, title: e.target.value})}
                          className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white"
                      />
                      <input 
                          placeholder="Description" 
                          value={editingPrivilege.description}
                          onChange={e => setEditingPrivilege({...editingPrivilege, description: e.target.value})}
                          className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white"
                      />
                      <div className="flex gap-4 text-sm text-white">
                          <label className="flex items-center gap-2">
                              <input 
                                  type="checkbox" 
                                  checked={editingPrivilege.plans.includes('individual')}
                                  onChange={e => {
                                      const plans = e.target.checked 
                                          ? [...editingPrivilege.plans, 'individual'] 
                                          : editingPrivilege.plans.filter(p => p !== 'individual');
                                      setEditingPrivilege({...editingPrivilege, plans: plans as any});
                                  }}
                              /> Individual
                          </label>
                          <label className="flex items-center gap-2">
                              <input 
                                  type="checkbox" 
                                  checked={editingPrivilege.plans.includes('business')}
                                  onChange={e => {
                                      const plans = e.target.checked 
                                          ? [...editingPrivilege.plans, 'business'] 
                                          : editingPrivilege.plans.filter(p => p !== 'business');
                                      setEditingPrivilege({...editingPrivilege, plans: plans as any});
                                  }}
                              /> Business
                          </label>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <Button variant="secondary" onClick={() => setIsAddingPrivilege(false)}>Cancel</Button>
                          <Button onClick={handleSavePrivilege}>Save</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white mb-4">Edit Plan: {editingPlan.name}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-twitter-gray">Price</label>
                          <input 
                              type="number"
                              value={editingPlan.price}
                              onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white"
                          />
                      </div>
                       <div>
                          <label className="text-xs text-twitter-gray">Currency Symbol</label>
                          <input 
                              type="text"
                              value={editingPlan.currency}
                              onChange={e => setEditingPlan({...editingPlan, currency: e.target.value})}
                              className="w-full bg-twitter-card border border-twitter-border rounded p-2 text-white"
                          />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <Button variant="secondary" onClick={() => setEditingPlan(null)}>Cancel</Button>
                          <Button onClick={handleSavePlan}>Save Changes</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};