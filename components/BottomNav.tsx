import React from 'react';
import { Home, Search, Bell, Mail, User } from 'lucide-react';
import { NavigationItem } from '../types';

interface BottomNavProps {
  activeItem: NavigationItem;
  onNavigate: (item: NavigationItem) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeItem, onNavigate }) => {
  const navItems = [
    { label: NavigationItem.HOME, icon: Home },
    { label: NavigationItem.EXPLORE, icon: Search }, // Changed to Search
    { label: NavigationItem.NOTIFICATIONS, icon: Bell },
    { label: NavigationItem.MESSAGES, icon: Mail },
    { label: NavigationItem.PROFILE, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-twitter-border flex justify-around items-center h-[53px] sm:hidden z-50 pb-safe">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => onNavigate(item.label)}
          className="p-2 flex items-center justify-center flex-1 h-full hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <item.icon 
            className={`w-6 h-6 ${activeItem === item.label ? 'text-white' : 'text-twitter-gray'}`}
            strokeWidth={activeItem === item.label ? 2.5 : 2}
          />
        </button>
      ))}
    </div>
  );
};