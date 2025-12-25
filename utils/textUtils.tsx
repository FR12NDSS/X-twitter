import React from 'react';

export const formatText = (text: string, onHashtagClick?: (tag: string) => void, onMentionClick?: (handle: string) => void) => {
  if (!text) return null;
  
  // Split by hashtags (#) or mentions (@) followed by word characters
  // Include Thai characters (\u0E00-\u0E7F) in the word character set
  const parts = text.split(/([#@][\w\u00C0-\u00FF\u0E00-\u0E7F]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span 
          key={index} 
          className="text-twitter-accent hover:underline cursor-pointer font-normal"
          onClick={(e) => {
            e.stopPropagation();
            if (onHashtagClick) {
                onHashtagClick(part);
            } else {
                console.log(`Clicked hashtag: ${part}`);
            }
          }}
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('@')) {
      return (
        <span 
            key={index} 
            className="text-twitter-accent hover:underline cursor-pointer font-normal"
            onClick={(e) => {
                e.stopPropagation();
                if (onMentionClick) {
                    onMentionClick(part);
                } else {
                    console.log(`Clicked mention: ${part}`);
                }
             }}
        >
            {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};