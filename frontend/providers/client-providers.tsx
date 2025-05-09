'use client';

import React from 'react';
import { DataProvider } from '@/providers/data-provider';
import { LoadingProvider } from '@/providers/loading-provider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </DataProvider>
  );
} 