import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Bell, Mail, User, MoreHorizontal, Feather, Sparkles, FileText, Bookmark, Users, BadgeCheck, Settings, LogOut, Shield } from 'lucide-react';
import { NavigationItem, User as UserType } from '../types';
import { Button } from './Button';

interface SidebarProps {
  activeItem: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
  currentUser: UserType;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, currentUser, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: NavigationItem.HOME, icon: Home, displayLabel: 'หน้าหลัก' },
    { label: NavigationItem.EXPLORE, icon: Search, displayLabel: 'ค้นหา' },
    { label: NavigationItem.NOTIFICATIONS, icon: Bell, displayLabel: 'การแจ้งเตือน' },
    { label: NavigationItem.MESSAGES, icon: Mail, displayLabel: 'ข้อความ' },
    { label: NavigationItem.GEMINI, icon: Sparkles, displayLabel: 'Gemini' }, // AI Feature
    { label: NavigationItem.LISTS, icon: FileText, displayLabel: 'รายชื่อ' },
    { label: NavigationItem.BOOKMARKS, icon: Bookmark, displayLabel: 'บุ๊กมาร์ก' },
    { label: NavigationItem.COMMUNITIES, icon: Users, displayLabel: 'ชุมชน' },
    { label: NavigationItem.PREMIUM, icon: BadgeCheck, displayLabel: 'ยืนยันตัวตน' },
    { label: NavigationItem.PROFILE, icon: User, displayLabel: 'ข้อมูลส่วนตัว' },
    { label: NavigationItem.SETTINGS, icon: Settings, displayLabel: 'การตั้งค่า' },
  ];

  // Add Admin item if user is admin
  if (currentUser.isAdmin) {
      navItems.push({ label: NavigationItem.ADMIN, icon: Shield, displayLabel: 'แผงผู้ดูแล' });
  }

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogout();
  };

  return (
    <div className="hidden sm:flex flex-col h-screen fixed top-0 left-0 xl:w-[275px] w-[88px] border-r border-twitter-border px-2 py-4 z-50 bg-black overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="px-3 mb-2">
        <div 
          onClick={() => onNavigate(NavigationItem.HOME)}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-twitter-card transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 text-white fill-current">
            <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
          </svg>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 mb-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.label)}
            className={`group flex items-center xl:justify-start justify-center w-full p-3 rounded-full transition-all ${
              activeItem === item.label ? 'font-bold' : 'font-normal'
            } hover:bg-twitter-card`}
          >
            <item.icon 
              className={`w-7 h-7 ${activeItem === item.label ? 'text-white' : 'text-white'}`} 
              strokeWidth={activeItem === item.label ? 2.5 : 2}
            />
            <span className={`hidden xl:block ml-4 text-xl ${activeItem === item.label ? 'text-white' : 'text-white'}`}>
              {item.displayLabel || item.label}
            </span>
          </button>
        ))}
        
        <button className="group flex items-center xl:justify-start justify-center w-full p-3 rounded-full transition-all hover:bg-twitter-card">
           <div className="w-7 h-7 border-2 border-white rounded-full flex items-center justify-center">
             <MoreHorizontal className="w-4 h-4 text-white" />
           </div>
           <span className="hidden xl:block ml-4 text-xl text-white">เพิ่มเติม</span>
        </button>
      </nav>

      {/* Tweet Button */}
      <div className="mb-4">
        <Button size="lg" fullWidth className="hidden xl:block shadow-lg">
          โพสต์
        </Button>
        <div className="xl:hidden w-12 h-12 bg-twitter-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-twitter-hover transition-colors shadow-lg mx-auto">
          <Feather className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto relative" ref={profileMenuRef}>
        {showProfileMenu && (
             <div className="absolute bottom-[110%] left-0 xl:left-0 -left-2 xl:w-[260px] w-[200px] bg-black border border-twitter-border rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.2)] z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2">
                 <button 
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-2 text-white font-bold"
                 >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ @{currentUser.handle}
                 </button>
             </div>
        )}
        
        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center xl:justify-between justify-center p-3 rounded-full hover:bg-twitter-card cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="hidden xl:block text-sm">
              <p className="font-bold text-white">{currentUser.name}</p>
              <p className="text-twitter-gray">@{currentUser.handle}</p>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block text-white w-5 h-5" />
        </div>
      </div>
    </div>
  );
};