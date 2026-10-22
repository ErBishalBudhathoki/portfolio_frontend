import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Me',
  description:
    'Get in touch with Bishal Budhathoki, Software Engineer based in Sydney, Australia. Available for software engineering roles, mobile app projects, consulting, and collaboration.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Bishal Budhathoki | Software Engineer',
    description:
      'Connect with Bishal Budhathoki for full-stack development, Flutter/Kotlin mobile projects, and engineering opportunities.',
    url: 'https://bishalbudhathoki.com/contact',
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://bishalbudhathoki.com/contact#webpage',
  url: 'https://bishalbudhathoki.com/contact',
  name: 'Contact Bishal Budhathoki',
  description:
    'Contact details and messaging form for Sydney-based Software Engineer Bishal Budhathoki.',
  mainEntity: {
    '@id': 'https://bishalbudhathoki.com/#person',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={contactSchema} />
      {children}
    </>
  );
}
