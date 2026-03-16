import { cn } from './cn';

type BadgeVariant = 'open' | 'in_progress' | 'resolved';

const variants: Record<BadgeVariant, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

export const Badge = ({ label, variant }: BadgeProps) => (
  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', variants[variant])}>
    {label.replace('_', ' ')}
  </span>
);
