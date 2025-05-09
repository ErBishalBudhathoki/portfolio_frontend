'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ChevronLeft, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Loading from '../../loading';

// Define types for blog data
interface BlogPost {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  publication_date?: string;
  date?: string;
  thumbnail_url?: string;
  featured_image?: string;
  coverImage?: string; 
  url?: string;
  author?: string;
  reading_time?: string;
  readTime?: string;
  slug?: string;
  tags?: string[];
  content_sections?: Array<{
    type: string;
    content: string;
    image?: string;
  }>;
}

// Helper function to create slugs
function createSlug(title: string): string {
  if (!title) return `post`;
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Format date function
function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  
  useEffect(() => {
    if (!slug) return;
    
    fetchBlogPost();
  }, [slug]);
  
  async function fetchBlogPost() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try the regular posts endpoint first
      let foundPost = await findPostInEndpoint(`/api/blog`, slug);
      
      // If not found, try detailed posts endpoint
      if (!foundPost) {
        foundPost = await findPostInEndpoint(`/api/blog/detailed`, slug);
      }
      
      if (foundPost) {
        setPost(normalizePost(foundPost));
      } else {
        setError("The requested blog post could not be found");
      }
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("Failed to load the blog post. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }
  
  // Helper to find post in an endpoint
  async function findPostInEndpoint(endpoint: string, targetSlug: string): Promise<BlogPost | null> {
    try {
      const origin = window.location.origin;
      const url = `${origin}${endpoint}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${endpoint}: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.posts || !Array.isArray(data.posts) || data.posts.length === 0) {
        return null;
      }
      
      // Process posts to ensure they have slugs
      const processedPosts = data.posts.map((p: BlogPost) => ({
        ...p,
        slug: p.slug || createSlug(p.title),
      }));
      
      // Find the post that matches the slug
      return processedPosts.find((p: BlogPost) => p.slug === targetSlug) || null;
    } catch (error) {
      console.error(`Error in findPostInEndpoint (${endpoint}):`, error);
      return null;
    }
  }
  
  // Normalize post data to handle different API formats
  function normalizePost(post: BlogPost): BlogPost {
    return {
      ...post,
      date: post.date || post.publication_date,
      excerpt: post.excerpt || post.summary,
      coverImage: post.coverImage || post.thumbnail_url || post.featured_image,
      readTime: post.readTime || post.reading_time,
    };
  }
  
  const handleRetry = () => {
    fetchBlogPost();
  };
  
  // Loading state
  if (isLoading) {
    return <Loading />;
  }
  
  // Error state
  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-primary mb-8 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Blog
        </Link>
        
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {error || "The blog post you're looking for could not be found."}
          </p>
          <button 
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-primary mb-8 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Blog
        </Link>

        {/* Post Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-6">
            {post.author && (
              <div className="flex items-center mr-6 mb-2">
                <User className="w-4 h-4 mr-1" />
                <span>{post.author}</span>
              </div>
            )}
            
            <div className="flex items-center mr-6 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
            
            {post.readTime && (
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 mr-1" />
                <span>{post.readTime}</span>
              </div>
            )}
          </div>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="relative rounded-xl overflow-hidden w-full h-64 md:h-96 mb-8">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <article className="prose prose-lg prose-stone dark:prose-invert max-w-none">
          {/* If we have content directly, use it */}
          {post.content && (
            <ReactMarkdown>{post.content}</ReactMarkdown>
          )}
          
          {/* If we have content sections from a detailed post, render them */}
          {post.content_sections && post.content_sections.length > 0 ? (
            <div className="space-y-8">
              {post.content_sections.map((section, index) => (
                <div key={index} className="mb-8">
                  {section.content && (
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  )}
                  
                  {section.image && (
                    <div className="relative w-full h-[300px] my-8 rounded-lg overflow-hidden">
                      <Image
                        src={section.image}
                        alt={`Section image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // If no content or sections, show excerpt/summary
            !post.content && (
              <div>
                <p className="text-muted-foreground italic">
                  {post.excerpt || post.summary || "No content available for this post."}
                </p>
                
                {post.url && (
                  <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                    <p className="mb-4">
                      This article is available on an external site. Click below to read the full article:
                    </p>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Read Full Article
                    </a>
                  </div>
                )}
              </div>
            )
          )}
        </article>
        
        {/* Post Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
} 