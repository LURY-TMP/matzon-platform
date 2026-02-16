'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  Menu,
  X,
  Search,
  Trophy,
  Swords,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/matches', label: 'Matches', icon: Swords },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-cyan flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-display text-lg font-bold tracking-wider">MATZON</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/60 hover:text-white rounded-md hover:bg-white/5 transition-all duration-200"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/settings" className="text-white/50 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <button onClick={logout} className="text-white/40 hover:text-danger transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/70 hover:text-white p-2"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bg border-t border-border">
          <div className="px-4 py-4 grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="px-4 pb-4 flex gap-2">
            {isAuthenticated ? (
              <Button variant="danger" size="sm" className="w-full" onClick={() => { logout(); setMenuOpen(false); }}>
                Log Out
              </Button>
            ) : (
              <>
                <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Log In</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
