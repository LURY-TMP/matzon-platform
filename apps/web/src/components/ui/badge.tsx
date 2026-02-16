import { cn } from '@/lib/cn';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  children: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  accent: 'bg-accent/15 text-accent',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
