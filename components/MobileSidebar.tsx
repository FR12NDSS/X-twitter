import React, { useState } from 'react';
import { User, X, Users, Bookmark, FileText, Mic, BadgeDollarSign, Settings, HelpCircle, Sun, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { User as UserType, NavigationItem, SiteConfig } from '../types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onNavigate: (item: NavigationItem) => void;
  onLogout: () => void;
  siteConfig: SiteConfig | null;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, user, onNavigate, onLogout, siteConfig }) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  // Close sidebar when navigating
  const handleNav = (item: NavigationItem) => {
    onNavigate(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-black border-r border-twitter-border z-50 overflow-y-auto animate-in slide-in-from-left duration-300 shadow-2xl flex flex-col">
        
        {/* Header (User Info) */}
        <div className="p-4 pt-6">
           <div className="flex justify-between items-start mb-4">
             <img 
               src={user.avatarUrl} 
               alt={user.name} 
               className="w-10 h-10 rounded-full object-cover border border-twitter-border cursor-pointer"
               onClick={() => handleNav(NavigationItem.PROFILE)}
             />
             {/* Dynamic Logo in Mobile Sidebar */}
             {siteConfig?.logoUrl && (
                 <img src={siteConfig.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
             )}
           </div>
           
           <div className="mb-4">
              <div className="font-bold text-white text-lg leading-tight">{user.name}</div>
              <div className="text-twitter-gray text-[15px]">@{user.handle}</div>
           </div>

           <div className="flex gap-4 text-[14px]">
              <div className="cursor-pointer hover:underline">
                  <span className="font-bold text-white">{user.following || 0}</span> 
                  <span className="text-twitter-gray ml-1">กำลังติดตาม</span>
              </div>
              <div className="cursor-pointer hover:underline">
                  <span className="font-bold text-white">{user.followers || 0}</span> 
                  <span className="text-twitter-gray ml-1">ผู้ติดตาม</span>
              </div>
           </div>
        </div>

        <div className="h-px bg-twitter-border/50 mx-4 mb-2"></div>

        {/* Main Menu */}
        <div className="flex-1 py-2">
           <nav className="space-y-1">
               <button onClick={() => handleNav(NavigationItem.PROFILE)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <User className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">ข้อมูลส่วนตัว</span>
               </button>
               
               <button onClick={() => handleNav(NavigationItem.PREMIUM)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <div className="w-6 h-6 flex items-center justify-center">
                       {/* Mimic X Logo for Premium */}
                       <span className="text-xl font-bold text-white leading-none">X</span>
                   </div>
                   <span className="text-xl font-bold text-white">พรีเมียม</span>
               </button>

               <button onClick={() => handleNav(NavigationItem.COMMUNITIES)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <Users className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">ชุมชน</span>
               </button>

               <button onClick={() => handleNav(NavigationItem.BOOKMARKS)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <Bookmark className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">บุ๊กมาร์ก</span>
               </button>

               <button onClick={() => handleNav(NavigationItem.LISTS)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <FileText className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">รายชื่อ</span>
               </button>

               <button onClick={() => handleNav(NavigationItem.SPACES)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <Mic className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">Spaces</span>
               </button>

               <button onClick={() => handleNav(NavigationItem.MONETIZATION)} className="flex items-center gap-4 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left">
                   <BadgeDollarSign className="w-6 h-6 text-white" />
                   <span className="text-xl font-bold text-white">การสร้างรายได้</span>
               </button>
           </nav>
        </div>

        <div className="h-px bg-twitter-border/50 mx-4 my-2"></div>

        {/* Settings & Support Accordion */}
        <div className="mb-4">
            <button 
                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                className="flex items-center justify-between w-full px-6 py-3 hover:bg-white/5 transition-colors"
            >
                <span className="text-[15px] font-bold text-white">การตั้งค่าและการสนับสนุน</span>
                {isSettingsExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
            </button>

            {isSettingsExpanded && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                    <button onClick={() => handleNav(NavigationItem.SETTINGS)} className="flex items-center gap-3 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left pl-6">
                        <Settings className="w-5 h-5 text-white" />
                        <span className="text-[15px] text-white">การตั้งค่าและความเป็นส่วนตัว</span>
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left pl-6">
                        <HelpCircle className="w-5 h-5 text-white" />
                        <span className="text-[15px] text-white">ศูนย์ช่วยเหลือ</span>
                    </button>
                     <button onClick={onLogout} className="flex items-center gap-3 px-6 py-3 w-full hover:bg-white/5 transition-colors text-left pl-6 text-red-500">
                        <LogOut className="w-5 h-5" />
                        <span className="text-[15px] font-bold">ออกจากระบบ</span>
                    </button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 flex justify-between items-center">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Sun className="w-6 h-6 text-white" />
            </button>
        </div>

      </div>
    </>
  );
};