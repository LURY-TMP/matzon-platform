'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { tournamentsApi, matchesApi, usersApi } from '@/lib/api';
import { Card, Badge, Button, CardSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { Trophy, Swords, TrendingUp, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [t, m, l] = await Promise.allSettled([
        tournamentsApi.list({ page: 1 }),
        matchesApi.list({ status: 'LIVE', page: 1 }),
        usersApi.leaderboard(1, 5),
      ]);
      setData({
        tournaments: t.status === 'fulfilled' ? t.value : { data: [], total: 0 },
        matches: m.status === 'fulfilled' ? m.value : { data: [], total: 0 },
        leaderboard: l.status === 'fulfilled' ? l.value : { data: [], total: 0 },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-white/5 rounded-md h-8 w-48" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchFeed} />;

  const tournaments = data?.tournaments?.data || [];
  const matches = data?.matches?.data || [];
  const topPlayers = data?.leaderboard?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Welcome back, <span className="text-accent">{user?.username}</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Here&apos;s what&apos;s happening on MATZON</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Trophy className="w-5 h-5 text-accent" />, label: 'Tournaments', value: data?.tournaments?.total || 0 },
          { icon: <Swords className="w-5 h-5 text-accent-cyan" />, label: 'Live', value: matches.length },
          { icon: <TrendingUp className="w-5 h-5 text-success" />, label: 'Level', value: user?.level || 1 },
          { icon: <Users className="w-5 h-5 text-warning" />, label: 'XP', value: user?.xp || 0 },
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

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Live Matches</h2>
          <Link href="/matches" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {matches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.slice(0, 4).map((match: any) => (
              <Card key={match.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent">
                    {match.playerOne?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{match.playerOne?.username}</span>
                </div>
                <Badge variant="danger">LIVE</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{match.playerTwo?.username}</span>
                  <div className="w-8 h-8 rounded-full bg-accent-cyan/15 flex items-center justify-center text-xs font-bold text-accent-cyan">
                    {match.playerTwo?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card hover={false}><p className="text-white/40 text-sm text-center py-4">No live matches right now</p></Card>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Recent Tournaments</h2>
          <Link href="/tournaments" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {tournaments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.slice(0, 6).map((t: any) => (
              <Link key={t.id} href={`/tournaments/${t.id}`}>
                <Card className="h-full">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={t.status === 'REGISTRATION' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                      {t.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-white/30">{t.game}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{t.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/40 mt-3">
                    <span>{t._count?.participants || 0}/{t.maxPlayers}</span>
                    {t.prizePool && <span className="text-accent">{t.prizePool}</span>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="🏆" title="No Tournaments Yet" description="Be the first to create one"
            action={<Link href="/tournaments/create"><Button size="sm">Create Tournament</Button></Link>}
          />
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Top Players</h2>
          <Link href="/rankings" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {topPlayers.length > 0 ? (
          <Card hover={false} className="divide-y divide-border">
            {topPlayers.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-4 px-2 py-3">
                <span className={`font-display text-sm font-bold w-6 text-center ${i === 0 ? 'text-warning' : i === 1 ? 'text-white/60' : i === 2 ? 'text-orange-400' : 'text-white/30'}`}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent">
                  {p.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{p.username}</span>
                  <span className="text-xs text-white/30 ml-2">Lv.{p.level}</span>
                </div>
                <span className="text-sm font-display font-bold text-accent">{p.xp} XP</span>
              </div>
            ))}
          </Card>
        ) : (
          <Card hover={false}><p className="text-white/40 text-sm text-center py-4">No rankings data yet</p></Card>
        )}
      </section>
    </div>
  );
}
