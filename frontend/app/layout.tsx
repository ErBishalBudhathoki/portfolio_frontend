import './globals.css';
import './utils.css';
import { Inter as FontSans } from 'next/font/google';
import { JetBrains_Mono as FontMono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Metadata, Viewport } from 'next';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ClientProviders from '@/providers/client-providers';

// Define fonts
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "Bishal Budhathoki Portfolio",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 
    "Professional portfolio website of Bishal Budhathoki showcasing projects, skills, and experience.",
  keywords: ["portfolio", "developer", "software engineer", "web development", "Bishal Budhathoki"],
  authors: [{ name: "Bishal Budhathoki" }],
  creator: "Bishal Budhathoki",
  icons: {
    icon: ['/favicon.svg'],
  },
  manifest: '/manifest.json',
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
        className={`${fontSans.variable} ${fontMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
