import React, { useState, useEffect } from 'react';
import { BadgeCheck, Check, Edit3, Type, ArrowUpCircle, FolderHeart, Smartphone, ShieldCheck, X, CreditCard, Loader2, Crown, Zap, Heart, Star, Clock, Building, User } from 'lucide-react';
import { Button } from './Button';
import { userService, PremiumPlan } from '../services/userService';

// Icon Map for dynamic rendering
const ICON_MAP: Record<string, React.FC<any>> = {
    Check, Star, Zap, Crown, Shield: ShieldCheck, BadgeCheck, Type, Edit3, ArrowUpCircle, Smartphone, Heart, FolderHeart, ShieldCheck, Clock, Building
};

export const Premium: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [privileges, setPrivileges] = useState(userService.getPremiumPrivileges());
  const [plans, setPlans] = useState<PremiumPlan[]>(userService.getPremiumPlans());
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual');

  useEffect(() => {
      setPrivileges(userService.getPremiumPrivileges());
      setPlans(userService.getPremiumPlans());
  }, []);

  const handleSubscribe = (plan: PremiumPlan) => {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
      setPaymentStep('form');
  };

  const processPayment = () => {
      setPaymentStep('processing');
      
      // Simulate backend update via Admin method for demo purposes
      if (selectedPlan) {
          const user = userService.getSession();
          if (user) {
              const premiumType = selectedPlan.type === 'organization' ? 'business' : 'individual';
              // Note: In real app, this happens on server after payment.
              // We call this here to simulate the immediate effect for the user in this demo.
              userService.grantPremiumUser(user.handle, 30, premiumType);
          }
      }

      setTimeout(() => {
          setPaymentStep('success');
      }, 2000);
  };

  const filteredPrivileges = privileges.filter(p => p.plans?.includes(activeTab));

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
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`border border-twitter-border rounded-3xl p-6 hover:bg-twitter-card/30 transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col ${plan.isRecommended ? 'bg-twitter-card/30 shadow-lg shadow-twitter-accent/10 border-twitter-accent/50' : ''}`}
                        >
                            {plan.isRecommended && (
                                <div className="absolute top-0 right-0 bg-twitter-accent text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md">
                                    RECOMMENDED
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                 <span className="text-3xl font-extrabold text-white">{plan.currency}{plan.price.toLocaleString()}</span>
                                 <span className="text-twitter-gray">/{plan.interval}</span>
                            </div>
                            
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-500" /></div>
                                        <span className="text-sm text-white">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button 
                                fullWidth 
                                size="lg" 
                                className={`font-bold ${plan.isRecommended ? 'shadow-lg shadow-twitter-accent/20' : ''}`} 
                                variant={plan.isRecommended ? 'primary' : 'secondary'}
                                onClick={() => handleSubscribe(plan)}
                            >
                                Subscribe
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Features Breakdown */}
                <h2 className="text-2xl font-bold text-white mb-6 self-start">Premium Features</h2>
                
                {/* Feature Tabs */}
                <div className="flex gap-2 mb-8 self-start bg-twitter-card p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('individual')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'individual' ? 'bg-twitter-accent text-white' : 'text-twitter-gray hover:text-white'}`}
                    >
                        <User className="w-4 h-4" /> Individual
                    </button>
                    <button 
                        onClick={() => setActiveTab('business')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'business' ? 'bg-twitter-accent text-white' : 'text-twitter-gray hover:text-white'}`}
                    >
                        <Building className="w-4 h-4" /> Business
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8 w-full animate-in fade-in">
                    {filteredPrivileges.map((priv) => {
                        const IconComponent = ICON_MAP[priv.icon] || Check;
                        return (
                            <div key={priv.id} className="flex gap-4 items-start">
                                <div className="p-3 bg-twitter-card rounded-xl text-twitter-accent">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg mb-1">{priv.title}</h3>
                                    <p className="text-twitter-gray text-sm leading-relaxed">
                                        {priv.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {filteredPrivileges.length === 0 && (
                        <div className="col-span-2 text-center text-twitter-gray py-8">
                            No specific privileges listed for this category.
                        </div>
                    )}
                </div>
             </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
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
                                    <div className="font-bold text-white">{selectedPlan.name}</div>
                                    <div className="text-twitter-gray text-sm">{selectedPlan.description}</div>
                                </div>
                                <div className="font-bold text-xl text-white">{selectedPlan.currency}{selectedPlan.price.toLocaleString()}</div>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div className="border border-twitter-border rounded-lg p-3 flex items-center gap-3 cursor-pointer bg-white/5 border-twitter-accent">
                                    <CreditCard className="text-twitter-accent" />
                                    <div className="flex-1 text-white">Credit Card ending in 4242</div>
                                    <div className="w-4 h-4 rounded-full border-4 border-twitter-accent bg-white"></div>
                                </div>
                            </div>

                            <Button fullWidth size="lg" onClick={processPayment}>Pay {selectedPlan.currency}{selectedPlan.price.toLocaleString()}</Button>
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
                            <h3 className="text-2xl font-bold text-white mb-2">Welcome to {selectedPlan.name}!</h3>
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