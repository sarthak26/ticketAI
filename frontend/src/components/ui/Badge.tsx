import { cn } from './cn';

type BadgeVariant = 'open' | 'in_progress' | 'resolved';

const dotColors: Record<BadgeVariant, string> = {
  open: 'bg-amber-400',
  in_progress: 'bg-indigo-400',
  resolved: 'bg-emerald-400',
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

export const Badge = ({ label, variant }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-dashed border-purple-300',
      'bg-[#f6ebff] px-2.5 py-1 text-xs font-medium text-[#6204b4] capitalize',
    )}
  >
    <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
    <span>{label.replace('_', ' ')}</span>
  </span>
);
