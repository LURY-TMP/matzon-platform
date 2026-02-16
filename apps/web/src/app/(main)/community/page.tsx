'use client';

import { useEffect, useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import { Card, Button, CardSkeleton, EmptyState, ErrorState, TrustBadge } from '@/components/ui';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CommunityPage() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersApi.leaderboard(p, 20);
      setData(result);
      setPage(p);
    } catch (err: any) {
      setError(err.message || 'Failed to load players');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(1); }, [fetch]);

  const players = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const filtered = search ? players.filter((p: any) => p.username?.toLowerCase().includes(search.toLowerCase())) : players;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Community</h1>
        <p className="text-white/50 text-sm mt-1">{data?.total ? `${data.total} players on MATZON` : 'Connect with players'}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-card border border-border rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {error ? <ErrorState message={error} onRetry={() => fetch(page)} /> : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p: any) => {
            const wins = p.profile?.wins || 0;
            const matches = p.profile?.matchesPlayed || 0;
            const wr = matches > 0 ? Math.round((wins / matches) * 100) : 0;
            return (
              <Card key={p.id} className="flex flex-col items-center text-center py-6">
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center text-lg font-bold text-accent mb-3">
                  {p.username?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-sm font-semibold mb-0.5">{p.username}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-white/30">Lv.{p.level}</span>
                  <TrustBadge level={p.trustLevel || 'NEW'} />
                </div>
                <div className="grid grid-cols-3 gap-3 w-full px-2">
                  <div><p className="font-display text-sm font-bold text-accent">{p.xp}</p><p className="text-[10px] text-white/30 uppercase">XP</p></div>
                  <div><p className="font-display text-sm font-bold text-success">{wins}</p><p className="text-[10px] text-white/30 uppercase">Wins</p></div>
                  <div><p className="font-display text-sm font-bold text-warning">{wr}%</p><p className="text-[10px] text-white/30 uppercase">WR</p></div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="👥" title={search ? 'No Players Found' : 'No Players Yet'} description={search ? 'Try different search' : 'Be the first to join'}
          action={search ? <Button variant="secondary" size="sm" onClick={() => setSearch('')}>Clear</Button> : undefined}
        />
      )}

      {totalPages > 1 && !search && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => fetch(page - 1)} disabled={page <= 1 || isLoading}><ChevronLeft className="w-4 h-4" /> Prev</Button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => fetch(page + 1)} disabled={page >= totalPages || isLoading}>Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}
