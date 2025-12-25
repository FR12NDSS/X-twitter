import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, X } from 'lucide-react';
import { Button } from './Button';
import { Community } from '../types';
import { userService } from '../services/userService';

export const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  
  // Fake current user handle retrieval for logic
  const currentUser = userService.getSession();

  useEffect(() => {
      loadCommunities();
  }, []);

  const loadCommunities = () => {
      const allComms = userService.getCommunities();
      // Enrich with isJoined status based on current session
      const user = userService.getSession();
      const enriched = allComms.map(c => ({
          ...c,
          isJoined: user?.joinedCommunities?.includes(c.id) || false
      }));
      setCommunities(enriched);
  };

  const handleCreate = () => {
      if (!newCommunityName.trim()) return;
      userService.createCommunity({
          name: newCommunityName,
          description: newCommunityDesc,
          avatarUrl: `https://picsum.photos/seed/${newCommunityName}/100/100`
      });
      setShowCreateModal(false);
      setNewCommunityName('');
      setNewCommunityDesc('');
      loadCommunities();
  };

  const handleJoinToggle = (commId: string) => {
      if (!currentUser) return;
      userService.joinCommunity(currentUser.handle, commId);
      loadCommunities();
  };

  return (
    <div>
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3 flex items-center justify-between">
         <h2 className="text-xl font-bold text-white">Communities</h2>
         <div className="flex gap-4">
             <Search className="w-5 h-5 text-white cursor-pointer" />
             <button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-5 h-5 text-white cursor-pointer" />
             </button>
         </div>
      </div>

      <div className="p-4 pb-20">
         <div className="bg-twitter-card rounded-2xl p-6 text-center mb-6">
             <Users className="w-12 h-12 text-white mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">Discover Communities</h2>
             <p className="text-twitter-gray mb-6">
                 Communities are places to connect with people who share your interests.
             </p>
             <Button onClick={() => setShowCreateModal(true)}>Create Community</Button>
         </div>

         <h3 className="font-bold text-white text-lg mb-4">Suggested for you</h3>

         {communities.map((comm) => (
             <div key={comm.id} className="flex gap-4 border-b border-twitter-border py-4 hover:bg-white/5 cursor-pointer -mx-4 px-4 transition-colors">
                 <img src={comm.avatarUrl} className="w-14 h-14 rounded-xl flex-shrink-0 object-cover" />
                 <div className="flex-1">
                     <div className="flex justify-between items-start">
                         <h4 className="font-bold text-white">{comm.name}</h4>
                         <button 
                            onClick={() => handleJoinToggle(comm.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${comm.isJoined ? 'border border-twitter-border text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                         >
                             {comm.isJoined ? 'Joined' : 'Join'}
                         </button>
                     </div>
                     <p className="text-xs text-twitter-gray mb-1">{comm.memberCount} members</p>
                     <p className="text-sm text-white">{comm.description}</p>
                 </div>
             </div>
         ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-black border border-twitter-border rounded-xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Create Community</h3>
                      <button onClick={() => setShowCreateModal(false)}><X className="text-twitter-gray w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-twitter-gray block mb-1">Name</label>
                          <input 
                            className="w-full bg-twitter-card rounded p-2 text-white outline-none border border-transparent focus:border-twitter-accent"
                            value={newCommunityName}
                            onChange={(e) => setNewCommunityName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="text-xs text-twitter-gray block mb-1">Description</label>
                          <textarea 
                            className="w-full bg-twitter-card rounded p-2 text-white outline-none border border-transparent focus:border-twitter-accent"
                            value={newCommunityDesc}
                            onChange={(e) => setNewCommunityDesc(e.target.value)}
                          />
                      </div>
                      <Button fullWidth onClick={handleCreate} disabled={!newCommunityName}>Create</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};