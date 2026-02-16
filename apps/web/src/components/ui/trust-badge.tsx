import { cn } from '@/lib/cn';

interface TrustBadgeProps {
  level: string;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

const TRUST_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'New', color: 'text-white/40', bg: 'bg-white/5' },
  BASIC: { label: 'Basic', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  TRUSTED: { label: 'Trusted', color: 'text-success', bg: 'bg-success/10' },
  VETERAN: { label: 'Veteran', color: 'text-accent', bg: 'bg-accent/10' },
  ELITE: { label: 'Elite', color: 'text-warning', bg: 'bg-warning/10' },
};

export function TrustBadge({ level, score, showScore = false, size = 'sm' }: TrustBadgeProps) {
  const config = TRUST_CONFIG[level] || TRUST_CONFIG.NEW;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      config.bg, config.color,
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
    )}>
      {config.label}
      {showScore && score !== undefined && (
        <span className="opacity-60">({Math.round(score)})</span>
      )}
    </span>
  );
}
