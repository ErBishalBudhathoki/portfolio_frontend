import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog Post',
    description: 'Read our latest blog post',
  };
} 