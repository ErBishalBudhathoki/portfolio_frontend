import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'medium',
  showText = false,
  fullScreen = false,
  className = '',
}: LoadingSpinnerProps) {
  // Size mappings
  const sizesMap = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex flex-col items-center">
        {/* Custom animated logo/spinner */}
        <div className={`relative ${sizesMap[size]} ${showText ? 'mb-4' : ''}`}>
          {/* Outer circle - pulses */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          
          {/* Middle spinning circle */}
          <div className="absolute inset-2 rounded-full border-t-4 border-r-4 border-accent-foreground animate-spin"></div>
          
          {/* Inner circle with initials */}
          <div className="absolute inset-5 rounded-full bg-background flex items-center justify-center">
            <span className={`${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-lg'} font-bold text-foreground`}>
              BB
            </span>
          </div>
        </div>
        
        {/* Loading text with shimmer effect */}
        {showText && (
          <div className="relative">
            <div className="text-lg font-medium text-foreground">
              Loading<span className="animate-pulse">...</span>
            </div>
            
            {/* Shimmer line underneath */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-foreground to-transparent w-full mt-1 animate-shimmer"></div>
          </div>
        )}
      </div>
    </div>
  );
} 