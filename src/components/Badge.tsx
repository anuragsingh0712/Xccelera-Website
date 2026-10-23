type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-primary/10 text-primary',
  neutral: 'bg-muted/30 text-ink-secondary',
  purple: 'bg-accent/10 text-accent',
};

export function Badge({ label, variant }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
