'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { matchesApi } from '@/lib/api';
import { Card, Badge, Button, CardSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { Swords, Filter, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'LIVE', label: 'Live' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function MatchesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async (p: number, s: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await matchesApi.list({ page: p, status: s || undefined });
      setData(result);
      setPage(p);
    } catch (err: any) {
      setError(err.message || 'Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(1, status); }, [fetch, status]);

  const matches = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Matches</h1>
        <p className="text-white/50 text-sm mt-1">{data?.total ? `${data.total} matches` : 'Live and recent matches'}</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-white/30 shrink-0" />
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${status === f.value ? 'bg-accent text-white' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={() => fetch(page, status)} /> : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : matches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m: any) => {
            const isMe = m.playerOne?.id === user?.id || m.playerTwo?.id === user?.id;
            const won = m.winner?.id === user?.id;
            return (
              <Card key={m.id} className={isMe ? 'border-accent/30' : ''}>
                {isMe && (
                  <div className="absolute top-3 right-3">
                    <Badge variant={won ? 'success' : m.status === 'COMPLETED' ? 'danger' : 'accent'}>
                      {won ? 'Won' : m.status === 'COMPLETED' ? 'Lost' : 'Your Match'}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  {m.status === 'LIVE' && <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
                  {m.status === 'SCHEDULED' && <Clock className="w-3.5 h-3.5 text-white/30" />}
                  {m.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                  <Badge variant={m.status === 'LIVE' ? 'danger' : m.status === 'SCHEDULED' ? 'accent' : m.status === 'COMPLETED' ? 'success' : 'default'}>
                    {m.status}
                  </Badge>
                  <span className="text-xs text-white/25 ml-auto">{m.game}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${m.winner?.id === m.playerOne?.id && m.status === 'COMPLETED' ? 'bg-success/20 text-success ring-2 ring-success/30' : 'bg-white/5 text-white/50'}`}>
                      {m.playerOne?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-medium">{m.playerOne?.username || 'TBD'}</span>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <Swords className="w-5 h-5 text-white/20 mb-1" />
                    {m.status === 'COMPLETED' ? (
                      <span className="text-lg font-display font-bold text-white/60">{m.scoreOne ?? 0} - {m.scoreTwo ?? 0}</span>
                    ) : m.status === 'LIVE' ? (
                      <span className="text-xs text-danger font-medium animate-pulse">LIVE</span>
                    ) : (
                      <span className="text-xs text-white/25">VS</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${m.winner?.id === m.playerTwo?.id && m.status === 'COMPLETED' ? 'bg-success/20 text-success ring-2 ring-success/30' : 'bg-white/5 text-white/50'}`}>
                      {m.playerTwo?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-medium">{m.playerTwo?.username || 'TBD'}</span>
                  </div>
                </div>
                {m.tournament && (
                  <div className="mt-4 pt-3 border-t border-border text-xs text-white/30">
                    {m.tournament.name}{m.round && ` — Round ${m.round}`}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="⚔️" title="No Matches Found" description={status ? 'Try a different filter' : 'Matches appear once tournaments begin'}
          action={status ? <Button variant="secondary" size="sm" onClick={() => setStatus('')}>Clear</Button> : undefined}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => fetch(page - 1, status)} disabled={page <= 1 || isLoading}><ChevronLeft className="w-4 h-4" /> Prev</Button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => fetch(page + 1, status)} disabled={page >= totalPages || isLoading}>Next <ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}
