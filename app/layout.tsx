import './globals.css';
import { Navbar } from '../components/Navbar';
import { AppBackground } from '../components/AppBackground';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Losify — Campus AI Lost & Found',
  description: 'Ultra-futuristic AI-powered campus lost and found platform',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.className}>
      <body className={montserrat.className}>
        {/* Dynamically loaded, fixed media remains outside route content. */}
        <AppBackground />

        <div className="shell">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}


