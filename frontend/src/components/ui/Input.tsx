import type { InputHTMLAttributes } from 'react';

import { cn } from './cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={cn(
      'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800',
      'placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200',
      className,
    )}
    {...props}
  />
);
