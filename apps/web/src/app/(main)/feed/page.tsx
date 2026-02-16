'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { feedApi, tournamentsApi, usersApi } from '@/lib/api';
import { useSocket } from '@/hooks/use-socket';
import { Card, Badge, Button, CardSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { Trophy, Swords, TrendingUp, Users, ChevronRight, UserPlus, Award, Zap } from 'lucide-react';
import Link from 'next/link';

const EVENT_ICONS: Record<string, any> = {
  USER_FOLLOWED: UserPlus,
  TOURNAMENT_CREATED: Trophy,
  TOURNAMENT_JOINED: Trophy,
  TOURNAMENT_WON: Award,
  MATCH_COMPLETED: Swords,
  MATCH_WON: Award,
  LEVEL_UP: TrendingUp,
  RANK_CHANGED: Zap,
  ACHIEVEMENT: Award,
};

const EVENT_COLORS: Record<string, string> = {
  USER_FOLLOWED: 'text-accent',
  TOURNAMENT_CREATED: 'text-warning',
  TOURNAMENT_JOINED: 'text-success',
  TOURNAMENT_WON: 'text-warning',
  MATCH_COMPLETED: 'text-accent-cyan',
  MATCH_WON: 'text-success',
  LEVEL_UP: 'text-accent',
  RANK_CHANGED: 'text-warning',
  ACHIEVEMENT: 'text-accent',
};

export default function FeedPage() {
  const { user } = useAuth();
  const { subscribe, isConnected, onlineCount } = useSocket();
  const [events, setEvents] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<'personal' | 'global'>('personal');

  const fetchFeed = useCallback(async (mode: 'personal' | 'global', cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const fetchFn = mode === 'personal' ? feedApi.personal : feedApi.global;
      const result = await fetchFn(cursor);

      if (cursor) {
        setEvents((prev) => [...prev, ...result.data]);
      } else {
        setEvents(result.data);
      }
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [t, l] = await Promise.allSettled([
        tournamentsApi.list({ page: 1 }),
        usersApi.leaderboard(1, 1),
      ]);
      setStats({
        tournaments: t.status === 'fulfilled' ? (t.value as any)?.total || 0 : 0,
        players: l.status === 'fulfilled' ? (l.value as any)?.total || 0 : 0,
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchFeed(tab);
    fetchStats();
  }, [fetchFeed, fetchStats, tab]);

  useEffect(() => {
    const unsub = subscribe('feed:new_event', (data: any) => {
      setEvents((prev) => [data, ...prev]);
    });
    return unsub;
  }, [subscribe]);

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (error && !events.length) return <ErrorState message={error} onRetry={() => fetchFeed(tab)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Welcome back, <span className="text-accent">{user?.username}</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">Here&apos;s what&apos;s happening on MATZON</p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 text-xs text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {onlineCount} online
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Trophy className="w-5 h-5 text-accent" />, label: 'Tournaments', value: stats?.tournaments || 0 },
          { icon: <Users className="w-5 h-5 text-accent-cyan" />, label: 'Players', value: stats?.players || 0 },
          { icon: <TrendingUp className="w-5 h-5 text-success" />, label: 'Level', value: user?.level || 1 },
          { icon: <Zap className="w-5 h-5 text-warning" />, label: 'XP', value: user?.xp || 0 },
        ].map((s) => (
          <Card key={s.label} hover={false} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="font-display text-lg font-bold">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('personal')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${tab === 'personal' ? 'bg-accent text-white' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}
        >
          Following
        </button>
        <button
          onClick={() => setTab('global')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${tab === 'global' ? 'bg-accent text-white' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}
        >
          Global
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event: any) => {
            const Icon = EVENT_ICONS[event.type] || Zap;
            const color = EVENT_COLORS[event.type] || 'text-white/50';

            return (
              <Card key={event.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  {event.actor?.username ? (
                    <span className="text-accent text-sm font-bold">
                      {event.actor.username.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Icon className={`w-4 h-4 ${color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{event.actor?.username || 'System'}</span>
                    {event.actor?.level && (
                      <span className="text-[10px] text-white/25">Lv.{event.actor.level}</span>
                    )}
                    <span className="text-[10px] text-white/20 ml-auto shrink-0">{formatTime(event.createdAt)}</span>
                  </div>
                  <p className="text-sm text-white/70">{event.summary}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <Badge variant={event.type.includes('WON') ? 'success' : event.type.includes('FOLLOW') ? 'accent' : 'default'}>
                      {event.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                isLoading={loadingMore}
                onClick={() => fetchFeed(tab, nextCursor || undefined)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={tab === 'personal' ? '👥' : '🌍'}
          title={tab === 'personal' ? 'Your Feed is Empty' : 'No Activity Yet'}
          description={tab === 'personal' ? 'Follow other players to see their activity here' : 'Activity will appear as players compete'}
          action={
            tab === 'personal' ? (
              <Link href="/community"><Button size="sm">Find Players</Button></Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
