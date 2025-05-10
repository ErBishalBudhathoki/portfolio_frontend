'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetchData } from '@/lib/data-fetching';

// Define the shape of our profile data
interface Skill {
  name: string;
  level?: number;
  category?: string;
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ProfileData {
  basic_info: {
    name?: string;
    headline?: string;
    location?: string;
    profile_image?: string;
    profile_image_url?: string; // Support both naming conventions
    about?: string;
  };
  social_links: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
  skills?: Skills | Skill[];
  experiences?: any[];
  experience?: any[]; // Support both naming conventions
  education?: any[];
  projects?: any[];
  cv_url?: string;
}

// Context to store our data and data-fetching methods
interface DataContextType {
  profileData: ProfileData | null;
  projectsData: any[] | null;
  isLoading: boolean;
  isError: boolean;
  mutateProfileData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache keys - must match the ones in data-fetching.ts
const CACHE_KEYS = {
  PROFILE: 'portfolio_profile_data',
};

// Constant for profile image - centralized for easy updating
const LOCAL_PROFILE_IMAGE = '/images/01.png';

// Custom fetcher function
const fetcher = async (url: string) => {
  const data = await fetchData(url);
  
  // Handle potential naming convention differences in the API
  if (data && data.basic_info) {
    // ALWAYS use local image instead of any external URL
    // This prevents CORS issues and ensures the image is always available
    data.basic_info.profile_image_url = LOCAL_PROFILE_IMAGE;
    data.basic_info.profile_image = LOCAL_PROFILE_IMAGE;
  }
  
  return data;
};

// Initialize with cached data if available
const getInitialData = (): ProfileData | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const cachedData = localStorage.getItem(CACHE_KEYS.PROFILE);
    if (!cachedData) return undefined;
    
    const parsedData = JSON.parse(cachedData);
    
    // Ensure the cached data also has the constant profile image
    if (parsedData && parsedData.basic_info) {
      parsedData.basic_info.profile_image_url = LOCAL_PROFILE_IMAGE;
      parsedData.basic_info.profile_image = LOCAL_PROFILE_IMAGE;
    }
    
    return parsedData;
  } catch (e) {
    console.warn('Error reading cache:', e);
    return undefined;
  }
};

// Use a conditional approach to create the DataProvider
export function DataProvider({ children }: { children: ReactNode }) {
  // Use a mounted state to track client-side rendering
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Return a simple container on server, but same structure as client
  if (!mounted) {
    return (
      <div className="data-provider-container">
        {children}
      </div>
    );
  }
  
  return <ClientDataProvider>{children}</ClientDataProvider>;
}

// Create a client-only component that uses hooks
function ClientDataProvider({ children }: { children: ReactNode }) {
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  
  // Fetch profile data with SWR for automatic caching and revalidation
  const { 
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfileData
  } = useSWR<ProfileData>('api/profile', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    onLoadingSlow: () => setIsLoadingGlobal(true),
    onSuccess: () => setIsLoadingGlobal(false),
    onError: () => setIsLoadingGlobal(false),
    fallbackData: getInitialData(),
    suspense: false,
    keepPreviousData: true
  });

  // For projects, we can use the same profile data or fetch separately
  // Here we'll extract it from the profile data
  const projectsData = profileData?.projects || null;

  const isLoading = profileLoading || isLoadingGlobal;
  const isError = !!profileError;

  // Prevent showing loading state when we have cached data
  useEffect(() => {
    if (getInitialData() && isLoading) {
      setIsLoadingGlobal(false);
    }
  }, [isLoading]);

  const contextValue = {
    profileData: profileData || null,
    projectsData,
    isLoading,
    isError,
    mutateProfileData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  // Use a safe context check
  const context = useContext(DataContext);
  if (context === undefined) {
    // Return a fallback value instead of throwing an error
    return {
      profileData: null,
      projectsData: null,
      isLoading: true,
      isError: false,
      mutateProfileData: () => {},
    };
  }
  return context;
} 