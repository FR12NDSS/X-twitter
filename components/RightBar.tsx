import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, X, Hash } from 'lucide-react';
import { Button } from './Button';
import { MOCK_USERS } from '../utils/mockData';

const POPULAR_HASHTAGS = [
    { tag: '#GeminiAI', count: '125K' },
    { tag: '#React19', count: '45.2K' },
    { tag: '#TypeScript', count: '32K' },
    { tag: '#WebDev', count: '89K' },
    { tag: '#TechNews', count: '54K' },
];

interface RightBarProps {
  onTrendClick?: (topic: string) => void;
  onUserClick?: (handle: string) => void;
}

export const RightBar: React.FC<RightBarProps> = ({ onTrendClick, onUserClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof MOCK_USERS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const trends = [
    { category: 'Technology · Trending', topic: '#GeminiAI', posts: '54.2K' },
    { category: 'Trending in US', topic: 'React 19', posts: '12.1K' },
    { category: 'Business · Trending', topic: 'NVIDIA', posts: '89K' },
    { category: 'Entertainment', topic: 'Dune: Part Three', posts: '23.5K' },
    { category: 'Sports · Trending', topic: 'Formula 1', posts: '15.6K' },
  ];

  const whoToFollow = MOCK_USERS.slice(0, 3);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = MOCK_USERS.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.handle.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    // Keep focus
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) input.focus();
  };

  const handleResultClick = (handle: string) => {
    if (onUserClick) {
        onUserClick(handle);
    }
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleHashtagClick = (tag: string) => {
      if (onTrendClick) onTrendClick(tag);
      setSearchQuery('');
      setIsFocused(false);
  }

  return (
    <div className="hidden lg:block w-[350px] pl-8 py-4 h-screen fixed top-0 right-0 border-l border-twitter-border bg-black">
      {/* Search */}
      <div className="sticky top-0 bg-black pb-4 z-20" ref={searchContainerRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-twitter-accent">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="block w-full pl-10 pr-10 py-3 rounded-full bg-twitter-card border-none text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-twitter-accent focus:bg-black transition-colors"
            placeholder="Search"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-twitter-accent hover:text-white"
            >
              <div className="bg-twitter-accent rounded-full p-0.5 text-black hover:bg-twitter-hover">
                <X className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>

        {/* Search Results / Popular Hashtags Dropdown */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-twitter-border rounded-xl shadow-2xl max-h-96 overflow-y-auto z-30 py-2">
            {searchQuery ? (
               /* Search Results */
               searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div 
                    key={user.handle} 
                    onClick={() => handleResultClick(user.handle)}
                    className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img src={user.avatarUrl} alt={user.handle} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{user.name}</span>
                      <span className="text-twitter-gray text-sm">@{user.handle}</span>
                    </div>
                  </div>
                ))
              ) : (
                 <div className="px-4 py-8 text-center text-twitter-gray">
                   <p>Try searching for people, lists, or keywords</p>
                 </div>
              )
            ) : (
                /* Popular Hashtags View when search is empty */
                <div>
                     <h3 className="px-4 py-2 text-sm text-twitter-gray font-bold uppercase tracking-wider">Trending Hashtags</h3>
                     {POPULAR_HASHTAGS.map((item, index) => (
                         <div 
                           key={index} 
                           onClick={() => handleHashtagClick(item.tag)}
                           className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                         >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-twitter-card flex items-center justify-center">
                                    <Hash className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-white">{item.tag}</span>
                            </div>
                            <span className="text-xs text-twitter-gray">{item.count}</span>
                         </div>
                     ))}
                </div>
            )}
          </div>
        )}
      </div>

      {/* Trends Card */}
      <div className="bg-twitter-card rounded-2xl mb-4 overflow-hidden">
        <h2 className="text-xl font-bold text-white px-4 py-3">What's happening</h2>
        {trends.map((trend, index) => (
          <div 
            key={index} 
            onClick={() => onTrendClick?.(trend.topic)}
            className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors relative"
          >
             <div className="flex justify-between items-start">
               <span className="text-xs text-twitter-gray">{trend.category}</span>
               <MoreHorizontal className="w-4 h-4 text-twitter-gray hover:text-twitter-accent" />
             </div>
             <p className="font-bold text-white text-[15px]">{trend.topic}</p>
             <span className="text-xs text-twitter-gray">{trend.posts} posts</span>
          </div>
        ))}
        <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-twitter-accent text-sm">
          Show more
        </div>
      </div>

      {/* Who to Follow Card */}
      <div className="bg-twitter-card rounded-2xl overflow-hidden">
        <h2 className="text-xl font-bold text-white px-4 py-3">Who to follow</h2>
        {whoToFollow.map((user, index) => (
          <div 
            key={index} 
            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
            onClick={() => onUserClick && onUserClick(user.handle)}
          >
             <div className="flex items-center gap-3">
               <img src={user.avatarUrl} alt={user.handle} className="w-10 h-10 rounded-full object-cover" />
               <div className="flex flex-col">
                 <span className="font-bold text-white text-sm hover:underline">{user.name}</span>
                 <span className="text-twitter-gray text-sm">@{user.handle}</span>
               </div>
             </div>
             <Button variant="secondary" size="sm" className="h-8 px-4" onClick={(e) => e.stopPropagation()}>Follow</Button>
          </div>
        ))}
        <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-twitter-accent text-sm">
          Show more
        </div>
      </div>
      
      <div className="mt-4 px-4 text-xs text-twitter-gray flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <a href="#" className="hover:underline">Ads info</a>
        <span>© 2025 BuzzStream AI.</span>
      </div>

    </div>
  );
};