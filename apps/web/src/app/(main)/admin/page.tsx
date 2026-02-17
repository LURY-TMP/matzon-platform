'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { adminApi } from '@/lib/api';
import { Card, Badge, Button, TrustBadge, CardSkeleton, EmptyState, ErrorState } from '@/components/ui';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError(null);
    try {
      const [r, s, a] = await Promise.all([
        adminApi.pendingReports(),
        adminApi.reportStats(),
        adminApi.auditLogs(20),
      ]);
      setReports(r);
      setStats(s);
      setAuditLogs(Array.isArray(a) ? a : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/feed');
      return;
    }
    fetchData();
  }, [isAdmin, router, fetchData]);

  async function handleResolve(reportId: string, status: 'CONFIRMED' | 'REJECTED') {
    setResolvingId(reportId);
    try {
      await adminApi.resolveReport(reportId, { status });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  }

  if (!isAdmin) return null;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-accent" />
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-white/50 text-sm mt-1">Moderation & Audit Dashboard</p>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card hover={false} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
            <div><p className="font-display text-lg font-bold">{stats.pending}</p><p className="text-xs text-white/40">Pending</p></div>
          </Card>
          <Card hover={false} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-danger" /></div>
            <div><p className="font-display text-lg font-bold">{stats.confirmed}</p><p className="text-xs text-white/40">Confirmed</p></div>
          </Card>
          <Card hover={false} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><XCircle className="w-5 h-5 text-success" /></div>
            <div><p className="font-display text-lg font-bold">{stats.rejected}</p><p className="text-xs text-white/40">Rejected</p></div>
          </Card>
          <Card hover={false} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><FileText className="w-5 h-5 text-accent" /></div>
            <div><p className="font-display text-lg font-bold">{stats.total}</p><p className="text-xs text-white/40">Total</p></div>
          </Card>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> Pending Reports</h2>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
        ) : reports?.data?.length > 0 ? (
          <div className="space-y-3">
            {reports.data.map((r: any) => (
              <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">{r.reason}</Badge>
                    <Badge variant="default">{r.targetType}</Badge>
                    <span className="text-[10px] text-white/20">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/50">By: <span className="text-white">{r.reporter?.username}</span></span>
                    {r.reporter?.trustLevel && <TrustBadge level={r.reporter.trustLevel} />}
                    {r.targetUser && (
                      <>
                        <span className="text-white/30">→</span>
                        <span className="text-white/50">Target: <span className="text-white">{r.targetUser.username}</span></span>
                        <TrustBadge level={r.targetUser.trustLevel} />
                        <span className="text-xs text-white/25">Rep: {Math.round(r.targetUser.reputationScore)}</span>
                      </>
                    )}
                  </div>
                  {r.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{r.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={resolvingId === r.id}
                    onClick={() => handleResolve(r.id, 'CONFIRMED')}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Confirm
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={resolvingId === r.id}
                    onClick={() => handleResolve(r.id, 'REJECTED')}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon="✅" title="No Pending Reports" description="All reports have been reviewed" />
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Recent Audit Log</h2>
        {auditLogs.length > 0 ? (
          <Card hover={false} className="p-0 overflow-hidden">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-3 border-b border-border text-sm hover:bg-white/[0.02]">
                <Badge variant={
                  log.action.includes('BANNED') ? 'danger' :
                  log.action.includes('CONFIRMED') || log.action.includes('PENALTY') ? 'warning' :
                  log.action.includes('REINSTATED') ? 'success' : 'default'
                }>
                  {log.action.replace(/_/g, ' ')}
                </Badge>
                <span className="text-white/60">{log.actor?.username}</span>
                {log.targetId && <span className="text-xs text-white/25 truncate max-w-[120px]">→ {log.targetId}</span>}
                <span className="text-[10px] text-white/20 ml-auto shrink-0">
                  {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState icon="📋" title="No Audit Logs" description="Actions will appear here as moderation events occur" />
        )}
      </div>
    </div>
  );
}
