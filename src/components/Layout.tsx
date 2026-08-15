import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Library,
  Menu,
  X,
} from 'lucide-react';

export type Page = 'dashboard' | 'books' | 'members' | 'circulation';

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'circulation', label: 'Circulation', icon: ArrowLeftRight },
];

export default function Layout({
  current,
  onNavigate,
  children,
}: {
  current: Page;
  onNavigate: (p: Page) => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [current]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
            <Library className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CloudLibrary</h1>
            <p className="text-xs text-slate-400">College Mini Project</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Built with React + Supabase
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {current === 'circulation' ? 'Issue / Return' : current}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white">
              LB
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {/* Close button for mobile menu when open */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed top-4 right-4 z-50 lg:hidden rounded-lg p-2 text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
