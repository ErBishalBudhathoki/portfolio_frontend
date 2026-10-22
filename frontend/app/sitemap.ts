import { MetadataRoute } from 'next';
import { createSlug } from '@/lib/slug';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishalbudhathoki.com';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Clean W3C YYYY-MM-DD format for Google Search Console

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/carenest/support`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/carenest/privacy-policy`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamically fetch blog posts for dynamic post URLs
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';
    const response = await fetch(`${apiUrl}/api/profile`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = await response.json();
      const blogs = Array.isArray(data?.blogs) ? data.blogs : [];

      const blogRoutes: MetadataRoute.Sitemap = blogs
        .filter((post: any) => post?.title)
        .map((post: any) => {
          const slug = post.slug || createSlug(post.title);
          const rawDate = post.publication_date || post.date;
          let dateStr = today;
          if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          }
          return {
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: dateStr,
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
