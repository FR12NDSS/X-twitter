import { User, Community, SiteConfig, EmailConfig, DatabaseConfig } from '../types';
import { MOCK_USERS } from '../utils/mockData';

export interface PremiumPrivilege {
  id: string;
  icon: string;
  title: string;
  description: string;
  plans: ('individual' | 'business' | 'government')[];
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string; // 'month', 'year'
  description: string;
  features: string[];
  type: 'individual' | 'organization';
  isRecommended?: boolean;
}

const DEFAULT_PRIVILEGES: PremiumPrivilege[] = [
    { id: '1', icon: 'Check', title: 'เครื่องหมายถูกสีฟ้า', description: 'ยืนยันตัวตนของคุณด้วยเครื่องหมายถูกสีฟ้า', plans: ['individual'] },
    { id: '2', icon: 'Edit3', title: 'แก้ไขโพสต์', description: 'แก้ไขโพสต์ของคุณภายใน 1 ชั่วโมง', plans: ['individual', 'business', 'government'] },
    { id: '3', icon: 'Zap', title: 'โฆษณาน้อยลง 50%', description: 'เห็นโฆษณาน้อยลงในหน้าไทม์ไลน์', plans: ['individual'] },
    { id: '4', icon: 'ArrowUpCircle', title: 'อันดับความสำคัญ', description: 'การตอบกลับของคุณจะแสดงในอันดับต้นๆ', plans: ['individual', 'business', 'government'] },
    { id: '5', icon: 'Building', title: 'เครื่องหมายถูกสีทอง', description: 'ยืนยันองค์กรของคุณ', plans: ['business'] },
    { id: '6', icon: 'Shield', title: 'เครื่องหมายถูกสีเทา', description: 'ยืนยันหน่วยงานรัฐบาล', plans: ['government'] }
];

const DEFAULT_PLANS: PremiumPlan[] = [
    { id: 'basic', name: 'Basic', price: 100, currency: '฿', interval: 'เดือน', description: 'ฟีเจอร์พื้นฐาน', features: ['แก้ไขโพสต์', 'อัปโหลดวิดีโอ 1080p'], type: 'individual' },
    { id: 'premium', name: 'Premium', price: 275, currency: '฿', interval: 'เดือน', description: 'ประสบการณ์ที่ดีที่สุด', features: ['เครื่องหมายถูกสีฟ้า', 'โฆษณาน้อยลง', 'การจัดอันดับ', 'สร้างรายได้'], type: 'individual', isRecommended: true },
    { id: 'org', name: 'Verified Org', price: 35000, currency: '฿', interval: 'เดือน', description: 'สำหรับธุรกิจ', features: ['เครื่องหมายถูกสีทอง', 'รูปโปรไฟล์สี่เหลี่ยม', 'การสนับสนุนพิเศษ'], type: 'organization' }
];

const STORAGE_KEYS = {
    USERS: 'buzzstream_users',
    COMMUNITIES: 'buzzstream_communities',
    SITE_CONFIG: 'buzzstream_config',
    EMAIL_CONFIG: 'buzzstream_email_config',
    PREMIUM_CONFIG: 'buzzstream_premium_config', // badges, privileges, plans
    SESSION: 'buzzstream_session',
    IS_INSTALLED: 'buzzstream_installed'
};

class UserService {
    private users: User[] = [];
    private communities: Community[] = [];

    constructor() {
        this.loadUsers();
        this.loadCommunities();
    }

    private loadUsers() {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        if (stored) {
            this.users = JSON.parse(stored);
            // Fix: Ensure admin user exists if it got lost or wasn't there in old data
            if (!this.users.some(u => u.handle === 'admin')) {
                 const adminUser = MOCK_USERS.find(u => u.handle === 'admin');
                 if (adminUser) {
                     this.users.unshift(adminUser);
                     this.saveUsers();
                 }
            }
        } else {
            this.users = [...MOCK_USERS]; // Initialize with mock data
            this.saveUsers();
        }
    }

    private saveUsers() {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    }
    
    private loadCommunities() {
         const stored = localStorage.getItem(STORAGE_KEYS.COMMUNITIES);
         if (stored) {
             this.communities = JSON.parse(stored);
         } else {
             this.communities = [];
         }
    }
    
