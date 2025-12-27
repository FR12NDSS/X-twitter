import { User } from '../types';

export const MOCK_USERS: User[] = [
  { name: 'Google DeepMind', handle: 'DeepMind', avatarUrl: 'https://picsum.photos/seed/deepmind/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 1200000, following: 45 },
  { name: 'Open Source', handle: 'OpenSource', avatarUrl: 'https://picsum.photos/seed/opensource/200/200', isVerified: false, followers: 45000, following: 120 },
  { name: 'TypeScript', handle: 'typescript', avatarUrl: 'https://picsum.photos/seed/ts/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 890000, following: 0 },
  { name: 'React Team', handle: 'reactjs', avatarUrl: 'https://picsum.photos/seed/react/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 2100000, following: 12 },
  { name: 'Gov Tech', handle: 'GovTechAgency', avatarUrl: 'https://picsum.photos/seed/govtech/200/200', isVerified: true, premiumType: 'government', profileShape: 'circle', followers: 56000, following: 12 },
  { name: 'Gemini AI', handle: 'GoogleAI', avatarUrl: 'https://picsum.photos/seed/ai/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 5000000, following: 10 },
  { name: 'Elon Musk', handle: 'elonmusk', avatarUrl: 'https://picsum.photos/seed/elon/200/200', isVerified: true, premiumType: 'individual', profileShape: 'circle', followers: 160000000, following: 400 },
  { name: 'Official News', handle: 'WorldNews', avatarUrl: 'https://picsum.photos/seed/news/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 4500000, following: 20 },
  { name: 'Vercel', handle: 'vercel', avatarUrl: 'https://picsum.photos/seed/vercel/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 450000, following: 89 },
  { name: 'Supabase', handle: 'supabase', avatarUrl: 'https://picsum.photos/seed/supabase/200/200', isVerified: true, premiumType: 'business', profileShape: 'square', followers: 85000, following: 150 },
  { name: 'Demo User', handle: 'demouser', avatarUrl: 'https://picsum.photos/seed/currentUser/200/200', isVerified: false, followers: 8932, following: 142 },
];