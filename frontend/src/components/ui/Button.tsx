import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

type Variant = 'default' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  default:
    'bg-[linear-gradient(90deg,var(--purple--dark),#6204b4)] text-white hover:brightness-110 shadow-soft',
  secondary: 'bg-white border border-purple-100 text-[#6204b4] hover:bg-[#f6ebff]',
  ghost: 'text-[#6204b4] hover:bg-[#f6ebff]',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

export const Button = ({ variant = 'default', className, children, ...props }: ButtonProps) => (
  <button
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6204b4]/50 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
