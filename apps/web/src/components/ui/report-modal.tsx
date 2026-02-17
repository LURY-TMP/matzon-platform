'use client';

import { useState, FormEvent } from 'react';
import { reportsApi } from '@/lib/api';
import { Button } from './button';
import { X } from 'lucide-react';

interface ReportModalProps {
  targetUserId?: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  onClose: () => void;
}

const REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ABUSE', label: 'Abuse' },
  { value: 'CHEATING', label: 'Cheating' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportModal({ targetUserId, targetType, targetId, targetName, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setIsLoading(true);
    setError(null);

    try {
      await reportsApi.create({ targetUserId, targetType, targetId, reason, description: description || undefined });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Report {targetType.toLowerCase()}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {success ? (
          <div className="px-5 py-8 text-center">
            <p className="text-success font-medium">Report submitted</p>
            <p className="text-sm text-white/40 mt-1">Our team will review it shortly</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {targetName && <p className="text-sm text-white/50">Reporting: <span className="text-white font-medium">{targetName}</span></p>}

            {error && <div className="bg-danger/10 border border-danger/20 rounded-md px-3 py-2 text-sm text-danger">{error}</div>}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70">Reason</label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      reason === r.value
                        ? 'bg-accent text-white'
                        : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="desc" className="text-sm font-medium text-white/70">Details (optional)</label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional context..."
                rows={3}
                className="w-full bg-bg border border-border rounded-md px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={onClose} className="flex-1">Cancel</Button>
              <Button size="sm" type="submit" isLoading={isLoading} disabled={!reason} className="flex-1">Submit Report</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
