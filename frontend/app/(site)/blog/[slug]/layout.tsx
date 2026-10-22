import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { findBySlug } from '@/lib/slug';

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
};

async function getPost(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';
    const res = await fetch(`${apiUrl}/api/profile`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const blogs = Array.isArray(data?.blogs) ? data.blogs : [];
      return findBySlug(blogs, slug);
    }
  } catch (error) {
    console.warn(`[BlogMetadata] Could not fetch post data for slug "${slug}":`, error);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug);

  if (post && post.title) {
    const title = post.title;
    const description =
      post.summary ||
      post.excerpt ||
      `Read ${post.title} by Bishal Budhathoki covering software engineering, mobile development, and modern tech.`;
    const image = post.thumbnail_url || post.featured_image || post.coverImage || '/images/01.png';

    return {
      title,
      description,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        type: 'article',
        title: `${title} | Bishal Budhathoki`,
        description,
        url: `https://bishalbudhathoki.com/blog/${slug}`,
        images: [{ url: image, alt: title }],
        publishedTime: post.publication_date || post.date,
        authors: ['https://bishalbudhathoki.com'],
        tags: Array.isArray(post.tags) ? post.tags : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  }

  const fallbackTitle = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: fallbackTitle || 'Blog Post',
    description: 'Technical blog post by Bishal Budhathoki on software engineering, cloud computing, and mobile apps.',
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug);

  const blogPostingSchema = post && post.title
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `https://bishalbudhathoki.com/blog/${slug}#article`,
        headline: post.title,
        description: post.summary || post.excerpt || post.title,
        image: post.thumbnail_url || post.featured_image || 'https://bishalbudhathoki.com/images/01.png',
        datePublished: post.publication_date || post.date,
        author: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
        publisher: {
          '@id': 'https://bishalbudhathoki.com/#person',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://bishalbudhathoki.com/blog/${slug}`,
        },
      }
    : null;

  return (
    <>
      {blogPostingSchema && <JsonLd data={blogPostingSchema} />}
      {children}
    </>
  );
}
