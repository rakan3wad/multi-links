import './globals.css';
import { Inter } from 'next/font/google';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Header } from '@/components/header';
import AuthProvider from '@/components/auth/AuthProvider';
import LanguageProvider from '@/components/language/LanguageProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400'],
  subsets: ['arabic'],
  variable: '--font-arabic',
});

export const metadata = {
  title: 'Multi Links',
  description: 'Share all your important links in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexSansArabic.variable}`}>
      <body>
        <LanguageProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <AuthProvider>
              <div className="flex-1 pt-16">{children}</div>
            </AuthProvider>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
