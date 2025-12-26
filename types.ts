export interface TweetComment {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface TweetData {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number; // Impressions
  reach?: number; // Unique accounts reached
  isVerified?: boolean;
  verifiedBadges?: string[]; // Array of badge URLs
  profileShape?: 'circle' | 'square'; // Profile picture shape
  isScheduled?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean; // New: Pin status
  pinnedBy?: 'user' | 'admin'; // New: Who pinned it
  comments?: TweetComment[];
  quotedTweet?: TweetData; // New property for Quote Tweets
  images?: string[]; // Support for post images
  videoThumbnail?: string; // New: Thumbnail URL for video posts
  hashtags?: string[]; // Support for hashtags
  isPremium?: boolean; // Show premium badge on tweet
  premiumType?: 'individual' | 'business' | 'government'; // Type of premium including government
  isPromoted?: boolean; // New: Boost Post status
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avatarUrl: string; // Gradient or Image
  isJoined?: boolean;
  isBanned?: boolean; // New: Ban status
  bannedUsers?: string[]; // New: List of handles banned from this community
}

export interface DatabaseConfig {
  host: string;
  name: string;
  user: string;
  password?: string;
}

export interface SiteConfig {
  domain: string;
  baseUrl: string;
  siteName: string;
  installedAt: string;
  logoUrl?: string; // New: Custom Logo URL
}

export interface EmailTemplate {
    subject: string;
    body: string;
}

export interface EmailConfig {
    verification: EmailTemplate;
    welcome: EmailTemplate;
}

export interface User {
  name: string;
  handle: string;
  avatarUrl: string;
  email?: string; // Added for auth
  phone?: string; // Added for auth
  bannerUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  following?: number;
  followers?: number;
  isVerified?: boolean;
  isEmailVerified?: boolean; // New: Email Verification Status
  verifiedBadges?: string[]; // Up to 5 custom badges
  profileShape?: 'circle' | 'square'; // Default is circle
  joinedCommunities?: string[]; // IDs of joined communities
  isAdmin?: boolean; // New Admin Flag
  isPremium?: boolean; // New Premium Flag
  premiumType?: 'individual' | 'business' | 'government'; // New: Premium Type
  premiumSince?: string; // Date string for when they subscribed
  premiumExpiresAt?: string; // ISO Date string for expiration
  customPrivileges?: string[]; // IDs of specifically granted privileges
}

export enum NavigationItem {
  HOME = 'Home',
  EXPLORE = 'Explore',
  NOTIFICATIONS = 'Notifications',
  MESSAGES = 'Messages',
  GROK = 'Grok', // Rebranded from Gemini
  LISTS = 'Lists',
  BOOKMARKS = 'Bookmarks',
  COMMUNITIES = 'Communities',
  PREMIUM = 'Premium',
  PROFILE = 'Profile',
  SETTINGS = 'Settings',
  ADMIN = 'Admin Panel', // New Admin Navigation Item
  SPACES = 'Spaces', // New
  MONETIZATION = 'Monetization', // New
}