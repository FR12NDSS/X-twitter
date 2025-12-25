import React from 'react';
import { Users, Search, Plus } from 'lucide-react';

export const Communities: React.FC = () => {
  return (
    <div>
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
         <h2 className="text-xl font-bold text-white">Communities</h2>
         <div className="flex gap-4">
             <Search className="w-5 h-5 text-white cursor-pointer" />
             <Users className="w-5 h-5 text-white cursor-pointer" />
         </div>
      </div>

      <div className="p-4 pb-20">
         <div className="bg-twitter-card rounded-2xl p-6 text-center mb-6">
             <Users className="w-12 h-12 text-white mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">Discover Communities</h2>
             <p className="text-twitter-gray mb-6">
                 Communities are places to connect with people who share your interests.
             </p>
         </div>

         <h3 className="font-bold text-white text-lg mb-4">Suggested for you</h3>

         {[
             { name: 'TypeScript Wizards', members: '12K', desc: 'For all things TS.' },
             { name: 'Generative AI Art', members: '45K', desc: 'Share your prompts and creations.' },
             { name: 'Indie Hackers', members: '28K', desc: 'Building products in public.' },
         ].map((comm, i) => (
             <div key={i} className="flex gap-4 border-b border-twitter-border py-4 hover:bg-white/5 cursor-pointer -mx-4 px-4 transition-colors">
                 <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-shrink-0"></div>
                 <div className="flex-1">
                     <div className="flex justify-between items-start">
                         <h4 className="font-bold text-white">{comm.name}</h4>
                         <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-200">
                             Join
                         </button>
                     </div>
                     <p className="text-xs text-twitter-gray mb-1">{comm.members} members</p>
                     <p className="text-sm text-white">{comm.desc}</p>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
};