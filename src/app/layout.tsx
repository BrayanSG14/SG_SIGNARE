import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LangProvider } from '@/context/LangContext';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'SG SIGNARE',
  description: 'Control total sobre tu prenda. Diseño 3D, sublimación certificada y manufactura transparente.',
  keywords: 'camisas personalizadas, diseño 3D, sublimación premium, manufactura bajo demanda',
  openGraph: {
    title: 'SG SIGNARE',
    description: 'Manufactura bajo demanda con estándares verificables.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="light">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <style>{`
          :root,
          [data-theme="light"] {
            --sg-bg: #f4efe7;
            --sg-bg2: #e7e0d5;
            --sg-text: #00162d;
            --sg-muted: #637a83;
            --sg-border: rgba(0, 22, 45, 0.08);
            --sg-glass: rgba(255, 255, 255, 0.34);
            --sg-glass-strong: rgba(255, 255, 255, 0.52);
            --sg-glass-border: rgba(255, 255, 255, 0.72);
            --sg-glass-shadow: rgba(0, 22, 45, 0.13);
          }

          [data-theme="dark"] {
            --sg-bg: #0d0b09;
            --sg-bg2: #151210;
            --sg-text: rgba(245, 240, 235, 0.92);
            --sg-muted: rgba(172, 184, 194, 0.72);
            --sg-border: rgba(255, 255, 255, 0.08);
            --sg-glass: rgba(255, 255, 255, 0.08);
            --sg-glass-strong: rgba(255, 255, 255, 0.12);
            --sg-glass-border: rgba(255, 255, 255, 0.18);
            --sg-glass-shadow: rgba(0, 0, 0, 0.55);
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            background:
              radial-gradient(circle at 10% 0%, rgba(255, 255, 255, 0.70), transparent 34rem),
              linear-gradient(135deg, var(--sg-bg) 0%, var(--sg-bg2) 100%);
            color: var(--sg-text);
            margin: 0;
            transition: background-color 0.4s, color 0.3s;
          }

          [data-theme="dark"] body {
            background:
              radial-gradient(circle at 10% 0%, rgba(90, 106, 128, 0.20), transparent 32rem),
              linear-gradient(135deg, var(--sg-bg) 0%, var(--sg-bg2) 100%);
          }
        `}</style>

        <LangProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </LangProvider>
      </body>
    </html>
  );
}