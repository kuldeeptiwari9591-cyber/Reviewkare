import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ReviewKare - AI Google Review Autopilot & In-Clinic AI QR Flow for Indian Businesses',
  description:
    'Auto-reply to Google reviews in Hindi, Hinglish & English in your brand tone. Auto-post 5-star replies, hold 1-3 star reviews for 1-tap owner approval. 100% Google policy compliant.',
  keywords: [
    'google review management software India',
    'auto reply to google reviews Hindi Hinglish',
    'AI review reply tool India',
    'QR code for google reviews clinic salon',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
