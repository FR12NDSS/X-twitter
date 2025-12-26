import React from 'react';
import { User } from '../types';

interface VerifiedBadgeProps {
  user?: User | { isVerified?: boolean; verifiedBadges?: string[]; premiumType?: string };
  className?: string;
  forceDefault?: boolean; // If true, only shows the default icon (used for badge upload preview)
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ user, className = "w-4 h-4", forceDefault = false }) => {
  // Authentic SVG Path for the X/Twitter verified badge (wavy edges)
  const VerifiedIcon = ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" aria-label="Verified account" className={`${className} fill-current`} style={{ color }}>
        <g>
            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.02-3.01-1.09-4.12-1.1-1.1-2.73-1.55-4.12-1.09C14.17 2.13 12.93 1.25 11.5 1.25c-1.43 0-2.67.88-3.34 2.19-1.39-.46-3.01-.02-4.12 1.09-1.1 1.1-1.55 2.73-1.09 4.12C1.58 9.33.7 10.57.7 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.02 3.01 1.09 4.12 1.1 1.1 2.73 1.55 4.12 1.09.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 3.01.02 4.12-1.09 1.1-1.1 1.55-2.73 1.09-4.12 1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"></path>
        </g>
    </svg>
  );

  // If we are forcing default (e.g. upload preview)
  if (forceDefault) {
      return <VerifiedIcon color="#1d9bf0" />;
  }

  // If user has specific custom badges assigned (Legacy/Custom), render them
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

  // Authentic Logic for Badge Color
  if (user?.isVerified) {
      // Government / Official / Multilateral Organizations (Grey)
      if (user.premiumType === 'government') {
          return <VerifiedIcon color="#829aab" />;
      }

      // Verified Organizations / Business (Gold)
      if (user.premiumType === 'business' || user.premiumType === 'organization') {
          return <VerifiedIcon color="#ffd400" />;
      }
      
      // Individual Premium / Legacy (Blue)
      return <VerifiedIcon color="#1d9bf0" />;
  }

  return null;
};