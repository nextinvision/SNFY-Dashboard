import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>}
          {description && (
            <p className="text-sm text-zinc-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

