import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import PwaManager from '@/components/PwaManager';

export const viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1
};

export const metadata = {
  title: 'अन्न सेवा (Anna Seva) - Feed Needy, Reduce Waste',
  description: 'A platform connecting donors with surplus food to those in need, managed dynamically with tracking of cities, listings and food requests.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Anna Seva'
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon-192.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
          <PwaManager />
        </LanguageProvider>
      </body>
    </html>
  );
}

