import { MetadataRoute } from 'next';
import { createSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishalbudhathoki.com';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/carenest/support`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/carenest/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamically fetch blog posts for dynamic post URLs
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';
    const response = await fetch(`${apiUrl}/api/profile`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      const blogs = Array.isArray(data?.blogs) ? data.blogs : [];

      const blogRoutes: MetadataRoute.Sitemap = blogs
        .filter((post: any) => post?.title)
        .map((post: any) => {
          const slug = post.slug || createSlug(post.title);
          const postDate = post.publication_date || post.date ? new Date(post.publication_date || post.date) : now;
          return {
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: isNaN(postDate.getTime()) ? now : postDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
          };
        });

      return [...staticRoutes, ...blogRoutes];
    }
  } catch (error) {
    console.warn('[Sitemap] Could not fetch blog routes for sitemap, using static routes:', error);
  }

  return staticRoutes;
}
