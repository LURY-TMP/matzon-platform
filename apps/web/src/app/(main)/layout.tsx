'use client';

import { Header, Sidebar, Footer } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-bg">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
