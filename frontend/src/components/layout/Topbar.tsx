import { Search } from 'lucide-react';

import { Input } from '../ui/Input';

export const Topbar = () => (
  <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">AI Support Ticket Auto-Reply</h2>
        <p className="text-sm text-slate-500">Monitor tickets, suggestions, and support performance.</p>
      </div>
      <div className="relative hidden w-72 lg:block">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input placeholder="Quick search..." className="pl-8" />
      </div>
    </div>
  </header>
);
