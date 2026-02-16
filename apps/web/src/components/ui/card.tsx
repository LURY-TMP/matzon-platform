import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-card rounded-lg border border-border p-5',
        hover && 'transition-all duration-300 hover:bg-bg-hover hover:border-border-solid',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
