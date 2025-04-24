// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import type { Metadata } from "next";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Formatic',
  description: 'Form builder and submission management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <div id="portal-root"></div>
      </body>
    </html>
  );
}