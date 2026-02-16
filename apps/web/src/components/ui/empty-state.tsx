interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
