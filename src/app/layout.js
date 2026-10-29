import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import TopNav from '@/components/navigation/TopNav';
import Footer from '@/components/layout/Footer';
import ToastProvider from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

export const metadata = {
  title: 'NEXORA — Shadow Arena',
  description: 'Enter the dark. Master the arena. A premium browser arcade.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="nexora" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body
        style={{ '--font-display': 'var(--font-space-grotesk)', '--font-body': 'var(--font-inter)' }}
        className="flex flex-col min-h-screen"
      >
        <TopNav />
        <div className="flex-1">{children}</div>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  );
}
