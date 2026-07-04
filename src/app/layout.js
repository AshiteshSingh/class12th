import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

export const metadata = {
  title: 'Competition Judging System',
  description: 'Grand Finale Judging System to score participants across 5 categories',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
