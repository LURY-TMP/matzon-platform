'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  Home,
  Trophy,
  Swords,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Plus,
} from 'lucide-react';

const sidebarItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/matches', label: 'Matches', icon: Swords },
  { href: '/rankings', label: 'Rankings', icon: BarChart3 },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-bg min-h-[calc(100vh-4rem)] p-4 gap-2">
      <Link
        href="/tournaments/create"
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold text-sm px-4 py-3 rounded-md transition-all duration-200 mb-2"
      >
        <Plus className="w-4 h-4" />
        Create Tournament
      </Link>

      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-white/55 hover:text-white hover:bg-white/5',
              )}
            >
              <item.icon className={cn('w-4 h-4', isActive && 'text-accent')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
