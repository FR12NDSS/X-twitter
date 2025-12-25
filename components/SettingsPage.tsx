import React, { useState } from 'react';
import { User, Lock, Bell, Monitor, ArrowLeft, ChevronRight, Save, VolumeX, Plus, X } from 'lucide-react';
import { User as UserType } from '../types';
import { Button } from './Button';

interface SettingsPageProps {
  currentUser: UserType;
  onUpdateUser: (user: UserType) => void;
}

type SettingsTab = 'account' | 'privacy' | 'notifications' | 'display';

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [formData, setFormData] = useState<UserType>(currentUser);
  const [isSaved, setIsSaved] = useState(false);

  // Mock states for other settings
  const [privateAccount, setPrivateAccount] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [theme, setTheme] = useState<'default' | 'dim' | 'lights-out'>('lights-out');

  // Mute Words State
  const [mutedWords, setMutedWords] = useState<string[]>(['spoilers', 'crypto']);
  const [newMuteWord, setNewMuteWord] = useState('');

  const handleSaveAccount = () => {
    onUpdateUser(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddMuteWord = () => {
    if (newMuteWord.trim() && !mutedWords.includes(newMuteWord.trim().toLowerCase())) {
        setMutedWords([...mutedWords, newMuteWord.trim().toLowerCase()]);
        setNewMuteWord('');
    }
  };

  const handleRemoveMuteWord = (wordToRemove: string) => {
    setMutedWords(mutedWords.filter(word => word !== wordToRemove));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
              <p className="text-twitter-gray text-sm mb-6">Update your account details and profile information.</p>
              
              <div className="space-y-4">
                 <div className="bg-black border border-twitter-border rounded-lg px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray mb-1">Name</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
                 
                 <div className="bg-black border border-twitter-border rounded-lg px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray mb-1">Username</label>
                    <div className="flex">
                        <span className="text-twitter-gray mr-0.5">@</span>
                        <input 
                            type="text" 
                            value={formData.handle} 
                            onChange={e => setFormData({...formData, handle: e.target.value})}
                            className="w-full bg-transparent text-white outline-none"
                        />
                    </div>
                 </div>

                 <div className="bg-black border border-twitter-border rounded-lg px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray mb-1">Bio</label>
                    <textarea 
                        value={formData.bio || ''} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-transparent text-white outline-none resize-none h-24"
                    />
                 </div>

                 <div className="bg-black border border-twitter-border rounded-lg px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray mb-1">Location</label>
                    <input 
                        type="text" 
                        value={formData.location || ''} 
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>

                 <div className="bg-black border border-twitter-border rounded-lg px-3 py-2 focus-within:border-twitter-accent focus-within:ring-1 focus-within:ring-twitter-accent transition-colors">
                    <label className="block text-xs text-twitter-gray mb-1">Website</label>
                    <input 
                        type="text" 
                        value={formData.website || ''} 
                        onChange={e => setFormData({...formData, website: e.target.value})}
                        className="w-full bg-transparent text-white outline-none"
                    />
                 </div>
              </div>

              <div className="mt-8 flex justify-end">
                  <Button onClick={handleSaveAccount} disabled={isSaved}>
                    {isSaved ? 'Saved!' : 'Save changes'}
                  </Button>
              </div>
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <h3 className="text-xl font-bold text-white mb-4">Privacy and safety</h3>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                       <h4 className="text-white font-medium">Protect your posts</h4>
                       <p className="text-sm text-twitter-gray mt-1 max-w-sm">
                           When selected, your posts and other account information are only visible to people who follow you.
                       </p>
                   </div>
                   <input 
                     type="checkbox" 
                     checked={privateAccount}
                     onChange={() => setPrivateAccount(!privateAccount)}
                     className="w-5 h-5 accent-twitter-accent"
                   />
                </div>

                <div className="border-t border-twitter-border pt-6 flex items-center justify-between">
                   <div>
                       <h4 className="text-white font-medium">Direct Messages</h4>
                       <p className="text-sm text-twitter-gray mt-1 max-w-sm">
                           Allow message requests from everyone.
                       </p>
                   </div>
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 accent-twitter-accent"
                   />
                </div>

                <div className="border-t border-twitter-border pt-6 flex items-center justify-between">
                   <div>
                       <h4 className="text-white font-medium">Discoverability</h4>
                       <p className="text-sm text-twitter-gray mt-1 max-w-sm">
                           Let people who have your email address find you on BuzzStream.
                       </p>
                   </div>
                   <input 
                     type="checkbox" 
                     defaultChecked
                     className="w-5 h-5 accent-twitter-accent"
                   />
                </div>
             </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <h3 className="text-xl font-bold text-white mb-4">Notifications</h3>
             
             <div className="bg-twitter-card rounded-xl overflow-hidden mb-8">
                <div className="p-4 border-b border-twitter-border/50 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-twitter-accent/20 flex items-center justify-center text-twitter-accent">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Push Notifications</h4>
                            <p className="text-xs text-twitter-gray">Push notifications to your device</p>
                        </div>
                    </div>
                    <input 
                     type="checkbox" 
                     checked={pushNotifs}
                     onChange={() => setPushNotifs(!pushNotifs)}
                     className="w-5 h-5 accent-twitter-accent"
                   />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                            <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Email Notifications</h4>
                            <p className="text-xs text-twitter-gray">Get emails about activity</p>
                        </div>
                    </div>
                    <input 
                     type="checkbox" 
                     checked={emailNotifs}
                     onChange={() => setEmailNotifs(!emailNotifs)}
                     className="w-5 h-5 accent-twitter-accent"
                   />
                </div>
             </div>

             {/* Mute Words Section */}
             <div className="border-t border-twitter-border pt-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <VolumeX className="w-5 h-5" />
                    Mute words
                </h3>
                <p className="text-sm text-twitter-gray mb-4">
                    When you mute words, you won't see them in your notifications or home timeline.
                </p>
                
                <div className="flex gap-2 mb-6">
                    <div className="relative group flex-1">
                        <input
                            type="text"
                            value={newMuteWord}
                            onChange={(e) => setNewMuteWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMuteWord()}
                            className="peer w-full bg-black border border-twitter-border rounded-lg px-3 py-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                            placeholder="Enter a word or phrase"
                        />
                    </div>
                    <Button onClick={handleAddMuteWord} disabled={!newMuteWord.trim()} className="h-[46px] w-[46px] p-0 flex items-center justify-center rounded-lg">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {mutedWords.length === 0 && (
                        <p className="text-twitter-gray text-sm italic">No words muted yet.</p>
                    )}
                    {mutedWords.map((word) => (
                        <div key={word} className="flex items-center justify-between p-3 bg-twitter-card/50 border border-twitter-border rounded-lg group hover:border-twitter-gray transition-colors">
                            <span className="text-white font-medium">{word}</span>
                            <button 
                                onClick={() => handleRemoveMuteWord(word)}
                                className="text-twitter-gray hover:text-red-500 transition-colors p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        );

      case 'display':
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
             <h3 className="text-xl font-bold text-white mb-4">Display</h3>
             <p className="text-twitter-gray text-sm mb-6">Manage your font size, color, and background. These settings affect all the BuzzStream accounts on this browser.</p>

             <div className="border border-twitter-border rounded-xl p-4 mb-6">
                 <div className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-twitter-gray/50 flex-shrink-0"></div>
                     <div>
                         <div className="flex items-center gap-1 mb-1">
                             <span className="font-bold text-white">BuzzStream</span>
                             <span className="text-twitter-gray">@buzzstream</span>
                         </div>
                         <p className="text-white">At the heart of BuzzStream are short messages called Tweets.</p>
                     </div>
                 </div>
             </div>

             <h4 className="text-white font-bold text-sm mb-3">Background</h4>
             <div className="grid grid-cols-3 gap-4">
                 <div 
                    onClick={() => setTheme('default')}
                    className={`border rounded-lg p-4 cursor-pointer text-center font-bold transition-all ${theme === 'default' ? 'bg-white text-black border-twitter-accent ring-2 ring-twitter-accent' : 'bg-white text-black border-transparent opacity-80'}`}
                 >
                     Default
                 </div>
                 <div 
                    onClick={() => setTheme('dim')}
                    className={`border rounded-lg p-4 cursor-pointer text-center font-bold transition-all ${theme === 'dim' ? 'bg-[#15202b] text-white border-twitter-accent ring-2 ring-twitter-accent' : 'bg-[#15202b] text-white border-twitter-border'}`}
                 >
                     Dim
                 </div>
                 <div 
                    onClick={() => setTheme('lights-out')}
                    className={`border rounded-lg p-4 cursor-pointer text-center font-bold transition-all ${theme === 'lights-out' ? 'bg-black text-white border-twitter-accent ring-2 ring-twitter-accent' : 'bg-black text-white border-twitter-border'}`}
                 >
                     Lights out
                 </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Settings Navigation Column */}
      <div className="w-1/3 border-r border-twitter-border hidden sm:block">
         <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-twitter-border px-4 py-3">
            <h2 className="text-xl font-bold text-white">Settings</h2>
         </div>
         <div className="py-2">
            {[
                { id: 'account', label: 'Your Account', icon: User },
                { id: 'privacy', label: 'Privacy and safety', icon: Lock },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'display', label: 'Display', icon: Monitor },
            ].map((item) => (
                <div 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                    className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${activeTab === item.id ? 'border-r-2 border-twitter-accent bg-white/5' : 'hover:bg-white/5'}`}
                >
                   <div className="flex items-center gap-3">
                       <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-twitter-gray'}`} />
                       <span className={`${activeTab === item.id ? 'text-white font-bold' : 'text-white font-normal'}`}>{item.label}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-twitter-gray" />
                </div>
            ))}
         </div>
      </div>

      {/* Settings Content Column */}
      <div className="flex-1 sm:max-w-[600px] bg-black">
         <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-twitter-border px-4 py-3 flex items-center sm:hidden">
            {/* Mobile Header */}
            <h2 className="text-xl font-bold text-white">Settings</h2>
         </div>
         
         {/* Mobile Navigation (Tabs) */}
         <div className="flex sm:hidden overflow-x-auto border-b border-twitter-border no-scrollbar">
            {['account', 'privacy', 'notifications', 'display'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as SettingsTab)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium capitalize ${activeTab === tab ? 'text-twitter-accent border-b-2 border-twitter-accent' : 'text-twitter-gray'}`}
                >
                    {tab}
                </button>
            ))}
         </div>

         <div className="p-4 pb-20 overflow-y-auto h-full">
            {renderTabContent()}
         </div>
      </div>
    </div>
  );
};