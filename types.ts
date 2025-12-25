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
  comments?: TweetComment[];
  quotedTweet?: TweetData; // New property for Quote Tweets
  images?: string[]; // Support for post images
  hashtags?: string[]; // Support for hashtags
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avatarUrl: string; // Gradient or Image
  isJoined?: boolean;
}

export interface User {
  name: string;
  handle: string;
  avatarUrl: string;
  email?: string; // Added for auth
  bannerUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  following?: number;
  followers?: number;
  isVerified?: boolean;
  verifiedBadges?: string[]; // Up to 5 custom badges
  profileShape?: 'circle' | 'square'; // Default is circle
  joinedCommunities?: string[]; // IDs of joined communities
  isAdmin?: boolean; // New Admin Flag
}

export enum NavigationItem {
  HOME = 'Home',
  EXPLORE = 'Explore',
  NOTIFICATIONS = 'Notifications',
  MESSAGES = 'Messages',
  GEMINI = 'Gemini', // AI Tab
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