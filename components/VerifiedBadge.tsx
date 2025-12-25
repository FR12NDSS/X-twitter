import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { User } from '../types';

interface VerifiedBadgeProps {
  user?: User | { isVerified?: boolean; verifiedBadges?: string[] };
  className?: string;
  forceDefault?: boolean; // If true, only shows the default icon (used for badge upload preview)
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ user, className = "w-4 h-4", forceDefault = false }) => {
  // If we are forcing default (e.g. upload preview)
  if (forceDefault) {
      return <BadgeCheck className={`${className} text-twitter-accent fill-current`} />;
  }

  // If user has specific custom badges assigned, render them
  if (user?.verifiedBadges && user.verifiedBadges.length > 0) {
    return (
        <div className="flex items-center gap-0.5">
            {user.verifiedBadges.map((badgeUrl, index) => (
                <img 
                    key={index} 
                    src={badgeUrl} 
                    className={`${className} object-contain`} 
                    alt="Verified" 
                    title="Verified Badge"
                />
            ))}
        </div>
    );
  }

  // Fallback to default checkmark if verified but no custom badges
  if (user?.isVerified) {
      return <BadgeCheck className={`${className} text-twitter-accent fill-current`} />;
  }

  return null;
};