    private saveCommunities() {
        localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(this.communities));
    }

    // --- Authentication ---
    
    public checkInstallationStatus(): boolean {
        return localStorage.getItem(STORAGE_KEYS.IS_INSTALLED) === 'true';
    }
    
    public getSession(): User | null {
        const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
        return stored ? JSON.parse(stored) : null;
    }

    public setSession(user: User) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    }

    public login(identifier: string, password?: string): User {
        // Mock login - check handle/email/phone. Password ignored for mock unless set on admin.
        const user = this.users.find(u => 
            u.handle.toLowerCase() === identifier.toLowerCase() || 
            u.email?.toLowerCase() === identifier.toLowerCase() ||
            u.phone === identifier
        );
        
        if (!user) {
            throw new Error("ไม่พบชื่อผู้ใช้นี้");
        }
        
        // Simple password check simulation (if we had passwords stored)
        // For demo, we just allow login if user exists.
        
        this.setSession(user);
        return user;
    }
    
    public logout() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    
    public register(user: User, password?: string): User {
        if (this.users.some(u => u.handle === user.handle)) {
            throw new Error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
        }
        this.users.push(user);
        this.saveUsers();
        return user;
    }
    
    public verifyEmail(handle: string, code: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (code === '123456') {
                    const index = this.users.findIndex(u => u.handle === handle);
                    if (index !== -1) {
                        this.users[index].isEmailVerified = true;
                        this.saveUsers();
                        this.setSession(this.users[index]);
                        resolve(this.users[index]);
                    } else {
                        reject(new Error("User not found"));
                    }
                } else {
                    reject(new Error("รหัสยืนยันไม่ถูกต้อง"));
                }
            }, 1000);
        });
    }

    public async resendVerificationEmail(handle: string): Promise<void> {
        // Mock send
        console.log(`Resending verification to ${handle}`);
    }

    // --- User Management ---

    public getAllUsers(): User[] {
        return this.users;
    }

    public getUser(handle: string): User | undefined {
        return this.users.find(u => u.handle.toLowerCase() === handle.toLowerCase());
    }

    public updateUser(updatedUser: User) {
        const index = this.users.findIndex(u => u.handle === updatedUser.handle);
        if (index !== -1) {
            this.users[index] = updatedUser;
            this.saveUsers();
            
            // Update session if it's the current user
            const session = this.getSession();
            if (session && session.handle === updatedUser.handle) {
                this.setSession(updatedUser);
            }
        }
    }
    
    public deleteUser(handle: string) {
        this.users = this.users.filter(u => u.handle !== handle);
        this.saveUsers();
    }

    public adminUpdateUser(originalHandle: string, userData: User) {
        const index = this.users.findIndex(u => u.handle === originalHandle);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...userData };
            this.saveUsers();
        }
    }
    
    public adminResetPassword(handle: string, password: string) {
        // Mock password reset
        console.log(`Password reset for ${handle} to ${password}`);
    }

    public toggleProfileShape(handle: string) {
        const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            const current = this.users[index].profileShape;
            this.users[index].profileShape = current === 'square' ? 'circle' : 'square';
            this.saveUsers();
        }
    }

    public toggleVerifyUser(handle: string): boolean {
        const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            const newState = !this.users[index].isVerified;
            this.users[index].isVerified = newState;
            // Reset to individual if untoggled
            if (!newState) {
                 this.users[index].premiumType = undefined;
            } else {
                 this.users[index].premiumType = 'individual';
            }
            this.saveUsers();
            return newState;
        }
        return false;
    }
    
    public cycleVerification(handle: string) {
        const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            const user = this.users[index];
            if (!user.isVerified) {
                // None -> Blue (Individual)
                user.isVerified = true;
                user.premiumType = 'individual';
                user.profileShape = 'circle';
            } else {
                if (user.premiumType === 'individual' || !user.premiumType) {
                    // Blue -> Gold (Business)
                    user.premiumType = 'business';
                    user.profileShape = 'square';
                } else if (user.premiumType === 'business') {
                    // Gold -> Grey (Government)
                    user.premiumType = 'government';
                    user.profileShape = 'circle';
                } else {
                    // Grey -> None
                    user.isVerified = false;
                    user.premiumType = undefined;
                    user.profileShape = 'circle';
                }
            }
            this.users[index] = user;
            this.saveUsers();
            
            // Update session if affecting currently logged in user
            const session = this.getSession();
            if (session && session.handle === handle) {
                this.setSession(this.users[index]);
            }
        }
    }

    public updateUserBadges(handle: string, badges: string[]) {
        const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            this.users[index].verifiedBadges = badges;
            this.saveUsers();
        }
    }

    // --- Premium & Badges ---

    public grantPremiumUser(handle: string, durationInDays?: number, type: 'individual' | 'business' | 'government' = 'individual', customPrivileges?: string[]): boolean {
        const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            const now = new Date();
            this.users[index].isPremium = true;
            this.users[index].isVerified = true; // Premium implies verification usually
            this.users[index].premiumType = type;
            this.users[index].profileShape = type === 'business' ? 'square' : 'circle';
            this.users[index].premiumSince = now.toISOString();
            this.users[index].customPrivileges = customPrivileges;
            
            if (durationInDays) {
                 const expiry = new Date();
                 expiry.setDate(expiry.getDate() + durationInDays);
                 this.users[index].premiumExpiresAt = expiry.toISOString();
            } else {
                // Lifetime
                this.users[index].premiumExpiresAt = undefined;
            }
            
            this.saveUsers();
            return true;
        }
        return false;
    }
    
    public revokePremiumUser(handle: string) {
         const index = this.users.findIndex(u => u.handle === handle);
        if (index !== -1) {
            this.users[index].isPremium = false;
            this.users[index].isVerified = false; // Optionally remove verification too
            this.users[index].premiumType = undefined;
            this.users[index].profileShape = 'circle';
            this.users[index].premiumSince = undefined;
            this.users[index].premiumExpiresAt = undefined;
            this.users[index].customPrivileges = undefined;
            this.saveUsers();
        }
    }

    public getGlobalBadges(): (string | null)[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.badges || [null, null, null, null, null];
        }
        return [null, null, null, null, null];
    }
    
    public setGlobalBadge(index: number, url: string | null) {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        let config = stored ? JSON.parse(stored) : {};
        let badges = config.badges || [null, null, null, null, null];
        badges[index] = url;
        config.badges = badges;
        localStorage.setItem(STORAGE_KEYS.PREMIUM_CONFIG, JSON.stringify(config));
    }
    
    public getPremiumBadgeUrl(): string | null {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        return stored ? JSON.parse(stored).premiumBadgeUrl : null;
    }
    
    public setPremiumBadgeUrl(url: string | null) {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        let config = stored ? JSON.parse(stored) : {};
        config.premiumBadgeUrl = url;
        localStorage.setItem(STORAGE_KEYS.PREMIUM_CONFIG, JSON.stringify(config));
    }

    public getBusinessBadgeUrl(): string | null {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        return stored ? JSON.parse(stored).businessBadgeUrl : null;
    }
    
    public setBusinessBadgeUrl(url: string | null) {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        let config = stored ? JSON.parse(stored) : {};
        config.businessBadgeUrl = url;
        localStorage.setItem(STORAGE_KEYS.PREMIUM_CONFIG, JSON.stringify(config));
    }

    public getPremiumPrivileges(): PremiumPrivilege[] {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.privileges || DEFAULT_PRIVILEGES;
        }
        return DEFAULT_PRIVILEGES;
    }

    public updatePremiumPrivileges(privileges: PremiumPrivilege[]) {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        let config = stored ? JSON.parse(stored) : {};
        config.privileges = privileges;
        localStorage.setItem(STORAGE_KEYS.PREMIUM_CONFIG, JSON.stringify(config));
    }
    
    public getPremiumPlans(): PremiumPlan[] {
         const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.plans || DEFAULT_PLANS;
        }
        return DEFAULT_PLANS;
    }
    
    public updatePremiumPlans(plans: PremiumPlan[]) {
        const stored = localStorage.getItem(STORAGE_KEYS.PREMIUM_CONFIG);
        let config = stored ? JSON.parse(stored) : {};
        config.plans = plans;
        localStorage.setItem(STORAGE_KEYS.PREMIUM_CONFIG, JSON.stringify(config));
    }

    // --- Media ---
    
    public uploadMedia(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Communities ---

    public getCommunities(): Community[] {
        return this.communities;
    }
    
    public createCommunity(data: Partial<Community>) {
        const newComm: Community = {
            id: `comm-${Date.now()}`,
            name: data.name || 'Untitled Community',
            description: data.description || '',
            avatarUrl: data.avatarUrl || 'https://picsum.photos/200',
            memberCount: 1,
        };
        this.communities.push(newComm);
        this.saveCommunities();
        return newComm;
    }

    public updateCommunity(id: string, data: Partial<Community>) {
        const index = this.communities.findIndex(c => c.id === id);
        if (index !== -1) {
            this.communities[index] = { ...this.communities[index], ...data };
            this.saveCommunities();
        }
    }
    
    public deleteCommunity(id: string) {
        this.communities = this.communities.filter(c => c.id !== id);
        this.saveCommunities();
    }
    
    public joinCommunity(handle: string, commId: string) {
        const userIndex = this.users.findIndex(u => u.handle === handle);
        const commIndex = this.communities.findIndex(c => c.id === commId);
        
        if (userIndex !== -1 && commIndex !== -1) {
            const user = this.users[userIndex];
            const comm = this.communities[commIndex];
            
            const joined = user.joinedCommunities || [];
            if (joined.includes(commId)) {
                user.joinedCommunities = joined.filter(id => id !== commId);
                comm.memberCount = Math.max(0, comm.memberCount - 1);
            } else {
                user.joinedCommunities = [...joined, commId];
                comm.memberCount += 1;
            }
            
            this.users[userIndex] = user;
            this.communities[commIndex] = comm;
            this.saveUsers();
            this.saveCommunities();
        }
    }
    
    public getCommunityMembers(commId: string): User[] {
        return this.users.filter(u => u.joinedCommunities?.includes(commId));
    }
    
    public banUserFromCommunity(commId: string, handle: string) {
        const commIndex = this.communities.findIndex(c => c.id === commId);
        if (commIndex !== -1) {
            const comm = this.communities[commIndex];
            const banned = comm.bannedUsers || [];
            if (!banned.includes(handle)) {
                comm.bannedUsers = [...banned, handle];
                this.saveCommunities();
            }
        }
    }
    
    public unbanUserFromCommunity(commId: string, handle: string) {
        const commIndex = this.communities.findIndex(c => c.id === commId);
        if (commIndex !== -1) {
            const comm = this.communities[commIndex];
             if (comm.bannedUsers) {
                 comm.bannedUsers = comm.bannedUsers.filter(h => h !== handle);
                 this.saveCommunities();
             }
        }
    }

    // --- Site Config ---

    public getSiteConfig(): SiteConfig | null {
        const stored = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
        return stored ? JSON.parse(stored) : null;
    }
    
    public configureSite(config: SiteConfig) {
        localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));
    }
    
    public getEmailConfig(): EmailConfig {
        const stored = localStorage.getItem(STORAGE_KEYS.EMAIL_CONFIG);
        return stored ? JSON.parse(stored) : {
            verification: { subject: 'รหัสยืนยันของคุณ', body: 'รหัสของคุณคือ {code}' },
            welcome: { subject: 'ยินดีต้อนรับสู่ {siteName}', body: 'สวัสดี {name}, ขอบคุณที่สมัครสมาชิก' }
        };
    }
    
    public updateEmailConfig(config: EmailConfig) {
        localStorage.setItem(STORAGE_KEYS.EMAIL_CONFIG, JSON.stringify(config));
    }

    // --- Installation ---

    public testDatabaseConnection(config: DatabaseConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            // Mock connection check
            setTimeout(() => {
                if (config.host && config.name && config.user) {
                    resolve();
                } else {
                    reject(new Error("Invalid configuration"));
                }
            }, 1000);
        });
    }

    public installDatabaseTables(config: DatabaseConfig, onProgress: (progress: number, message: string) => void): Promise<void> {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                onProgress(progress, `Installing tables... ${progress}%`);
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 300);
        });
    }

    public installSystem(adminUser: User, password?: string): User {
        localStorage.setItem(STORAGE_KEYS.IS_INSTALLED, 'true');
        // Clear existing
        this.users = []; 
        // Add admin
        this.register(adminUser, password);
        return adminUser;
    }
}

export const userService = new UserService();