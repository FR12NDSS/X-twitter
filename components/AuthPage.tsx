import React, { useState } from 'react';
import { X, Apple, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthView = 'landing' | 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when switching views
  const switchView = (newView: AuthView) => {
      setError(null);
      setEmail('');
      setPassword('');
      setName('');
      setHandle('');
      setView(newView);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
        try {
            const user = userService.login(email, password);
            onLogin(user);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, 800);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
        try {
            const newUser: User = {
                name: name || 'New User',
                handle: handle || 'newuser',
                email: email,
                avatarUrl: `https://picsum.photos/seed/${handle}/200/200`,
                joinedDate: `Joined ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                following: 0,
                followers: 0,
                isVerified: false
            };
            
            const registeredUser = userService.register(newUser, password);
            onLogin(registeredUser);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      alert(`If an account exists for ${email}, a reset link has been sent.`);
      setIsLoading(false);
      switchView('login');
    }, 1000);
  };

  const Logo = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-12 w-12 text-white fill-current">
        <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
    </svg>
  );

  const ModalLayout = ({ title, children }: { title?: string, children?: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm p-4">
        <div className="bg-black w-full max-w-[600px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl border border-twitter-border flex flex-col relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 h-[53px]">
                <div className="w-[56px] flex items-center">
                    <button onClick={() => switchView('landing')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="flex-1 flex justify-center">
                    <Logo />
                </div>
                <div className="w-[56px]"></div> {/* Spacer */}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-12 sm:px-16">
                 <div className="max-w-[364px] mx-auto w-full pt-6">
                    {title && <h2 className="text-3xl font-bold text-white mb-8">{title}</h2>}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm font-bold">
                            {error}
                        </div>
                    )}
                    {children}
                 </div>
            </div>
        </div>
    </div>
  );

  // Render Functions (Instead of nested components)
  
  const renderLanding = () => (
    <div className="flex flex-col md:flex-row h-screen w-full bg-black">
      {/* Left Side (Image/Logo) */}
      <div className="flex-1 flex items-center justify-center bg-twitter-card/20 p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 24 24" className="h-full w-full fill-current text-white pointer-events-none -ml-[50%]">
                <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
            </svg>
        </div>
        <div className="z-10 md:block hidden">
            <svg viewBox="0 0 24 24" className="h-[300px] w-[300px] text-white fill-current">
                <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
            </svg>
        </div>
        <div className="z-10 md:hidden block mb-8">
            <Logo />
        </div>
      </div>

      {/* Right Side (Actions) */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 max-w-2xl">
        <div className="md:hidden block mb-12"></div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-12 tracking-tight">Happening now</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Join today.</h2>

        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          <button className="bg-white text-black font-bold rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign up with Google
          </button>
          
          <button className="bg-white text-black font-bold rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
            <Apple className="w-5 h-5" />
            Sign up with Apple
          </button>

          <div className="flex items-center gap-2 my-1">
            <div className="h-px bg-twitter-border flex-1" />
            <span className="text-white text-sm">or</span>
            <div className="h-px bg-twitter-border flex-1" />
          </div>

          <Button onClick={() => switchView('signup')} className="w-full bg-twitter-accent hover:bg-twitter-hover text-white py-2.5">
            Create account
          </Button>

          <div className="text-xs text-twitter-gray mt-1 leading-4">
            By signing up, you agree to the <span className="text-twitter-accent cursor-pointer">Terms of Service</span> and <span className="text-twitter-accent cursor-pointer">Privacy Policy</span>, including <span className="text-twitter-accent cursor-pointer">Cookie Use</span>.
          </div>

          <div className="mt-12">
            <h3 className="text-white font-bold mb-4">Already have an account?</h3>
            <Button onClick={() => switchView('login')} variant="outline" className="w-full text-twitter-accent border-twitter-border hover:bg-twitter-accent/10 py-2.5">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
      <ModalLayout title="Sign in to BuzzStream">
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
            <button type="button" className="bg-white text-black font-bold rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
            </button>
            <button type="button" className="bg-white text-black font-bold rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Apple className="w-5 h-5" />
                Sign in with Apple
            </button>

            <div className="flex items-center gap-2">
                <div className="h-px bg-twitter-border flex-1" />
                <span className="text-white text-sm">or</span>
                <div className="h-px bg-twitter-border flex-1" />
            </div>

            <div className="space-y-4">
                 <div className="relative group">
                    <input 
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Email or username
                    </label>
                 </div>
                 
                 <div className="relative group">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Password
                    </label>
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 text-twitter-gray hover:text-white"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
            </div>

            <Button type="submit" disabled={isLoading} fullWidth size="lg" className="bg-white text-black hover:bg-gray-200 mt-2">
                {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="flex justify-between items-center mt-4">
                <button type="button" onClick={() => switchView('forgot-password')} className="bg-transparent border border-twitter-border text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
                    Forgot password?
                </button>
                <div className="text-twitter-gray text-sm">
                    Don't have an account? <span onClick={() => switchView('signup')} className="text-twitter-accent cursor-pointer hover:underline">Sign up</span>
                </div>
            </div>
        </form>
      </ModalLayout>
  );

  const renderSignup = () => (
      <ModalLayout title="Create your account">
         <form onSubmit={handleSignupSubmit} className="flex flex-col gap-6">
             <div className="space-y-4">
                 <div className="relative group">
                    <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Name
                    </label>
                 </div>

                 <div className="relative group">
                    <input 
                        type="text"
                        required
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Username (handle)
                    </label>
                 </div>

                 <div className="relative group">
                    <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Email
                    </label>
                 </div>
                 
                 <div className="relative group">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Password
                    </label>
                 </div>
            </div>

            <div className="flex-1"></div>

            <Button type="submit" disabled={isLoading} fullWidth size="lg" className="bg-twitter-accent hover:bg-twitter-hover text-white mt-8">
                {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
         </form>
      </ModalLayout>
  );

  const renderForgotPassword = () => (
      <ModalLayout title="Find your BuzzStream account">
         <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
            <p className="text-twitter-gray">
                Enter the email, phone number, or username associated with your account to change your password.
            </p>
             <div className="space-y-4">
                 <div className="relative group">
                    <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        Email
                    </label>
                 </div>
            </div>

            <div className="flex-1"></div> 

            <Button type="submit" disabled={isLoading} fullWidth size="lg" className="bg-white text-black hover:bg-gray-200 mt-8">
                {isLoading ? 'Sending...' : 'Next'}
            </Button>
         </form>
      </ModalLayout>
  );

  return (
    <>
        {view === 'landing' && renderLanding()}
        {view === 'login' && renderLogin()}
        {view === 'signup' && renderSignup()}
        {view === 'forgot-password' && renderForgotPassword()}
    </>
  );
};