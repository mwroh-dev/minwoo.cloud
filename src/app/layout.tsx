import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { GoogleAnalytics as NextGA } from '@next/third-parties/google';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Minwoo.Roh | Web Developer",
  description: "Seasoned in React.js & Experienced Nest.js | Problem-Solver Exploring Complex Domains",
};


function GoogleAnalytics() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return null;

  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
  if (!gaId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_ANALYTICS is not set');
  }

  return <NextGA gaId={gaId} />;
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="max-w-screen-md mx-auto">
          <main className="flex flex-col w-full h-full">
            <Header />
            {children}
            <Footer />
          </main>
      </body>
      <GoogleAnalytics />
    </html>
  );
}
