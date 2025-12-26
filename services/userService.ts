import { User, Community, DatabaseConfig, SiteConfig, EmailConfig, EmailTemplate } from '../types';
import { MOCK_USERS } from '../utils/mockData';

// Extend User to include password for internal storage
interface StoredUser extends User {
  password?: string;
  verificationToken?: string; // For email verification
}

export interface PremiumPrivilege {
    id: string;
    icon: string; // Name of the lucide icon
    title: string;
    description: string;
    plans: ('individual' | 'business')[]; // Supported plans
}

export interface PremiumPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    description: string; // Short subtitle like "Recurring billing"
    features: string[]; // List of feature IDs or strings
    isRecommended?: boolean;
    type: 'individual' | 'organization';
}

const USERS_KEY = 'buzzstream_users';
const SESSION_KEY = 'buzzstream_session';
const SETUP_KEY = 'buzzstream_setup_complete'; // Check if installed
const DB_CONFIG_KEY = 'buzzstream_db_config'; // Store DB Config
const SITE_CONFIG_KEY = 'buzzstream_site_config'; // Store Domain Config
const GLOBAL_BADGES_KEY = 'buzzstream_global_badges'; // Store the 5 admin uploaded badges
const PREMIUM_CONFIG_KEY = 'buzzstream_premium_config'; // New key for premium settings
const COMMUNITIES_KEY = 'buzzstream_communities';
const EMAIL_CONFIG_KEY = 'buzzstream_email_config'; // Email Templates

// Configuration for PHP Backend Integration
const USE_PHP_BACKEND = false; // Set to true when you have the PHP API ready
const API_BASE_URL = '/api';   // Path to your PHP scripts

class UserService {
  private users: StoredUser[] = [];
  private communities: Community[] = [];
  private globalBadges: (string | null)[] = [null, null, null, null, null]; // Fixed 5 slots
  
  // Premium Configuration
  private premiumBadgeUrl: string | null = null; // Individual
  private businessBadgeUrl: string | null = null; // Business
  private premiumPrivileges: PremiumPrivilege[] = [];
  private premiumPlans: PremiumPlan[] = [];

  // Email Configuration
  private emailConfig: EmailConfig = {
      verification: {
          subject: 'ยืนยันบัญชีผู้ใช้ของคุณ - {siteName}',
          body: 'สวัสดีคุณ {name},\n\nขอบคุณที่สมัครสมาชิก {siteName} กรุณาใช้รหัสยืนยันด้านล่างเพื่อเปิดใช้งานบัญชีของคุณ:\n\nรหัสยืนยัน: {code}\n\nหากคุณไม่ได้ดำเนินการนี้ โปรดเพิกเฉยอีเมลฉบับนี้'
      },
      welcome: {
          subject: 'ยินดีต้อนรับสู่ {siteName}!',
          body: 'สวัสดีคุณ {name},\n\nยินดีต้อนรับสู่ชุมชนของเรา! เราตื่นเต้นที่คุณอยู่ที่นี่'
      }
  };

  constructor() {
    this.init();
  }

