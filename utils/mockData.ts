import { User } from '../types';

export const MOCK_USERS: User[] = [
  { name: 'Google DeepMind', handle: 'DeepMind', avatarUrl: 'https://picsum.photos/seed/deepmind/200/200', isVerified: true, followers: 1200000, following: 45 },
  { name: 'Open Source', handle: 'OpenSource', avatarUrl: 'https://picsum.photos/seed/opensource/200/200', isVerified: false, followers: 45000, following: 120 },
  { name: 'TypeScript', handle: 'typescript', avatarUrl: 'https://picsum.photos/seed/ts/200/200', isVerified: true, followers: 890000, following: 0 },
  { name: 'React Team', handle: 'reactjs', avatarUrl: 'https://picsum.photos/seed/react/200/200', isVerified: true, followers: 2100000, following: 12 },
  { name: 'Tailwind CSS', handle: 'tailwindcss', avatarUrl: 'https://picsum.photos/seed/tailwind/200/200', isVerified: true, followers: 350000, following: 56 },
  { name: 'Gemini AI', handle: 'GoogleAI', avatarUrl: 'https://picsum.photos/seed/ai/200/200', isVerified: true, followers: 5000000, following: 10 },
  { name: 'Elon Musk', handle: 'elonmusk', avatarUrl: 'https://picsum.photos/seed/elon/200/200', isVerified: true, followers: 160000000, following: 400 },
  { name: 'Sam Altman', handle: 'sama', avatarUrl: 'https://picsum.photos/seed/sama/200/200', isVerified: true, followers: 2300000, following: 1200 },
  { name: 'Vercel', handle: 'vercel', avatarUrl: 'https://picsum.photos/seed/vercel/200/200', isVerified: true, followers: 450000, following: 89 },
  { name: 'Supabase', handle: 'supabase', avatarUrl: 'https://picsum.photos/seed/supabase/200/200', isVerified: false, followers: 85000, following: 150 },
  { name: 'Demo User', handle: 'demouser', avatarUrl: 'https://picsum.photos/seed/currentUser/200/200', isVerified: false, followers: 8932, following: 142 },
];