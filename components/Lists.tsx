import React from 'react';
import { FileText, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

export const Lists: React.FC = () => {
  return (
    <div>
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
         <div className="flex gap-4 items-center w-full">
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search className="h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Search Lists"
                    className="w-full bg-black border border-twitter-border rounded-full py-1.5 pl-10 pr-4 text-white text-sm focus:border-twitter-accent focus:outline-none"
                />
            </div>
            <FileText className="w-5 h-5 text-white cursor-pointer" />
            <MoreHorizontal className="w-5 h-5 text-white cursor-pointer" />
         </div>
      </div>

      <div className="p-4 pb-20">
        <h2 className="text-xl font-bold text-white mb-4">Pinned Lists</h2>
        <p className="text-twitter-gray text-[15px] mb-8 px-4 text-center">
            Nothing to see here yet — pin your favorite Lists to access them quickly.
        </p>

        <h2 className="text-xl font-bold text-white mb-4">Discover new Lists</h2>
        
        {/* Mock Lists */}
        {[
            { name: 'Tech News', owner: 'Verge', members: '142K' },
            { name: 'AI & ML', owner: 'OpenAI', members: '89K' },
            { name: 'Web Dev', owner: 'Vercel', members: '56K' },
        ].map((list, i) => (
             <div key={i} className="flex items-center gap-4 mb-6 hover:bg-white/5 p-3 -mx-3 rounded-xl transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-twitter-card rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="text-white w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white">{list.name}</h3>
                    <p className="text-xs text-twitter-gray">
                        {list.members} members · including @{list.owner}
                    </p>
                </div>
                <Button size="sm" variant="secondary">
                    <Plus className="w-4 h-4" />
                </Button>
             </div>
        ))}
      </div>
    </div>
  );
};