import { User, Community } from '../types';
import { MOCK_USERS } from '../utils/mockData';

// Extend User to include password for internal storage
interface StoredUser extends User {
  password?: string;
}

const USERS_KEY = 'buzzstream_users';
const SESSION_KEY = 'buzzstream_session';
const GLOBAL_BADGES_KEY = 'buzzstream_global_badges'; // Store the 5 admin uploaded badges
const COMMUNITIES_KEY = 'buzzstream_communities';

class UserService {
  private users: StoredUser[] = [];
  private communities: Community[] = [];
  private globalBadges: (string | null)[] = [null, null, null, null, null]; // Fixed 5 slots

  constructor() {
    this.init();
  }

  private init() {
    // Load Users
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
  }

  private seedUsers() {
      // Seed with mock users if empty
      const seededUsers: StoredUser[] = MOCK_USERS.map(user => ({
        ...user,
        email: `${user.handle}@example.com`,
        password: 'password',
        verifiedBadges: [],
        profileShape: 'circle',
        joinedCommunities: []
      }));

      // Add default Admin User
      seededUsers.unshift({
        name: 'System Admin',
        handle: 'admin',
        email: 'admin@buzzstream.ai',
        password: 'password', 
        avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
        bio: 'Official System Administrator',
        joinedDate: 'Joined Jan 2024',
        following: 0,
        followers: 0,
        isVerified: true,
        verifiedBadges: [],
        profileShape: 'square', // Admin gets square by default for demo
        isAdmin: true,
        joinedCommunities: []
      });

      this.users = seededUsers;
      this.saveUsers();
  }

  private seedCommunities() {
      this.communities = [
         { id: 'c1', name: 'TypeScript Wizards', memberCount: 12000, description: 'For all things TS.', avatarUrl: 'https://picsum.photos/seed/ts/100/100' },
         { id: 'c2', name: 'Generative AI Art', memberCount: 45000, description: 'Share your prompts and creations.', avatarUrl: 'https://picsum.photos/seed/aiart/100/100' },
         { id: 'c3', name: 'Indie Hackers', memberCount: 28000, description: 'Building products in public.', avatarUrl: 'https://picsum.photos/seed/indie/100/100' },
      ];
      this.saveCommunities();
  }

  private saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }

  private saveCommunities() {
    localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(this.communities));
  }

  private saveGlobalBadges() {
      localStorage.setItem(GLOBAL_BADGES_KEY, JSON.stringify(this.globalBadges));
  }

  // --- Auth Methods ---

  public register(user: User, password: string): User {
    if (this.users.some(u => u.email === user.email)) throw new Error('Email already registered');
    if (this.users.some(u => u.handle.toLowerCase() === user.handle.toLowerCase())) throw new Error('Username is already taken');

    const newUser: StoredUser = {
      ...user,
      password,
      following: 0,
      followers: 0,
      isVerified: false,
      isAdmin: false,
      profileShape: 'circle',
      verifiedBadges: [],
      joinedCommunities: []
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setSession(newUser);
    
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  public login(email: string, password: string): User {
    const user = this.users.find(u => 
      (u.email === email || u.handle === email) && u.password === password
    );

    if (!user) throw new Error('Invalid email or password');

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
      
      this.users[index] = { 
          ...updatedUser, 
          password: currentPassword,
          isAdmin: currentAdminStatus
      };
      this.saveUsers();
      
      const session = this.getSession();
      if (session && session.handle === updatedUser.handle) {
          this.setSession(this.users[index]);
      }
    }
  }

  // --- User Management (Admin) ---

  public getAllUsers(): User[] {
    return this.users.map(({ password, ...user }) => user);
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

  public toggleProfileShape(handle: string) {
    const index = this.users.findIndex(u => u.handle === handle);
    if (index !== -1) {
        const currentShape = this.users[index].profileShape || 'circle';
        this.users[index].profileShape = currentShape === 'circle' ? 'square' : 'circle';
        this.saveUsers();
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

  // --- Community Management ---

  public getCommunities(): Community[] {
      return this.communities;
  }

  public createCommunity(community: Omit<Community, 'id' | 'memberCount' | 'isJoined'>) {
      const newCommunity: Community = {
          ...community,
          id: `c-${Date.now()}`,
          memberCount: 1,
          isJoined: false // UI state, logic handled below
      };
      this.communities.push(newCommunity);
      this.saveCommunities();
      return newCommunity;
  }

  public joinCommunity(handle: string, communityId: string) {
      const userIdx = this.users.findIndex(u => u.handle === handle);
      const commIdx = this.communities.findIndex(c => c.id === communityId);

      if (userIdx !== -1 && commIdx !== -1) {
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
}

export const userService = new UserService();