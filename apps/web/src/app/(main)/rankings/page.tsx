'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usersApi } from '@/lib/api';
import { Card, Badge, Button, TableRowSkeleton, EmptyState, ErrorState, TrustBadge } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RankingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersApi.leaderboard(p, 20);
      setData(result);
      setPage(p);
    } catch (err: any) {
      setError(err.message || 'Failed to load rankings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(1); }, [fetch]);

  if (error) return <ErrorState message={error} onRetry={() => fetch(page)} />;

  const players = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Global Rankings</h1>
        <p className="text-white/50 text-sm mt-1">{data?.total ? `${data.total} players competing` : 'Player leaderboard'}</p>
      </div>

      <Card hover={false} className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_80px_80px_80px_80px] gap-4 px-5 py-3 border-b border-border text-xs text-white/30 uppercase tracking-wider">
          <span>Rank</span><span>Player</span><span className="text-right">Level</span><span className="text-right">XP</span><span className="text-right">Trust</span><span className="text-right">WR</span>
        </div>

        {isLoading ? (
          <div>{Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : players.length > 0 ? (
          <div>
            {players.map((p: any, i: number) => {
              const rank = (page - 1) * 20 + i + 1;
              const wins = p.profile?.wins || 0;
              const matches = p.profile?.matchesPlayed || 0;
              const wr = matches > 0 ? Math.round((wins / matches) * 100) : 0;
              const isMe = p.id === user?.id;

              return (
                <div key={p.id} className={`grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_80px_80px_80px_80px] gap-4 px-5 py-3.5 border-b border-border items-center ${isMe ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-white/[0.02]'}`}>
                  <div className="flex items-center justify-center">
                    {rank <= 3 ? <span className="text-lg">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span> : <span className="font-display text-sm font-bold text-white/30">{rank}</span>}
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank <= 3 ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/50'}`}>
                      {p.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{p.username}</span>
                        {isMe && <Badge variant="accent">You</Badge>}
                      </div>
                      <div className="md:hidden text-xs text-white/30 mt-0.5 flex items-center gap-2">
                        <span>Lv.{p.level}</span>
                        <span>{p.xp} XP</span>
                        <TrustBadge level={p.trustLevel || 'NEW'} />
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block text-right text-sm">{p.level}</div>
                  <div className="hidden md:block text-right text-sm font-display font-bold text-accent">{p.xp.toLocaleString()}</div>
                  <div className="hidden md:flex justify-end"><TrustBadge level={p.trustLevel || 'NEW'} /></div>
                  <div className="hidden md:flex justify-end"><Badge variant={wr >= 60 ? 'success' : wr >= 40 ? 'warning' : 'default'}>{wr}%</Badge></div>
                  <div className="md:hidden flex justify-end"><span className="font-display text-sm font-bold text-accent">{p.xp}</span></div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="🏆" title="No Rankings Yet" description="Rankings appear once players start competing" />
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => fetch(page - 1)} disabled={page <= 1 || isLoading}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => fetch(page + 1)} disabled={page >= totalPages || isLoading}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
