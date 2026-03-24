'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, PenTool, Bookmark, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRight } from 'lucide-react';
import Loading from '../loading';
import { useApi } from '@/hooks/useApi';

// Define blog data types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  date: string;
  author?: string;
  coverImage?: string;
  tags?: string[];
  readTime?: string;
  published?: boolean;
  summary?: string;
  featured_image?: string;
  thumbnail_url?: string;
  published_date?: string;
  publication_date?: string;
  reading_time?: string;
}

interface ApiResponse {
  posts: BlogPost[];
  [key: string]: any;
}

// Helper function to create a slug from a title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

// Add formatDate function locally
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error(`Error formatting date: ${dateString}`, e);
    return dateString;
  }
}

// Add new image component with error handling
const ImageWithFallback = ({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  [key: string]: any;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setImgSrc('/images/blog-placeholder.jpg');
      }}
    />
  );
};

export default function BlogPage() {
  // Use our cached API hook for regular blog posts
  const { data: regularPosts, error: regularError, isLoading: regularLoading } = useApi<{ posts: BlogPost[] }>('/blog', {
    dedupingInterval: 300000, // 5 minutes cache
  });
  
  // Use our cached API hook for detailed blog posts
  const { data: detailedData, error: detailedError, isLoading: detailedLoading } = useApi<{ posts: BlogPost[] }>('/blog/detailed', {
    dedupingInterval: 300000, // 5 minutes cache
  });
  
  // Process and combine the posts
  const allPosts = useMemo(() => {
    const regular = regularPosts?.posts || [];
    const detailed = detailedData?.posts || [];
    
    // Process posts to ensure they have slugs and IDs
    const processedRegular = regular.map((post, index) => ({
      ...post,
      id: post.id || `post-${index}`,
      slug: post.slug || createSlug(post.title)
    }));
    
    const processedDetailed = detailed.map((post, index) => ({
      ...post,
      id: post.id || `detailed-post-${index}`,
      slug: post.slug || createSlug(post.title)
    }));
    
    return [...processedRegular, ...processedDetailed];
  }, [regularPosts, detailedData]);
  
  // Overall loading and error states
  const isLoading = regularLoading || detailedLoading;
  const error = regularError || detailedError;
  
  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || allPosts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Sorry, we couldn't load the blog posts</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? error.message : "No blog posts were found. Please try again later."}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get featured post (first post)
  const featuredPost = allPosts[0];
  // Rest of the posts
  const restOfPosts = allPosts.slice(1);

  return (
    <div className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-accent-foreground/30 rounded-full bg-accent-foreground/5 text-accent-foreground text-sm font-medium">
            <PenTool className="w-4 h-4 mr-2" />
            My Thoughts
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Blog & Insights
          </h1>
          <div className="w-20 h-1 bg-accent-foreground rounded-full"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-center">
            Dive into my latest thoughts, insights, and tutorials on web development,
            technology trends, and personal projects.
          </p>
        </div>
        
        {/* Featured Post - First Post */}
        {featuredPost && (
          <div className="mb-12">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-full overflow-hidden">
                  <ImageWithFallback
                    src={featuredPost.featured_image || featuredPost.thumbnail_url || featuredPost.coverImage || "/images/blog-placeholder.jpg"}
                    alt={featuredPost.title}
                    className="object-cover w-full h-full"
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex gap-2 mb-3">
                    {featuredPost.tags?.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {featuredPost.summary || featuredPost.excerpt || ""}
                  </p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(featuredPost.date || featuredPost.publication_date || featuredPost.published_date || "")}</span>
                    </div>
                    {(featuredPost.readTime || featuredPost.reading_time) && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{featuredPost.readTime || featuredPost.reading_time}</span>
                      </div>
                    )}
                  </div>
                  <Link 
                    href={`/blog/${featuredPost.slug || createSlug(featuredPost.title)}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Read Full Article <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restOfPosts.map((post) => (
            <div 
              key={post.id || post.title} 
              className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={post.featured_image || post.thumbnail_url || post.coverImage || "/images/blog-placeholder.jpg"}
                  alt={post.title}
                  className="object-cover transform hover:scale-105 transition-transform duration-500 w-full h-full"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
                {post.tags && post.tags.length > 0 && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs shadow-md">
                      {post.tags[0]}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(post.date || post.publication_date || post.published_date || "")}</span>
                  </div>
                  {(post.readTime || post.reading_time) && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{post.readTime || post.reading_time}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {post.summary || post.excerpt || ""}
                </p>
                <Link
                  href={`/blog/${post.slug || createSlug(post.title)}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                >
                  Read More <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Remove the client-side fetching functions since we're now using useApi 