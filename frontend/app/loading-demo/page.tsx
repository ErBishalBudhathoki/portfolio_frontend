'use client';

import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useLoading } from '@/hooks/use-loading';
import { Button } from '@/components/ui/button';

export default function LoadingDemo() {
  const { isLoading, withLoading } = useLoading();
  const [showFullScreen, setShowFullScreen] = useState(false);
  
  const simulateLoading = async () => {
    await withLoading(new Promise(resolve => setTimeout(resolve, 3000)));
  };
  
  const simulateFullScreenLoading = async () => {
    setShowFullScreen(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setShowFullScreen(false);
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold mb-8">Loading Spinner Demo</h1>
      
      {showFullScreen && <LoadingSpinner fullScreen showText />}
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Size Variants</h2>
        <div className="flex flex-wrap gap-10 items-center">
          <div className="space-y-2 flex flex-col items-center">
            <LoadingSpinner size="small" />
            <span className="text-sm text-muted-foreground">Small</span>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <LoadingSpinner size="medium" />
            <span className="text-sm text-muted-foreground">Medium (default)</span>
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <LoadingSpinner size="large" />
            <span className="text-sm text-muted-foreground">Large</span>
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">With Text</h2>
        <div className="flex flex-wrap gap-10 items-center">
          <div className="space-y-2 flex flex-col items-center">
            <LoadingSpinner showText />
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Interactive Demo</h2>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="border rounded-lg p-8 w-full md:w-1/2">
            <h3 className="text-xl font-medium mb-4">Inline Loading</h3>
            <div className="h-40 flex items-center justify-center">
              {isLoading ? (
                <LoadingSpinner size="medium" showText />
              ) : (
                <p className="text-center text-muted-foreground">
                  Content will appear here after loading
                </p>
              )}
            </div>
            <Button 
              className="mt-4 w-full" 
              onClick={simulateLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Simulate Loading (3s)'}
            </Button>
          </div>
          
          <div className="border rounded-lg p-8 w-full md:w-1/2">
            <h3 className="text-xl font-medium mb-4">Full Screen Loading</h3>
            <div className="h-40 flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                A full-screen overlay will appear for 3 seconds
              </p>
            </div>
            <Button 
              className="mt-4 w-full" 
              onClick={simulateFullScreenLoading}
              disabled={showFullScreen}
              variant="outline"
            >
              {showFullScreen ? 'Loading...' : 'Show Full Screen Loading (3s)'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 