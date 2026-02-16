import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'MATZON.gg — Competitive Gaming Ecosystem',
  description: 'The ultimate platform for competitive gaming, tournaments, rankings, and community.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
