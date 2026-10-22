import './globals.css';
import './utils.css';
import { Inter as FontSans } from 'next/font/google';
import { JetBrains_Mono as FontMono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Metadata, Viewport } from 'next';
import ClientProviders from '@/providers/client-providers';
import { PersonJsonLd } from '@/components/JsonLd';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishalbudhathoki.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bishal Budhathoki | Software Engineer & Full-Stack Developer",
    template: "%s | Bishal Budhathoki",
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Professional portfolio of Bishal Budhathoki, Software Engineer based in Sydney, Australia. Specializing in Flutter, Kotlin, Android, iOS, React, Next.js, Node.js, Python, and Cloud Solutions.",
  keywords: [
    "Bishal Budhathoki",
    "Software Engineer Sydney",
    "Full-Stack Developer",
    "Mobile App Developer Australia",
    "Flutter Developer",
    "Kotlin Developer",
    "Android Developer",
    "iOS Developer",
    "React Developer",
    "Next.js Developer",
    "Node.js Developer",
    "Python FastAPI",
    "CQUniversity IT Graduate",
    "CareNest NDIS",
    "Portfolio",
  ],
  authors: [{ name: "Bishal Budhathoki", url: SITE_URL }],
  creator: "Bishal Budhathoki",
  publisher: "Bishal Budhathoki",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Bishal Budhathoki Portfolio",
    title: "Bishal Budhathoki | Software Engineer & Full-Stack Developer",
    description:
      "Professional portfolio of Bishal Budhathoki, Software Engineer based in Sydney, Australia. Specializing in Flutter, Kotlin, Android, iOS, React, Next.js, Node.js, Python, and Cloud Solutions.",
    images: [
      {
        url: "/images/01.png",
        width: 1200,
        height: 630,
        alt: "Bishal Budhathoki - Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bishal Budhathoki | Software Engineer & Full-Stack Developer",
    description:
      "Software Engineer based in Sydney, Australia. Building mobile apps, full-stack web platforms, and cloud microservices.",
    creator: "@bis2vis",
    site: "@bis2vis",
    images: ["/images/01.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: ["/favicon.svg"],
    apple: ["/favicon.svg"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          "antialiased bg-background text-foreground"
        )}
      >
        <PersonJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>{children}</ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
