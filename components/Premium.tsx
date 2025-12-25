import React, { useState } from 'react';
import { BadgeCheck, Check, Edit3, Type, ArrowUpCircle, FolderHeart, Smartphone, ShieldCheck, X, CreditCard, Loader2 } from 'lucide-react';
import { Button } from './Button';

export const Premium: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');

  const handleSubscribe = () => {
      setShowPaymentModal(true);
      setPaymentStep('form');
  };

  const processPayment = () => {
      setPaymentStep('processing');
      setTimeout(() => {
          setPaymentStep('success');
      }, 2000);
  };

  return (
    <div>
        <div className="sticky top-0 z-30 backdrop-blur-md bg-black/60 border-b border-twitter-border px-4 py-3">
             <h2 className="text-xl font-bold text-white">Premium</h2>
        </div>

        <div className="p-6 pb-20 flex flex-col items-center">
             <div className="w-full max-w-2xl flex flex-col items-center">
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <BadgeCheck className="w-10 h-10 fill-current" />
                </div>

                <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Upgrade to Premium</h1>
                <p className="text-twitter-gray text-center max-w-md mb-10 text-lg">
                    Enjoy an enhanced experience, exclusive creator tools, top-tier verification and more.
                </p>

                {/* Subscription Cards */}
                <div className="grid md:grid-cols-2 gap-6 w-full mb-16">
                    {/* Premium Card */}
                    <div className="border border-twitter-accent/50 rounded-3xl p-6 bg-twitter-card/30 hover:bg-twitter-card/50 transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-lg shadow-twitter-accent/10">
                        <div className="absolute top-0 right-0 bg-twitter-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md">
                            RECOMMENDED
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                             <span className="text-3xl font-extrabold text-white">$8</span>
                             <span className="text-twitter-gray">/month</span>
                        </div>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                                <span className="text-sm text-white">Blue checkmark</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                                <span className="text-sm text-white">Prioritized rankings in conversations</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                                <span className="text-sm text-white">Edit posts up to 1 hour</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <div className="mt-1 bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                                <span className="text-sm text-white">Longer posts (up to 25k chars)</span>
                            </li>
                        </ul>
                        <Button fullWidth size="lg" className="font-bold shadow-lg shadow-twitter-accent/20" onClick={handleSubscribe}>Subscribe</Button>
                    </div>

                    {/* Verified Orgs Card */}
                    <div className="border border-twitter-border rounded-3xl p-6 hover:bg-twitter-card/30 transition-all duration-300 cursor-pointer flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">Verified Organizations</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                             <span className="text-3xl font-extrabold text-white">$1,000</span>
                             <span className="text-twitter-gray">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-gray-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-gray-400" /></div>
                                <span className="text-sm text-white">Gold checkmark</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-gray-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-gray-400" /></div>
                                <span className="text-sm text-white">Affiliation badges</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 bg-gray-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-gray-400" /></div>
                                <span className="text-sm text-white">Premium support</span>
                            </li>
                        </ul>
                        <Button variant="secondary" fullWidth size="lg" className="font-bold">Subscribe</Button>
                    </div>
                </div>

                {/* Features Breakdown */}
                <h2 className="text-2xl font-bold text-white mb-8 self-start">Premium Features</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8 w-full">
                    
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Edit Posts</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Fix typos or clarify your point. You can edit any post within one hour of posting it.
                            </p>
                        </div>
                    </div>

                     <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <Type className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Longer Posts</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Express yourself fully with up to 25,000 characters. Perfect for long-form content and detailed threads.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Prioritized Rankings</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Get seen by more people. Your replies are ranked higher in conversations and search.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <FolderHeart className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Bookmark Folders</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Organize your bookmarks into private folders to keep your saved content tidy and accessible.
                            </p>
                        </div>
                    </div>
                    
                     <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Custom App Icons</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Change how your app looks on your phone with a selection of exclusive custom app icons.
                            </p>
                        </div>
                    </div>

                     <div className="flex gap-4 items-start">
                        <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1">Two-Factor Authentication</h3>
                            <p className="text-twitter-gray text-sm leading-relaxed">
                                Add an extra layer of security to your account with text message two-factor authentication.
                            </p>
                        </div>
                    </div>

                </div>
             </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-black border border-twitter-border rounded-2xl p-6 w-full max-w-md relative overflow-hidden">
                    <button 
                        onClick={() => setShowPaymentModal(false)}
                        className="absolute top-4 right-4 text-twitter-gray hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {paymentStep === 'form' && (
                        <div className="animate-in fade-in">
                            <h3 className="text-2xl font-bold text-white mb-6">Confirm Subscription</h3>
                            <div className="bg-twitter-card rounded-xl p-4 mb-6 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white">Premium Monthly</div>
                                    <div className="text-twitter-gray text-sm">Recurring billing</div>
                                </div>
                                <div className="font-bold text-xl text-white">$8.00</div>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div className="border border-twitter-border rounded-lg p-3 flex items-center gap-3 cursor-pointer bg-white/5 border-twitter-accent">
                                    <CreditCard className="text-twitter-accent" />
                                    <div className="flex-1 text-white">Credit Card ending in 4242</div>
                                    <div className="w-4 h-4 rounded-full border-4 border-twitter-accent bg-white"></div>
                                </div>
                            </div>

                            <Button fullWidth size="lg" onClick={processPayment}>Pay $8.00</Button>
                        </div>
                    )}

                    {paymentStep === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
                            <Loader2 className="w-16 h-16 text-twitter-accent animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white">Processing Payment...</h3>
                            <p className="text-twitter-gray">Please do not close this window.</p>
                        </div>
                    )}

                    {paymentStep === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 animate-in fade-in text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                                <Check className="w-8 h-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Welcome to Premium!</h3>
                            <p className="text-twitter-gray mb-8">Your subscription is active. Enjoy your new features.</p>
                            <Button fullWidth onClick={() => setShowPaymentModal(false)}>Start Exploring</Button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};