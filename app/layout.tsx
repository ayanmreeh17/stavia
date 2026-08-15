import type { Metadata } from 'next';
import { Frank_Ruhl_Libre, Heebo } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// Display face — elegant Hebrew/Latin serif, used with restraint for headlines.
const display = Frank_Ruhl_Libre({
  subsets: ['latin', 'hebrew'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Body face — clean geometric sans with excellent Hebrew support.
const body = Heebo({
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Stavia | סטאביה — נופש בוטיק בישראל ובעולם',
    template: '%s | Stavia',
  },
  description: 'סטאביה — פלטפורמת נופש בוטיק למציאת וילות, צימרים ובתי נופש ברחבי ישראל ובעולם.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" richColors dir="rtl" />
      </body>
    </html>
  );
}
