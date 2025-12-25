import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './Button';

const SEARCH_USERS = [
  { name: 'Google DeepMind', handle: 'DeepMind', avatarUrl: 'https://picsum.photos/seed/deepmind/200/200', bio: 'Solving intelligence to advance science and benefit humanity.' },
  { name: 'Open Source', handle: 'OpenSource', avatarUrl: 'https://picsum.photos/seed/opensource/200/200', bio: 'The official home of open source.' },
  { name: 'TypeScript', handle: 'typescript', avatarUrl: 'https://picsum.photos/seed/ts/200/200', bio: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.' },
  { name: 'React Team', handle: 'reactjs', avatarUrl: 'https://picsum.photos/seed/react/200/200', bio: 'React: A library for building user interfaces' },
  { name: 'Tailwind CSS', handle: 'tailwindcss', avatarUrl: 'https://picsum.photos/seed/tailwind/200/200', bio: 'Rapidly build modern websites without ever leaving your HTML.' },
  { name: 'Gemini AI', handle: 'GoogleAI', avatarUrl: 'https://picsum.photos/seed/ai/200/200', bio: 'Building the most capable AI models.' },
  { name: 'Elon Musk', handle: 'elonmusk', avatarUrl: 'https://picsum.photos/seed/elon/200/200', bio: '' },
  { name: 'Sam Altman', handle: 'sama', avatarUrl: 'https://picsum.photos/seed/sama/200/200', bio: '' },
  { name: 'Vercel', handle: 'vercel', avatarUrl: 'https://picsum.photos/seed/vercel/200/200', bio: 'Develop. Preview. Ship.' },
];

interface UserSearchProps {
    onUserClick?: (handle: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserClick }) => {
  const [query, setQuery] = useState('');
  
  const filteredUsers = query 
    ? SEARCH_USERS.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) || 
        u.handle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div>
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 rounded-full bg-twitter-card border-none text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-twitter-accent transition-colors"
            placeholder="Search for users"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-twitter-accent hover:text-white"
            >
              <div className="bg-twitter-accent rounded-full p-0.5 text-black hover:bg-twitter-hover">
                <X className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="pb-20">
        {query ? (
          filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.handle} 
                className="px-4 py-4 border-b border-twitter-border hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3"
                onClick={() => onUserClick && onUserClick(user.handle)}
              >
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div>
                       <div className="font-bold text-white">{user.name}</div>
                       <div className="text-twitter-gray">@{user.handle}</div>
                     </div>
                     <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>Follow</Button>
                  </div>
                  {user.bio && <div className="text-white mt-1 text-sm line-clamp-2">{user.bio}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-twitter-gray">
              No results for "{query}"
            </div>
          )
        ) : (
          <div className="p-8 text-center text-twitter-gray">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold text-white mb-2">Find users</p>
            <p>Search for people you know or follow new accounts.</p>
          </div>
        )}
      </div>
    </div>
  );
};