import React, { useState } from 'react';
import { X, Apple, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthView = 'landing' | 'login_identifier' | 'login_password' | 'signup' | 'forgot-password';

// Moved outside component to avoid recreation and potential type issues
const Logo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-white fill-current">
      <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

interface ScreenLayoutProps { 
  children?: React.ReactNode; 
  onClose?: () => void; 
  showLogo?: boolean;
}

const ScreenLayout = ({ children, onClose, showLogo = true }: ScreenLayoutProps) => (
  <div className="fixed inset-0 z-50 bg-black flex flex-col items-center sm:justify-center">
      {/* Container */}
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[600px] bg-black sm:border sm:border-twitter-border sm:rounded-2xl relative flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-[53px] shrink-0">
              <div className="w-[56px] flex items-center">
                  {onClose && (
                      <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                          <X className="w-6 h-6 text-white" />
                      </button>
                  )}
              </div>
              <div className="flex-1 flex justify-center">
                  {showLogo && <Logo />}
              </div>
              <div className="w-[56px]"></div> {/* Spacer */}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 sm:px-16 pb-safe">
               <div className="max-w-[364px] mx-auto w-full h-full flex flex-col">
                  {children}
               </div>
          </div>
      </div>
  </div>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [identifier, setIdentifier] = useState(''); // email, phone, or handle
  const [password, setPassword] = useState('');
  
  // Signup specific
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when switching views
  const switchView = (newView: AuthView) => {
      setError(null);
      // Don't clear identifier if moving between login steps
      if (newView === 'landing' || newView === 'signup') {
          setIdentifier('');
          setPassword('');
      }
      setView(newView);
  };

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    // In a real app, check if user exists here.
    switchView('login_password');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
        try {
            const user = userService.login(identifier, password);
            onLogin(user);
        } catch (err) {
            setError((err as Error).message);
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
                name: name || 'ผู้ใช้ใหม่',
                handle: handle || 'newuser',
                email: identifier.includes('@') ? identifier : `${handle}@example.com`,
                avatarUrl: `https://picsum.photos/seed/${handle}/200/200`,
                joinedDate: `เข้าร่วมเมื่อ ${new Date().toLocaleString('th-TH', { month: 'long', year: 'numeric' })}`,
                following: 0,
                followers: 0,
                isVerified: false
            };
            
            const registeredUser = userService.register(newUser, password);
            onLogin(registeredUser);
        } catch (err) {
            setError((err as Error).message);
            setIsLoading(false);
        }
    }, 800);
  };

  // --- Views ---

  const renderLanding = () => (
      <ScreenLayout onClose={() => {}}> 
         <div className="flex flex-col h-full pt-12 pb-8">
            <h1 className="text-[31px] leading-9 font-extrabold text-white mb-3">
                ต้องการสร้างบัญชีใช่หรือไม่?
            </h1>
            <p className="text-twitter-gray text-[15px] mb-10 leading-5">
                ไม่ว่าคุณจะต้องการบัญชีอื่นสำหรับการทำงาน หรือแค่ต้องการให้แม่เห็นว่าคุณเด็ดแค่ไหน เราก็จัดให้ได้
            </p>

            <div className="space-y-3">
                <button className="w-full bg-white text-black font-bold rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                    <GoogleIcon />
                    ดำเนินการต่อด้วย Google
                </button>
                <button 
                    onClick={() => switchView('signup')}
                    className="w-full bg-transparent border border-twitter-border text-white font-bold rounded-full py-2.5 px-4 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    สร้างบัญชี
                </button>
            </div>

            <div className="mt-8 text-[13px] text-twitter-gray leading-4 mb-auto">
                โดยการลงชื่อสมัครใช้ คุณยอมรับ<span className="text-twitter-accent">ข้อตกลง</span>, <span className="text-twitter-accent">นโยบายความเป็นส่วนตัว</span> และ <span className="text-twitter-accent">การใช้คุกกี้</span> ของเรา
            </div>

            <div className="mt-8">
                <p className="text-twitter-gray text-[15px]">
                    มีบัญชีอยู่แล้วใช่ไหม? <span onClick={() => switchView('login_identifier')} className="text-twitter-accent font-bold cursor-pointer hover:underline">เข้าสู่ระบบ</span>
                </p>
            </div>
         </div>
      </ScreenLayout>
  );

  const renderLoginIdentifier = () => (
      <ScreenLayout onClose={() => switchView('landing')}>
          <div className="flex flex-col h-full pt-6 relative">
             <h1 className="text-[31px] leading-9 font-extrabold text-white mb-8">
                เพื่อเริ่มใช้งาน อันดับแรก ให้ป้อนหมายเลขโทรศัพท์ อีเมล หรือ @ชื่อผู้ใช้ของคุณ
             </h1>

             <form onSubmit={handleIdentifierSubmit} className="flex-1 flex flex-col">
                <div className="relative group mb-4">
                    <input 
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                        autoFocus
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        หมายเลขโทรศัพท์ อีเมล หรือชื่อผู้ใช้
                    </label>
                 </div>

                 <div className="flex-1"></div>

                 {/* Fixed bottom footer for this screen */}
                 <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-twitter-border bg-black sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:border-t-0 sm:p-0 sm:pb-8 sm:relative">
                    <div className="flex items-center justify-between max-w-[364px] mx-auto w-full">
                        <button 
                            type="button" 
                            className="text-white border border-twitter-border px-4 py-1.5 rounded-full font-bold hover:bg-white/10 transition-colors text-[15px]"
                        >
                            ลืมรหัสผ่าน?
                        </button>
                        <Button 
                            type="submit" 
                            disabled={!identifier.trim()} 
                            className="bg-white text-black hover:bg-gray-200 px-6 py-1.5 rounded-full font-bold text-[15px]"
                        >
                            ถัดไป
                        </Button>
                    </div>
                 </div>
             </form>
          </div>
      </ScreenLayout>
  );

  const renderLoginPassword = () => (
      <ScreenLayout onClose={() => switchView('login_identifier')}>
          <div className="flex flex-col h-full pt-6">
             <h1 className="text-[31px] leading-9 font-extrabold text-white mb-2">
                ป้อนรหัสผ่านของคุณ
             </h1>
             <div className="mb-8">
                 <div className="bg-twitter-card/50 border border-twitter-border rounded px-3 py-2 text-twitter-gray text-[15px] pointer-events-none">
                     {identifier}
                 </div>
             </div>

             <form onSubmit={handleLoginSubmit} className="flex-1 flex flex-col">
                 <div className="relative group mb-4">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                        autoFocus
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        รหัสผ่าน
                    </label>
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 text-twitter-gray hover:text-white"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                 </div>
                 
                 {error && (
                    <div className="text-red-500 text-sm mb-4">
                        {error}
                    </div>
                 )}

                 <div className="flex-1"></div>

                 <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-twitter-border bg-black sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:border-t-0 sm:p-0 sm:pb-8 sm:relative">
                    <div className="flex items-center justify-end max-w-[364px] mx-auto w-full">
                        <Button 
                            type="submit" 
                            disabled={isLoading || !password} 
                            className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full font-bold w-full sm:w-auto"
                        >
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </Button>
                    </div>
                 </div>
             </form>
          </div>
      </ScreenLayout>
  );

  const renderSignup = () => (
      <ScreenLayout onClose={() => switchView('landing')}>
         <div className="flex flex-col h-full pt-6">
             <h1 className="text-[31px] leading-9 font-extrabold text-white mb-8">
                สร้างบัญชีของคุณ
             </h1>

             <form onSubmit={handleSignupSubmit} className="flex-1 flex flex-col space-y-4">
                 <div className="relative group">
                    <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        ชื่อ
                    </label>
                 </div>

                 <div className="relative group">
                    <input 
                        type="text"
                        required
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        ชื่อผู้ใช้
                    </label>
                 </div>

                 <div className="relative group">
                    <input 
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        โทรศัพท์หรืออีเมล
                    </label>
                 </div>
                 
                 <div className="relative group">
                    <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-black border border-twitter-border rounded pt-6 pb-2 px-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-colors text-[17px]"
                        placeholder=" "
                    />
                    <label className="absolute left-3 top-2 text-xs text-twitter-gray transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[17px] peer-focus:top-2 peer-focus:text-xs peer-focus:text-twitter-accent pointer-events-none">
                        รหัสผ่าน
                    </label>
                 </div>

                 <div className="flex-1"></div>

                 <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-twitter-border bg-black sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:border-t-0 sm:p-0 sm:pb-8 sm:relative">
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        fullWidth 
                        size="lg" 
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
                    </Button>
                 </div>
             </form>
         </div>
      </ScreenLayout>
  );

  return (
    <>
        {view === 'landing' && renderLanding()}
        {view === 'login_identifier' && renderLoginIdentifier()}
        {view === 'login_password' && renderLoginPassword()}
        {view === 'signup' && renderSignup()}
    </>
  );
};
