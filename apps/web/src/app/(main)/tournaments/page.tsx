'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { tournamentsApi } from '@/lib/api';
import { Card, Badge, Button, CardSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { Plus, Filter, ChevronLeft, ChevronRight, Calendar, Users, Trophy } from 'lucide-react';
import Link from 'next/link';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'REGISTRATION', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function TournamentsPage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetch = useCallback(async (p: number, s: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tournamentsApi.list({ page: p, status: s || undefined });
      setData(result);
      setPage(p);
    } catch (err: any) {
      setError(err.message || 'Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(1, status); }, [fetch, status]);

  async function handleJoin(id: string) {
    setJoiningId(id);
    try {
      await tournamentsApi.join(id);
      fetch(page, status);
    } catch (err: any) {
      alert(err.message || 'Failed to join');
    } finally {
      setJoiningId(null);
    }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const tournaments = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Tournaments</h1>
          <p className="text-white/50 text-sm mt-1">{data?.total ? `${data.total} tournaments` : 'Browse tournaments'}</p>
        </div>
        {isAuthenticated && (
          <Link href="/tournaments/create"><Button size="sm"><Plus className="w-4 h-4" /> Create</Button></Link>
        )}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : tournaments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t: any) => {
            const count = t._count?.participants || 0;
            const full = count >= t.maxPlayers;
            return (
              <Card key={t.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={t.status === 'REGISTRATION' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : t.status === 'CANCELLED' ? 'danger' : 'default'}>
                    {t.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-white/30">{t.format?.replace('_', ' ')}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{t.name}</h3>
                <p className="text-xs text-white/40 mb-4">{t.game}</p>
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /><span>{count}/{t.maxPlayers}</span></div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{fmtDate(t.startDate)}</span></div>
                  </div>
                  {t.prizePool && <div className="flex items-center gap-1.5 text-xs"><Trophy className="w-3.5 h-3.5 text-warning" /><span className="text-warning font-medium">{t.prizePool}</span></div>}
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-accent rounded-full h-1.5 transition-all" style={{ width: `${Math.min((count / t.maxPlayers) * 100, 100)}%` }} />
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/tournaments/${t.id}`} className="flex-1"><Button variant="secondary" size="sm" className="w-full">Details</Button></Link>
                    {t.status === 'REGISTRATION' && !full && isAuthenticated && (
                      <Button size="sm" className="flex-1" isLoading={joiningId === t.id} onClick={() => handleJoin(t.id)}>Join</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🏆" title="No Tournaments Found" description={status ? 'Try a different filter' : 'Be the first to create one'}
          action={status ? <Button variant="secondary" size="sm" onClick={() => setStatus('')}>Clear</Button> : isAuthenticated ? <Link href="/tournaments/create"><Button size="sm">Create</Button></Link> : undefined}
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
