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
  isScheduled?: boolean;
  isBookmarked?: boolean;
  comments?: TweetComment[];
  quotedTweet?: TweetData; // New property for Quote Tweets
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
}