import { useState, useMemo } from 'react';
import Logo from './Logo';

const isDevEnvironment = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));

const Avatar = ({ url, firstName, size = 'md', className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = useMemo(() => ({
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
    '3xl': 'w-32 h-32 text-3xl',
    '4xl': 'w-40 h-40 text-5xl'
  }), []);

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const initial = firstName?.[0]?.toUpperCase();
  const baseClasses = `${sizeClass} rounded-full border border-white/20 flex items-center justify-center text-white font-bold ${className}`;

  if (isDevEnvironment || !url || imageError) {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-gray-700 to-gray-800 p-1`}>
        {initial || <Logo className="w-full h-full opacity-80" />}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} bg-gray-800 rounded-full border border-white/20 overflow-hidden ${className}`}>
      {!imageLoaded && <div className="w-full h-full bg-gray-700 animate-pulse" />}
      <img
        src={url}
        alt={firstName || 'User'}
        className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default Avatar;
