import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Custom animated logo/spinner */}
        <div className="relative w-24 h-24 mb-6">
          {/* Outer circle - pulses */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          
          {/* Middle spinning circle */}
          <div className="absolute inset-2 rounded-full border-t-4 border-r-4 border-accent-foreground animate-spin"></div>
          
          {/* Inner circle with initials */}
          <div className="absolute inset-5 rounded-full bg-background flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">BB</span>
          </div>
        </div>
        
        {/* Loading text with shimmer effect */}
        <div className="relative">
          <div className="text-lg font-medium text-foreground">
            Loading<span className="animate-pulse">...</span>
          </div>
          
          {/* Shimmer line underneath */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-accent-foreground to-transparent w-full mt-1 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
} 