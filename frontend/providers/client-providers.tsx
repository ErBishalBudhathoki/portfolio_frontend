// client-providers.tsx
'use client';

import React, { Suspense } from 'react'; // Import Suspense
import { DataProvider } from '@/providers/data-provider';
import { LoadingProvider } from '@/providers/loading-provider';
import AnalyticsProvider from '@/providers/analytics-provider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <LoadingProvider>
        <Suspense fallback={null}> {/* Wrap AnalyticsProvider here */}
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </Suspense>
      </LoadingProvider>
    </DataProvider>
  );
}