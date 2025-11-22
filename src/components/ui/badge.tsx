import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "default" | "outline";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default"
          ? "bg-zinc-900 text-white"
          : "border border-zinc-200 text-zinc-600",
      )}
    >
      {label}
    </span>
  );
}

