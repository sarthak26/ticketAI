import { LayoutDashboard, Lightbulb, LibraryBig, Settings, Ticket } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/ai-suggestions', label: 'AI Suggestions', icon: Lightbulb },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: LibraryBig },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
    <div className="px-3 pb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">TicketAI</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">Support Ops</h1>
    </div>
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  </aside>
);