  private init() {
    // If using PHP Backend, we would fetch data here
    if (USE_PHP_BACKEND) {
        console.log("Connecting to PHP Backend...");
        // this.fetchUsersFromPHP();
        return;
    }

    // Load Users (LocalStorage Mode)
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users from local storage", e);
        this.seedUsers();
      }
    } else {
      this.seedUsers();
    }

    // Load Communities
    const storedCommunities = localStorage.getItem(COMMUNITIES_KEY);
    if (storedCommunities) {
        this.communities = JSON.parse(storedCommunities);
    } else {
        this.seedCommunities();
    }

    // Load Global Badge Pool
    const storedBadges = localStorage.getItem(GLOBAL_BADGES_KEY);
    if (storedBadges) {
        this.globalBadges = JSON.parse(storedBadges);
    }

    // Load Premium Config
    const storedPremiumConfig = localStorage.getItem(PREMIUM_CONFIG_KEY);
    if (storedPremiumConfig) {
        const config = JSON.parse(storedPremiumConfig);
        this.premiumBadgeUrl = config.badgeUrl;
        this.businessBadgeUrl = config.businessBadgeUrl || null;
        this.premiumPrivileges = config.privileges || [];
        this.premiumPlans = config.plans || [];
        
        // Backward compatibility if plans didn't exist
        if (this.premiumPlans.length === 0) this.seedPremiumPlans();
        if (this.premiumPrivileges.length === 0) this.seedPremiumConfig();
        
    } else {
        this.seedPremiumConfig();
        this.seedPremiumPlans();
    }

    // Load Email Config
    const storedEmailConfig = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (storedEmailConfig) {
        this.emailConfig = JSON.parse(storedEmailConfig);
    }
  }

  // Example method to show how to connect to PHP
  private async fetchUsersFromPHP() {
      try {
          const response = await fetch(`${API_BASE_URL}/get_users.php`);
          const data = await response.json();
          this.users = data;
      } catch (error) {
          console.error("Failed to fetch from PHP API", error);
      }
  }

  // --- Upload Service ---
  /**
   * Uploads a file to the hosting server storage.
   * If USE_PHP_BACKEND is true, it POSTs to the API.
   * If false, it converts to Base64 to simulate a hosted URL.
   */
  public async uploadMedia(file: File): Promise<string> {
      if (USE_PHP_BACKEND) {
          // Real backend implementation
          try {
              const formData = new FormData();
              formData.append('file', file);
              
              // Example endpoint: /api/upload.php
              // Expecting response: { "url": "https://yourdomain.com/uploads/filename.jpg", "success": true }
              const response = await fetch(`${API_BASE_URL}/upload.php`, {
                  method: 'POST',
                  body: formData
              });
              
              if (!response.ok) {
                  throw new Error(`Upload failed: ${response.statusText}`);
              }

              const data = await response.json();
              return data.url;
          } catch (error) {
              console.error("Upload error:", error);
              throw error;
          }
      } else {
          // Simulation: Convert to Base64 to act as a "hosted URL" for the demo
          // In a real scenario without backend, you can't "host" files persistently across sessions easily.
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
          });
      }
  }

  private seedUsers() {
      // Seed with mock users if empty
      const seededUsers: StoredUser[] = MOCK_USERS.map((user, index) => {
        const isPrem = index % 3 === 0;
        // Set expiry for seeded users to 1 year from now if premium
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        return {
            ...user,
            email: `${user.handle}@example.com`,
            password: 'password',
            verifiedBadges: [],
            profileShape: 'circle',
            joinedCommunities: [],
            isPremium: isPrem,
            premiumType: isPrem ? 'individual' : undefined,
            premiumSince: isPrem ? 'Jan 2024' : undefined,
            premiumExpiresAt: isPrem ? nextYear.toISOString() : undefined,
            customPrivileges: [],
            isEmailVerified: true // Mock users are verified
        };
      });

      // Default Admin User (Fallback)
      // Only added if not configured, but installSystem will likely overwrite/add a real one
      const fallbackAdmin = {
        name: 'System Admin',
        handle: 'admin',
        email: 'admin@x.com',
        password: 'password', 
        avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
        bio: 'Official System Administrator',
        joinedDate: 'Joined Jan 2024',
        following: 0,
        followers: 0,
        isVerified: true,
        verifiedBadges: [],
        profileShape: 'square' as const, 
        isAdmin: true,
        joinedCommunities: [],
        isPremium: true,
        premiumType: 'individual' as const,
        premiumSince: 'Lifetime',
        premiumExpiresAt: undefined, 
        customPrivileges: [],
        isEmailVerified: true
      };
      
      // If we are seeding fresh, we add this. 
      // If installSystem runs later, it creates a new admin.
      seededUsers.unshift(fallbackAdmin);

      this.users = seededUsers;
      this.saveUsers();
  }

  private seedCommunities() {
      this.communities = [
         { id: 'c1', name: 'TypeScript Wizards', memberCount: 12000, description: 'For all things TS.', avatarUrl: 'https://picsum.photos/seed/ts/100/100', isBanned: false },
         { id: 'c2', name: 'Generative AI Art', memberCount: 45000, description: 'Share your prompts and creations.', avatarUrl: 'https://picsum.photos/seed/aiart/100/100', isBanned: false },
         { id: 'c3', name: 'Indie Hackers', memberCount: 28000, description: 'Building products in public.', avatarUrl: 'https://picsum.photos/seed/indie/100/100', isBanned: false },
      ];
      this.saveCommunities();
  }

  private seedPremiumConfig() {
      this.premiumPrivileges = [
          { id: 'p1', icon: 'Check', title: 'ป้ายมงกุฎสีทอง', description: 'แสดงหลังชื่อในทุกที่', plans: ['individual', 'business'] },
          { id: 'p2', icon: 'Type', title: 'โพสต์ยาวขึ้น', description: 'พิมพ์ได้สูงสุด 25,000 ตัวอักษร', plans: ['individual', 'business'] },
          { id: 'p3', icon: 'Edit3', title: 'แก้ไขโพสต์', description: 'แก้ไขได้ภายใน 1 ชั่วโมง', plans: ['individual', 'business'] },
          { id: 'p4', icon: 'ArrowUpCircle', title: 'จัดลำดับความสำคัญ', description: 'คอมเมนต์แสดงเป็นอันดับแรกๆ', plans: ['individual', 'business'] },
          { id: 'p5', icon: 'Building', title: 'Business Profile', description: 'Square avatar & Gold Badge', plans: ['business'] }
      ];
  }

  private seedPremiumPlans() {
      this.premiumPlans = [
          { 
              id: 'plan_basic', 
              name: 'Premium', 
              price: 8, 
              currency: '$', 
              interval: 'month',
              description: 'Recurring billing',
              isRecommended: true,
              type: 'individual',
              features: ['ป้ายมงกุฎสีทอง', 'โพสต์ยาวขึ้น', 'แก้ไขโพสต์', 'จัดลำดับความสำคัญ']
          },
          { 
              id: 'plan_org', 
              name: 'Verified Organizations', 
              price: 1000, 
              currency: '$', 
              interval: 'month',
              description: 'For businesses',
              isRecommended: false,
              type: 'organization',
              features: ['Gold checkmark', 'Affiliation badges', 'Premium support']
          }
      ];
      this.savePremiumConfig();
  }

  private saveUsers() {
    if (!USE_PHP_BACKEND) {
        localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
    }
  }

  private saveCommunities() {
    if (!USE_PHP_BACKEND) {
        localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(this.communities));
    }
  }

  private saveGlobalBadges() {
      if (!USE_PHP_BACKEND) {
        localStorage.setItem(GLOBAL_BADGES_KEY, JSON.stringify(this.globalBadges));
      }
  }

  private savePremiumConfig() {
      if (!USE_PHP_BACKEND) {
          localStorage.setItem(PREMIUM_CONFIG_KEY, JSON.stringify({
              badgeUrl: this.premiumBadgeUrl,
              businessBadgeUrl: this.businessBadgeUrl,
              privileges: this.premiumPrivileges,
              plans: this.premiumPlans
          }));
      }
  }

  // --- Email Service (Simulation) ---

  public getEmailConfig(): EmailConfig {
      return this.emailConfig;
  }

  public updateEmailConfig(config: EmailConfig) {
      this.emailConfig = config;
      if (!USE_PHP_BACKEND) {
          localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(this.emailConfig));
      }
  }

  private mockSendEmail(to: string, subject: string, body: string) {
      console.log(`%c[MOCK EMAIL SERVICE] Sending to: ${to}`, 'color: #1d9bf0; font-weight: bold;');
      console.log(`%cSubject: ${subject}`, 'font-weight: bold;');
      console.log(body);
      
      // Simulate API delay
      return new Promise(resolve => setTimeout(resolve, 800));
  }

  private generateVerificationCode(): string {
      return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // --- Install / Setup Methods ---

  public isConfigured(): boolean {
      return !!localStorage.getItem(SETUP_KEY);
  }

  public async checkInstallationStatus(): Promise<boolean> {
      // Simulate connecting to server/checking config files
      await new Promise(resolve => setTimeout(resolve, 800));
      return this.isConfigured();
  }

  // New: Test Database Connection (Auth check only)
  public async testDatabaseConnection(config: DatabaseConfig): Promise<boolean> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation for simulation
      if (!config.host || !config.name || !config.user) {
          throw new Error('กรุณากรอกข้อมูล Host, Database Name และ Username ให้ครบถ้วน');
      }
      
      // Simulate authentication failure randomly or if specific bad input (for demo)
      if (config.user === 'baduser') {
          throw new Error(`Access denied for user '${config.user}'@'${config.host}' (using password: YES)`);
      }

      if (config.name.length < 2) {
          throw new Error(`Unknown database '${config.name}'`);
      }

      return true;
  }

  // New: Install Tables with Progress Streaming
  public async installDatabaseTables(config: DatabaseConfig, onProgress: (progress: number, message: string) => void): Promise<void> {
      const steps = [
          { msg: 'Reading database.sql...', delay: 500 },
          // Users Table
          { msg: `CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              handle VARCHAR(50) UNIQUE NOT NULL,
              email VARCHAR(255),
              phone VARCHAR(50) UNIQUE,
              password VARCHAR(255) NOT NULL,
              avatar_url TEXT,
              banner_url TEXT,
              bio TEXT,
              location VARCHAR(100),
              website VARCHAR(255),
              is_verified BOOLEAN DEFAULT FALSE,
              is_email_verified BOOLEAN DEFAULT FALSE,
              verification_token VARCHAR(100),
              is_admin BOOLEAN DEFAULT FALSE,
              is_premium BOOLEAN DEFAULT FALSE,
              premium_type VARCHAR(20),
              premium_since DATETIME,
              premium_expires_at DATETIME,
              custom_privileges JSON,
              profile_shape ENUM('circle', 'square') DEFAULT 'circle',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`, delay: 800 },
          
          // Tweets Table
          { msg: `CREATE TABLE IF NOT EXISTS tweets (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT,
              content TEXT,
              images JSON,
              video_thumbnail TEXT,
              is_scheduled BOOLEAN DEFAULT FALSE,
              scheduled_for DATETIME,
              is_pinned BOOLEAN DEFAULT FALSE,
              pinned_by ENUM('user', 'admin'),
              is_promoted BOOLEAN DEFAULT FALSE,
              likes INT DEFAULT 0,
              retweets INT DEFAULT 0,
              replies INT DEFAULT 0,
              views INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`, delay: 600 },
          
          // Comments Table
          { msg: `CREATE TABLE IF NOT EXISTS comments (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tweet_id INT,
              user_id INT,
              content TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`, delay: 400 },
          
          // Communities Table
          { msg: `CREATE TABLE IF NOT EXISTS communities (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(100) NOT NULL,
              description TEXT,
              avatar_url TEXT,
              member_count INT DEFAULT 0,
              is_banned BOOLEAN DEFAULT FALSE,
              banned_users JSON,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`, delay: 500 },
          
          // Community Members Table
          { msg: `CREATE TABLE IF NOT EXISTS community_members (
              community_id INT,
              user_id INT,
              joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (community_id, user_id),
              FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`, delay: 400 },
          
          // Premium Plans Table
          { msg: `CREATE TABLE IF NOT EXISTS premium_plans (
              id VARCHAR(50) PRIMARY KEY,
              name VARCHAR(100),
              price DECIMAL(10, 2),
              currency VARCHAR(10),
              interval_type VARCHAR(20),
              description TEXT,
              features JSON,
              type ENUM('individual', 'organization')
          )`, delay: 400 },
          
          // Insert Default Plans
          { msg: `INSERT INTO premium_plans VALUES 
                  ('plan_basic', 'Premium', 8.00, '$', 'month', 'Recurring billing', '["ป้ายมงกุฎสีทอง", "โพสต์ยาวขึ้น"]', 'individual'),
                  ('plan_org', 'Verified Organizations', 1000.00, '$', 'month', 'For businesses', '["Gold checkmark"]', 'organization')
                  ON DUPLICATE KEY UPDATE name=VALUES(name)`, delay: 300 },
          
          // Indexes & Optimization
          { msg: `CREATE INDEX idx_users_handle ON users(handle);`, delay: 300 },
          { msg: `CREATE INDEX idx_tweets_userid ON tweets(user_id);`, delay: 300 },
          { msg: `Optimizing database tables...`, delay: 1000 },
          { msg: `Database setup complete!`, delay: 500 },
      ];

      // Save the config first
      if (!USE_PHP_BACKEND) {
          localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
      }

      let currentStep = 0;
      for (const step of steps) {
          // Calculate progress percentage
          const percentage = Math.round(((currentStep + 1) / steps.length) * 100);
          onProgress(percentage, step.msg);
          
          // Simulate delay for this step
          await new Promise(resolve => setTimeout(resolve, step.delay));
          currentStep++;
      }
  }
  
  // Configure Site Settings (Domain, Name, Logo)
  public configureSite(config: SiteConfig) {
      if (!USE_PHP_BACKEND) {
          // Merge with existing config to prevent data loss if only updating partials
          const existing = this.getSiteConfig() || {};
          const merged = { ...existing, ...config };
          localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(merged));
      }
  }

  public getSiteConfig(): SiteConfig | null {
      const config = localStorage.getItem(SITE_CONFIG_KEY);
      return config ? JSON.parse(config) : null;
  }

  public installSystem(adminUser: User, password: string): User {
      // Clean up previous default admin if exists to avoid collision
      this.users = this.users.filter(u => u.handle !== 'admin');

      const newAdmin: StoredUser = {
          ...adminUser,
          password: password,
          isAdmin: true,
          isVerified: true,
          isPremium: true,
          premiumType: 'individual',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          following: 0,
          followers: 0,
          verifiedBadges: [],
          joinedCommunities: [],
          isEmailVerified: true // Admin is auto verified
      };

      // Add to front
      this.users.unshift(newAdmin);
      this.saveUsers();
      
      // Mark as setup
      localStorage.setItem(SETUP_KEY, 'true');
      
      // Login immediately
      this.setSession(newAdmin);
      
      return newAdmin;
  }

  // --- Auth Methods ---

  public isHandleTaken(handle: string): boolean {
      return this.users.some(u => u.handle.toLowerCase() === handle.toLowerCase());
  }

  public isEmailTaken(email: string): boolean {
      return this.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
  }

  public isPhoneTaken(phone: string): boolean {
      return this.users.some(u => u.phone === phone);
  }

  public async register(user: User, password: string): Promise<User> {
    // Basic checks
    if (this.isHandleTaken(user.handle)) throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    
    if (user.email && this.isEmailTaken(user.email)) throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    if (user.phone && this.isPhoneTaken(user.phone)) throw new Error('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');

    const verificationCode = this.generateVerificationCode();

    const newUser: StoredUser = {
      ...user,
      password,
      following: 0,
      followers: 0,
      isVerified: false,
      isAdmin: false,
      profileShape: 'circle',
      verifiedBadges: [],
      joinedCommunities: [],
      isPremium: false,
      isEmailVerified: false, // Not verified initially
      verificationToken: verificationCode
    };

    this.users.push(newUser);
    this.saveUsers();
    
    // Simulate sending email only if email exists
    if (newUser.email) {
        const siteName = this.getSiteConfig()?.siteName || 'X';
        let subject = this.emailConfig.verification.subject;
        let body = this.emailConfig.verification.body;

        // Replace Placeholders
        subject = subject.replace('{siteName}', siteName).replace('{name}', user.name);
        body = body.replace('{siteName}', siteName)
                .replace('{name}', user.name)
                .replace('{code}', verificationCode)
                .replace('{handle}', user.handle);

        await this.mockSendEmail(newUser.email, subject, body);
    } else {
        // SMS simulation would go here
        console.log(`[MOCK SMS] Sending code ${verificationCode} to ${newUser.phone}`);
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Note: Do not auto-login fully here, we return user to handle verification flow
    const { password: _, verificationToken: __, ...safeUser } = newUser;
    return safeUser;
  }

  public async verifyEmail(handle: string, code: string): Promise<User> {
      // Simulate network
      await new Promise(resolve => setTimeout(resolve, 800));

      const index = this.users.findIndex(u => u.handle === handle);
      if (index === -1) throw new Error('User not found');

      if (this.users[index].verificationToken === code || code === '123456') { // Backdoor for demo
          this.users[index].isEmailVerified = true;
          this.users[index].verificationToken = undefined; // Clear token
          this.saveUsers();
          
          this.setSession(this.users[index]); // Login
          
          const { password: _, verificationToken: __, ...safeUser } = this.users[index];
          return safeUser;
      }

      throw new Error('Invalid verification code');
  }

  public async resendVerificationEmail(handle: string): Promise<void> {
      const user = this.users.find(u => u.handle === handle);
      if (!user) return;

      const code = user.verificationToken || this.generateVerificationCode();
      // Update code if it was missing
      if (!user.verificationToken) {
          const index = this.users.findIndex(u => u.handle === handle);
          if (index !== -1) {
              this.users[index].verificationToken = code;
              this.saveUsers();
          }
      }

      if (user.email) {
          const siteName = this.getSiteConfig()?.siteName || 'X';
          let subject = this.emailConfig.verification.subject;
          let body = this.emailConfig.verification.body;

          subject = subject.replace('{siteName}', siteName).replace('{name}', user.name);
          body = body.replace('{siteName}', siteName)
                  .replace('{name}', user.name)
                  .replace('{code}', code)
                  .replace('{handle}', user.handle);

          await this.mockSendEmail(user.email, subject, body);
      } else if (user.phone) {
          console.log(`[MOCK SMS] Resending code ${code} to ${user.phone}`);
          await new Promise(resolve => setTimeout(resolve, 800));
      }
  }

  public login(identifier: string, password: string): User {
    // Identifier can be email, handle, or phone
    const user = this.users.find(u => 
      (u.email === identifier || u.handle === identifier || u.phone === identifier) && u.password === password
    );

    if (!user) throw new Error('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    
    // Allow login even if not verified? Usually no.
    // For this demo, let's say "Login" succeeds but App should check isEmailVerified
    // Or we throw error here:
    // if (!user.isEmailVerified) throw new Error('Please verify your email address first.');

    this.setSession(user);
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  public setSession(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  public getSession(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  public logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  public updateUser(updatedUser: User) {
    const index = this.users.findIndex(u => u.handle === updatedUser.handle);
    if (index !== -1) {
      const currentPassword = this.users[index].password;
      const currentAdminStatus = this.users[index].isAdmin;
      const currentToken = this.users[index].verificationToken;
      const currentEmailVerified = this.users[index].isEmailVerified;
      const currentPhone = this.users[index].phone;
      
      this.users[index] = { 
          ...updatedUser, 
          password: currentPassword,
          isAdmin: currentAdminStatus,
          verificationToken: currentToken,
          isEmailVerified: currentEmailVerified,
          phone: updatedUser.phone || currentPhone // Preserve phone if not explicitly updated to empty
      };
      
      // If we are updating the current logged in user, refresh session
      const session = this.getSession();
      if (session && session.handle === updatedUser.handle) {
          this.setSession(this.users[index]);
      }
      
      this.saveUsers();
    }
  }
  
  // Admin specific update user: Allows finding by OLD handle to support handle changes
  public adminUpdateUser(originalHandle: string, data: Partial<User>) {
      const index = this.users.findIndex(u => u.handle === originalHandle);
      if (index !== -1) {
          this.users[index] = { ...this.users[index], ...data };
          this.saveUsers();
          
          // If we updated the currently logged in admin's own profile, update session
          const session = this.getSession();
          if (session && session.handle === originalHandle) {
               // The handle might have changed in 'data', so we use the new user object from array
               this.setSession(this.users[index]);
          }
      }
  }

  // New: Admin Reset Password
  public adminResetPassword(handle: string, newPassword: string) {
      const index = this.users.findIndex(u => u.handle === handle);
      if (index !== -1) {
          this.users[index].password = newPassword;
          this.saveUsers();
      }
  }

  // --- User Management (Admin) ---

  public getAllUsers(): User[] {
    return this.users.map(({ password, verificationToken, ...user }) => user);
  }

  public deleteUser(handle: string) {
    this.users = this.users.filter(u => u.handle !== handle);
    this.saveUsers();
  }

  public toggleVerifyUser(handle: string): boolean {
    const index = this.users.findIndex(u => u.handle === handle);
    if (index !== -1) {
        const newState = !this.users[index].isVerified;
        this.users[index].isVerified = newState;
        this.saveUsers();
        return newState;
    }
    return false;
  }
  
  // New: Grant Premium with Duration & Type & Privileges
  public grantPremiumUser(handle: string, durationInDays?: number, type: 'individual' | 'business' = 'individual', customPrivileges?: string[]): boolean {
    const index = this.users.findIndex(u => u.handle === handle);
    if (index !== -1) {
        this.users[index].isPremium = true;
        this.users[index].premiumType = type;
        this.users[index].premiumSince = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        this.users[index].customPrivileges = customPrivileges || [];
        
        // Business Logic: Auto square profile & auto verify
        if (type === 'business') {
            this.users[index].profileShape = 'square';
            this.users[index].isVerified = true;
        }

        if (durationInDays) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + durationInDays);
            this.users[index].premiumExpiresAt = expiry.toISOString();
        } else {
            // Lifetime
            this.users[index].premiumExpiresAt = undefined;
        }

        // Update session if affecting currently logged in user
        const session = this.getSession();
        if (session && session.handle === handle) {
            this.setSession(this.users[index]);
        }

        this.saveUsers();
        return true;
    }
    return false;
  }

  public revokePremiumUser(handle: string): boolean {
    const index = this.users.findIndex(u => u.handle === handle);
    if (index !== -1) {
        this.users[index].isPremium = false;
        this.users[index].premiumType = undefined;
        this.users[index].premiumSince = undefined;
        this.users[index].premiumExpiresAt = undefined;
        this.users[index].customPrivileges = [];
        
        // Update session if affecting currently logged in user
        const session = this.getSession();
        if (session && session.handle === handle) {
            this.setSession(this.users[index]);
        }

        this.saveUsers();
        return true;
    }
    return false;
  }

  public toggleProfileShape(handle: string) {
    const index = this.users.findIndex(u => u.handle === handle);
    if (index !== -1) {
        const currentShape = this.users[index].profileShape || 'circle';
        this.users[index].profileShape = currentShape === 'circle' ? 'square' : 'circle';
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
          // Limit to 5
          this.users[index].verifiedBadges = badges.slice(0, 5);
          this.saveUsers();
      }
  }

  // --- Badge Management ---
  
  public getGlobalBadges(): (string | null)[] {
      return this.globalBadges;
  }

  public setGlobalBadge(index: number, url: string | null) {
      if (index >= 0 && index < 5) {
          this.globalBadges[index] = url;
          this.saveGlobalBadges();
      }
  }

  // --- Premium Config Management ---

  public getPremiumBadgeUrl(): string | null {
      return this.premiumBadgeUrl;
  }

  public setPremiumBadgeUrl(url: string | null) {
      this.premiumBadgeUrl = url;
      this.savePremiumConfig();
  }

  public getBusinessBadgeUrl(): string | null {
      return this.businessBadgeUrl;
  }

  public setBusinessBadgeUrl(url: string | null) {
      this.businessBadgeUrl = url;
      this.savePremiumConfig();
  }

  public getPremiumPrivileges(): PremiumPrivilege[] {
      return this.premiumPrivileges;
  }

  public updatePremiumPrivileges(privileges: PremiumPrivilege[]) {
      this.premiumPrivileges = privileges;
      this.savePremiumConfig();
  }

  // --- Premium Plans Management ---
  
  public getPremiumPlans(): PremiumPlan[] {
      return this.premiumPlans;
  }

  public updatePremiumPlans(plans: PremiumPlan[]) {
      this.premiumPlans = plans;
      this.savePremiumConfig();
  }

  // --- Community Management ---

  public getCommunities(): Community[] {
      return this.communities;
  }

  public createCommunity(community: Omit<Community, 'id' | 'memberCount' | 'isJoined'>) {
      const newCommunity: Community = {
          ...community,
          id: `c-${Date.now()}`,
          memberCount: 1,
          isJoined: false,
          isBanned: false
      };
      this.communities.push(newCommunity);
      this.saveCommunities();
      return newCommunity;
  }
  
  public updateCommunity(id: string, updates: Partial<Community>) {
      const index = this.communities.findIndex(c => c.id === id);
      if (index !== -1) {
          this.communities[index] = { ...this.communities[index], ...updates };
          this.saveCommunities();
      }
  }
  
  public deleteCommunity(id: string) {
      this.communities = this.communities.filter(c => c.id !== id);
      this.saveCommunities();
  }

  public joinCommunity(handle: string, communityId: string) {
      const userIdx = this.users.findIndex(u => u.handle === handle);
      const commIdx = this.communities.findIndex(c => c.id === communityId);

      if (userIdx !== -1 && commIdx !== -1) {
          const community = this.communities[commIdx];
          // Prevent joining banned communities
          if (community.isBanned) return;
          
          // Prevent joining if user is banned from community
          if (community.bannedUsers?.includes(handle)) {
              return; // User is banned
          }

          const user = this.users[userIdx];
          if (!user.joinedCommunities) user.joinedCommunities = [];

          if (!user.joinedCommunities.includes(communityId)) {
              // Join
              user.joinedCommunities.push(communityId);
              this.communities[commIdx].memberCount += 1;
          } else {
              // Leave
              user.joinedCommunities = user.joinedCommunities.filter(id => id !== communityId);
              this.communities[commIdx].memberCount = Math.max(0, this.communities[commIdx].memberCount - 1);
          }
          this.saveUsers();
          this.saveCommunities();
          
           // Update session if needed
            const session = this.getSession();
            if (session && session.handle === handle) {
                this.setSession(this.users[userIdx]);
            }
      }
  }

  // Ban user from community
  public banUserFromCommunity(communityId: string, handle: string) {
    const commIdx = this.communities.findIndex(c => c.id === communityId);
    const userIdx = this.users.findIndex(u => u.handle === handle);

    if (commIdx !== -1 && userIdx !== -1) {
        const community = this.communities[commIdx];
        if (!community.bannedUsers) community.bannedUsers = [];
        
        // Add to banned list if not already
        if (!community.bannedUsers.includes(handle)) {
            community.bannedUsers.push(handle);
        }

        // Remove from members if joined
        const user = this.users[userIdx];
        if (user.joinedCommunities?.includes(communityId)) {
            user.joinedCommunities = user.joinedCommunities.filter(id => id !== communityId);
            community.memberCount = Math.max(0, community.memberCount - 1);
        }

        this.saveCommunities();
        this.saveUsers();
    }
  }

  // Unban user from community
  public unbanUserFromCommunity(communityId: string, handle: string) {
    const commIdx = this.communities.findIndex(c => c.id === communityId);
    if (commIdx !== -1) {
        const community = this.communities[commIdx];
        if (community.bannedUsers) {
            community.bannedUsers = community.bannedUsers.filter(h => h !== handle);
            this.saveCommunities();
        }
    }
  }

  // Get list of users who joined the community
  public getCommunityMembers(communityId: string): User[] {
    return this.users.filter(u => u.joinedCommunities?.includes(communityId));
  }

  public getUser(handle: string): User | undefined {
      // Remove @ if present
      const cleanHandle = handle.replace('@', '');
      return this.users.find(u => u.handle.toLowerCase() === cleanHandle.toLowerCase());
  }
}

export const userService = new UserService();