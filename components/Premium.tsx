import React from 'react';
import { BadgeCheck, Check } from 'lucide-react';
import { Button } from './Button';

export const Premium: React.FC = () => {
  return (
    <div>
        <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3">
             <h2 className="text-xl font-bold text-white">Verified</h2>
        </div>

        <div className="p-6 pb-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6">
                <BadgeCheck className="w-10 h-10 fill-current" />
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-3 text-center">Who are you?</h1>
            <p className="text-twitter-gray text-center max-w-md mb-8">
                Choose the right verified subscription for you: Premium or Verified Organizations.
            </p>

            <div className="grid gap-4 w-full max-w-md">
                <div className="border border-twitter-accent/50 rounded-2xl p-4 bg-twitter-card/30 hover:bg-twitter-card/50 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-twitter-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        RECOMMENDED
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Premium</h3>
                    <p className="text-2xl font-bold text-white mb-4">$8<span className="text-sm font-normal text-twitter-gray">/month</span></p>
                    <ul className="space-y-3 mb-6">
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Blue checkmark</li>
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Prioritized rankings in conversations</li>
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Edit posts</li>
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Longer posts</li>
                    </ul>
                    <Button fullWidth className="font-bold">Subscribe</Button>
                </div>

                <div className="border border-twitter-border rounded-2xl p-4 hover:bg-twitter-card/30 transition-colors cursor-pointer">
                    <h3 className="text-lg font-bold text-white mb-1">Verified Organizations</h3>
                    <p className="text-2xl font-bold text-white mb-4">$1,000<span className="text-sm font-normal text-twitter-gray">/month</span></p>
                    <ul className="space-y-3 mb-6">
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Gold checkmark</li>
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Affiliation badges</li>
                        <li className="flex gap-2 text-sm text-white"><Check className="w-4 h-4 text-green-500" /> Premium support</li>
                    </ul>
                    <Button variant="secondary" fullWidth className="font-bold">Subscribe</Button>
                </div>
            </div>
        </div>
    </div>
  );
};