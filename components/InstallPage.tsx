import React, { useState } from 'react';
import { Check, ChevronRight, Loader2, Shield, User, Rocket, Database, Server, Terminal, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { User as UserType, DatabaseConfig, SiteConfig } from '../types';
import { userService } from '../services/userService';

interface InstallPageProps {
  onInstallComplete: (adminUser: UserType) => void;
}

export const InstallPage: React.FC<InstallPageProps> = ({ onInstallComplete }) => {
  const [step, setStep] = useState(1); // 1: Welcome, 2: DB Config, 3: Admin Setup
  const [isInstalling, setIsInstalling] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  
  // Install Logs for final step
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [installProgress, setInstallProgress] = useState(0);

  // Database Config State
  const [dbHost, setDbHost] = useState('localhost');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbError, setDbError] = useState('');
  
  // Field Validation States
  const [isDbNameInvalid, setIsDbNameInvalid] = useState(false);

  // Admin Form State
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    setStep(2);
  };

  const handleDbConnect = async () => {
      setDbError('');
      setIsDbNameInvalid(false);

      if (!dbHost || !dbName || !dbUser) {
          setDbError('กรุณากรอก Host, ชื่อฐานข้อมูล และ Username');
          return;
      }

      const config: DatabaseConfig = {
          host: dbHost,
          name: dbName,
          user: dbUser,
          password: dbPass
      };

      try {
          // Phase 1: Authentication Check
          setIsTestingDb(true);
          await userService.testDatabaseConnection(config);
          setIsTestingDb(false);

          // Phase 2: Install Tables / Import SQL
          setIsImporting(true);
          await userService.installDatabaseTables(config, (progress, message) => {
              setImportProgress(progress);
              setImportStatus(message);
          });
          
          setTimeout(() => {
              setStep(3); // Move to admin setup on success
          }, 500);

      } catch (err) {
          const errorMessage = (err as Error).message || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้';
          setDbError(errorMessage);
          
          // Check if error is related to database name (mock simulation check)
          if (errorMessage.toLowerCase().includes('database') || errorMessage.toLowerCase().includes('unknown')) {
              setIsDbNameInvalid(true);
          }
          
          setIsTestingDb(false);
          setIsImporting(false);
      }
  };

  const handleInstall = async () => {
    if (!name || !handle || !email || !password) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    setIsInstalling(true);
    
    // Detect Current Domain
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;
    
    // Installation Steps Simulation
    const steps = [
        "กำลังสร้างบัญชีผู้ดูแลระบบ...",
        `ตรวจพบโดเมน: ${currentDomain}`,
        `กำลังเชื่อมต่อระบบเข้ากับ ${currentOrigin}...`,
        `กำลังตั้งค่า DNS records สำหรับ ${currentDomain}...`,
        "กำลังตั้งค่าหน้าเว็บไซต์หลัก (Home Feed)...",
        "กำลังเชื่อมต่อหน้า Explore และ Search...",
        "กำลังตั้งค่าระบบการแจ้งเตือน (Notification Center)...",
        "กำลังเชื่อมโยงระบบข้อความ (Direct Messages)...",
        "กำลังเปิดใช้งานโมดูล Gemini AI...",
        "กำลังติดตั้งระบบจัดการชุมชน (Community Manager)...",
        "กำลังตรวจสอบความปลอดภัย (Security Check)...",
        `ยืนยันตัวตนโดเมน ${currentDomain} เรียบร้อย`,
        "การติดตั้งเสร็จสมบูรณ์! พร้อมใช้งาน"
    ];

    for (let i = 0; i < steps.length; i++) {
        setInstallProgress(Math.round(((i + 1) / steps.length) * 100));
        setInstallLogs(prev => [...prev, steps[i]]);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
    }
    
    // Save Site Config
    userService.configureSite({
        domain: currentDomain,
        baseUrl: currentOrigin,
        siteName: "Twitter Thailand",
        installedAt: new Date().toISOString()
    });
    
    // Finalize after animation
    const adminUser: UserType = {
        name,
        handle: handle.toLowerCase().replace('@', ''),
        email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d9bf0&color=fff`,
        joinedDate: new Date().toLocaleDateString(),
        following: 0,
        followers: 0,
        isVerified: true,
        isAdmin: true,
        isPremium: true
    };

    try {
        const createdAdmin = userService.installSystem(adminUser, password);
        // Small delay for user to see "Complete"
        setTimeout(() => {
            onInstallComplete(createdAdmin);
        }, 1000);
    } catch (e) {
        setError('เกิดข้อผิดพลาดในการติดตั้ง');
        setIsInstalling(false);
    }
  };

  const renderWelcome = () => (
    <div className="text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-12 h-12 text-black fill-current">
                <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
            </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">ยินดีต้อนรับสู่ Twitter Thailand</h1>
        <p className="text-xl text-twitter-gray mb-10 max-w-lg mx-auto">
            แพลตฟอร์มโซเชียลมีเดียอัจฉริยะที่ขับเคลื่อนด้วย AI พร้อมให้คุณเป็นเจ้าของแล้ว เริ่มต้นการติดตั้งเพื่อสร้างชุมชนของคุณ
        </p>
        <Button size="lg" onClick={handleStart} className="shadow-lg shadow-twitter-accent/20">
            เริ่มต้นการติดตั้ง <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
    </div>
  );

  const renderDbSetup = () => (
    <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-twitter-card rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <Database className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">ตั้งค่าฐานข้อมูล</h2>
            <p className="text-twitter-gray text-sm mt-2">เชื่อมต่อเว็บไซต์ของคุณกับฐานข้อมูล (MySQL/MariaDB)</p>
        </div>

        {/* Form View or Progress View */}
        {!isImporting ? (
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-green-500">Database Host</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-twitter-gray"><Server className="w-4 h-4" /></span>
                        <input 
                            type="text" 
                            value={dbHost}
                            onChange={(e) => setDbHost(e.target.value)}
                            disabled={isTestingDb}
                            className="w-full bg-black border border-twitter-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all disabled:opacity-50"
                            placeholder="localhost"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className={`block text-xs mb-1 ${isDbNameInvalid ? 'text-red-500' : 'text-twitter-gray group-focus-within:text-green-500'}`}>
                        Database Name (ชื่อฐานข้อมูล)
                    </label>
                    <div className="relative">
                        <span className={`absolute left-3 top-3 ${isDbNameInvalid ? 'text-red-500' : 'text-twitter-gray'}`}>
                            <Database className="w-4 h-4" />
                        </span>
                        <input 
                            type="text" 
                            value={dbName}
                            onChange={(e) => {
                                setDbName(e.target.value);
                                if(isDbNameInvalid) setIsDbNameInvalid(false);
                            }}
                            disabled={isTestingDb}
                            className={`w-full bg-black border rounded-lg pl-10 pr-4 py-3 text-white outline-none transition-all disabled:opacity-50 ${
                                isDbNameInvalid 
                                ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500' 
                                : 'border-twitter-border focus:border-green-500 focus:ring-1 focus:ring-green-500'
                            }`}
                            placeholder="my_buzzstream_db"
                        />
                        {isDbNameInvalid && (
                            <div className="absolute right-3 top-3 text-red-500 pointer-events-none">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    {isDbNameInvalid && (
                        <p className="text-red-500 text-xs mt-1 ml-1 animate-in slide-in-from-top-1">
                            ข้อมูลไม่ถูกต้อง: ไม่พบฐานข้อมูลนี้
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-green-500">Username</label>
                        <input 
                            type="text" 
                            value={dbUser}
                            onChange={(e) => setDbUser(e.target.value)}
                            disabled={isTestingDb}
                            className="w-full bg-black border border-twitter-border rounded-lg px-4 py-3 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all disabled:opacity-50"
                            placeholder="root"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-green-500">Password</label>
                        <input 
                            type="password" 
                            value={dbPass}
                            onChange={(e) => setDbPass(e.target.value)}
                            disabled={isTestingDb}
                            className="w-full bg-black border border-twitter-border rounded-lg px-4 py-3 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all disabled:opacity-50"
                            placeholder="••••••"
                        />
                    </div>
                </div>

                {dbError && !isDbNameInvalid && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{dbError}</p>}

                <div className="pt-4 flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)} disabled={isTestingDb}>ย้อนกลับ</Button>
                    <Button fullWidth size="lg" onClick={handleDbConnect} disabled={isTestingDb}>
                        {isTestingDb ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> กำลังตรวจสอบ...
                            </>
                        ) : (
                            'เชื่อมต่อและติดตั้ง'
                        )}
                    </Button>
                </div>
            </div>
        ) : (
            <div className="animate-in fade-in duration-500 space-y-6">
                <div className="bg-black border border-twitter-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-green-500" /> 
                            กำลังนำเข้าฐานข้อมูล
                        </span>
                        <span className="text-green-500 font-mono text-sm">{importProgress}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-twitter-border rounded-full h-2.5 mb-4 overflow-hidden">
                        <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${importProgress}%` }}
                        ></div>
                    </div>

                    {/* Terminal Output */}
                    <div className="bg-twitter-card/50 rounded-lg p-3 font-mono text-xs text-twitter-gray border border-twitter-border h-32 overflow-y-auto flex flex-col-reverse">
                        <div className="text-green-400/80">
                            <span className="text-twitter-gray mr-2">$</span>
                            {importStatus}
                        </div>
                    </div>
                </div>
                <p className="text-center text-sm text-twitter-gray">กรุณาอย่าปิดหน้าต่างนี้จนกว่าการติดตั้งจะเสร็จสมบูรณ์</p>
            </div>
        )}
    </div>
  );

  const renderAdminSetup = () => (
    <div className="w-full max-w-md animate-in slide-in-from-right duration-300">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-twitter-card rounded-full flex items-center justify-center mx-auto mb-4 text-twitter-accent">
                <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">สร้างบัญชีผู้ดูแลระบบ</h2>
            <p className="text-twitter-gray text-sm mt-2">บัญชีนี้จะมีสิทธิ์เข้าถึง Admin Panel เต็มรูปแบบ</p>
        </div>

        {!isInstalling ? (
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-twitter-accent">ชื่อที่แสดง (Display Name)</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black border border-twitter-border rounded-lg px-4 py-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-all"
                        placeholder="เช่น System Admin"
                    />
                </div>
                
                <div className="group">
                    <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-twitter-accent">ชื่อผู้ใช้ (Handle)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-twitter-gray">@</span>
                        <input 
                            type="text" 
                            value={handle}
                            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="w-full bg-black border border-twitter-border rounded-lg pl-8 pr-4 py-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-all"
                            placeholder="admin"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-twitter-accent">อีเมล</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black border border-twitter-border rounded-lg px-4 py-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-all"
                        placeholder="admin@example.com"
                    />
                </div>

                <div className="group">
                    <label className="block text-xs text-twitter-gray mb-1 group-focus-within:text-twitter-accent">รหัสผ่าน</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-twitter-border rounded-lg px-4 py-3 text-white outline-none focus:border-twitter-accent focus:ring-1 focus:ring-twitter-accent transition-all"
                        placeholder="ตั้งรหัสผ่านที่ปลอดภัย"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="pt-4 flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(2)}>ย้อนกลับ</Button>
                    <Button fullWidth size="lg" onClick={handleInstall}>
                        ติดตั้งและเริ่มต้นใช้งาน
                    </Button>
                </div>
            </div>
        ) : (
            <div className="animate-in fade-in duration-500 space-y-6">
                <div className="bg-black border border-twitter-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-twitter-accent" /> 
                            กำลังติดตั้งระบบเว็บไซต์
                        </span>
                        <span className="text-twitter-accent font-mono text-sm">{installProgress}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-twitter-border rounded-full h-2.5 mb-4 overflow-hidden">
                        <div 
                            className="bg-twitter-accent h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${installProgress}%` }}
                        ></div>
                    </div>

                    {/* Terminal Output */}
                    <div className="bg-twitter-card/50 rounded-lg p-3 font-mono text-xs text-twitter-gray border border-twitter-border h-48 overflow-y-auto flex flex-col-reverse">
                        <div className="flex flex-col gap-1">
                            {installLogs.map((log, i) => (
                                <div key={i} className="text-white/80 animate-in slide-in-from-left-2 duration-300">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-center text-sm text-twitter-gray">ระบบกำลังเชื่อมต่อหน้าเว็บทั้งหมดเข้าด้วยกัน...</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-twitter-accent/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-2xl bg-black/50 backdrop-blur-xl border border-twitter-border rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center min-h-[500px] justify-center">
            
            {/* Steps Indicator */}
            <div className="flex gap-2 mb-12 absolute top-8">
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-twitter-accent' : 'bg-twitter-border'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-twitter-accent' : 'bg-twitter-border'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 3 ? 'bg-twitter-accent' : 'bg-twitter-border'}`}></div>
            </div>

            {step === 1 && renderWelcome()}
            {step === 2 && renderDbSetup()}
            {step === 3 && renderAdminSetup()}
        </div>

        <div className="absolute bottom-6 text-twitter-gray text-xs">
            © 2025 Twitter Thailand Installer v1.0
        </div>
    </div>
  );
};