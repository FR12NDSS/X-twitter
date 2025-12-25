import React from 'react';

export const formatText = (text: string) => {
  if (!text) return null;
  
  // Split by hashtags (#) or mentions (@) followed by word characters
  // Capture the delimiter to include it in the parts array
  const parts = text.split(/([#@][\w\u00C0-\u00FF]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span 
          key={index} 
          className="text-twitter-accent hover:underline cursor-pointer font-normal"
          onClick={(e) => {
            e.stopPropagation();
            console.log(`Clicked hashtag: ${part}`);
            // In a real app, this would navigate to a hashtag search page
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
                console.log(`Clicked mention: ${part}`);
             }}
        >
            {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};