import React from 'react';
import { Feather } from 'lucide-react';

interface FloatingTweetButtonProps {
  onClick: () => void;
}

export const FloatingTweetButton: React.FC<FloatingTweetButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 bg-twitter-accent rounded-full flex items-center justify-center text-white shadow-lg hover:bg-twitter-hover transition-colors sm:hidden z-40 active:scale-90 transform duration-200"
      aria-label="Tweet"
    >
      <Feather className="w-6 h-6" />
    </button>
  );
};