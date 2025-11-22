interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-zinc-600">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

