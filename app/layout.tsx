import './globals.css';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Header } from '@/components/header';
import AuthProvider from '@/components/auth/AuthProvider';
import LanguageProvider from '@/components/language/LanguageProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const ibmPlexSansArabic = localFont({
  src: '../public/fonts/IBMPlexSansArabic-Regular.woff2',
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
