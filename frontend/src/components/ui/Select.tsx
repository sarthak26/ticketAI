import type { SelectHTMLAttributes } from 'react';

import { cn } from './cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = ({ className, children, ...props }: SelectProps) => (
  <select
    className={cn(
      'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800',
      'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200',
      className,
    )}
    {...props}
  >
    {children}
  </select>
);
