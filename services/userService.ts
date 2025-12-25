import { User } from '../types';
import { MOCK_USERS } from '../utils/mockData';

// Extend User to include password for internal storage
interface StoredUser extends User {
  password?: string;
}

const USERS_KEY = 'buzzstream_users';
const SESSION_KEY = 'buzzstream_session';

class UserService {
  private users: StoredUser[] = [];

  constructor() {
    this.init();
  }

  private init() {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (e) {
        console.error("Failed to parse users from local storage", e);
        // Fallback: Clear invalid data and re-seed
        this.seedUsers();
      }
    } else {
      this.seedUsers();
    }
  }

  private seedUsers() {
      // Seed with mock users if empty
      // Default password for mock users is 'password'
      const seededUsers = MOCK_USERS.map(user => ({
        ...user,
        email: `${user.handle}@example.com`,
        password: 'password'
      }));

      // Add default Admin User
      seededUsers.unshift({
        name: 'System Admin',
        handle: 'admin',
        email: 'admin@buzzstream.ai',
        password: 'password', // Default password
        avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff',
        bio: 'Official System Administrator',
        joinedDate: 'Joined Jan 2024',
        following: 0,
        followers: 0,
        isVerified: true,
        isAdmin: true
      });

      this.users = seededUsers;
      this.saveUsers();
  }

  private saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }

  public register(user: User, password: string): User {
    // Check if email or handle already exists
    if (this.users.some(u => u.email === user.email)) {
      throw new Error('Email already registered');
    }
    if (this.users.some(u => u.handle.toLowerCase() === user.handle.toLowerCase())) {
      throw new Error('Username is already taken');
    }

    const newUser: StoredUser = {
      ...user,
      password, // In a real app, this should be hashed
      following: 0,
      followers: 0,
      isVerified: false,
      isAdmin: false
    };

    this.users.push(newUser);
    this.saveUsers();
    this.setSession(newUser);
    
    // Return sanitized user (no password)
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  public login(email: string, password: string): User {
    const user = this.users.find(u => 
      (u.email === email || u.handle === email) && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.setSession(user);
    
    // Return sanitized user
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
      // Preserve password
      const currentPassword = this.users[index].password;
      // Preserve admin status unless explicitly handled (usually safeguards here)
      const currentAdminStatus = this.users[index].isAdmin;
      
      this.users[index] = { 
          ...updatedUser, 
          password: currentPassword,
          isAdmin: currentAdminStatus // Prevent accidental removal of admin via profile edit
      };
      this.saveUsers();
      
      // Only update session if the updated user is the current session user
      const session = this.getSession();
      if (session && session.handle === updatedUser.handle) {
          this.setSession(this.users[index]);
      }
    }
  }

  // --- Admin Methods ---

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
}

export const userService = new UserService();