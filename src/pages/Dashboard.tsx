import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, Library } from 'lucide-react';
import { useDashboardStats, useLoans } from '@/lib/hooks';
import type { LoanWithRelations } from '@/lib/supabase';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
  color: string;
  sublabel?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${color} opacity-10 transition-transform group-hover:scale-110`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();
  const { loans } = useLoans();

  const activeLoans = loans.filter((l) => !l.return_date);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = activeLoans.filter((l) => l.due_date < today);
  const recent = loans.slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 lg:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="absolute bottom-0 right-20 h-32 w-32 translate-y-8 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <Library className="h-8 w-8 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Welcome to CloudLibrary</h2>
          </div>
          <p className="mt-2 max-w-xl text-slate-300">
            Manage your college library's book catalog, member roster, and book
            issue/return tracking — all in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
              {stats.totalBooks} titles in catalog
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
              {stats.availableCopies} copies on shelf
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">
              {stats.issuedCount} currently issued
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Books" value={stats.totalBooks} icon={BookOpen} color="bg-blue-500" sublabel={`${stats.totalCopies} total copies`} />
        <StatCard label="Members" value={stats.totalMembers} icon={Users} color="bg-emerald-500" sublabel="Registered library members" />
        <StatCard label="Issued" value={stats.issuedCount} icon={ArrowLeftRight} color="bg-amber-500" sublabel="Books currently on loan" />
        <StatCard label="Overdue" value={stats.overdueCount} icon={AlertTriangle} color="bg-red-500" sublabel="Past due date" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-slate-400">No activity yet. Issue a book to get started.</p>
            )}
            {recent.map((loan: LoanWithRelations) => (
              <div key={loan.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: loan.book?.cover_color ?? '#3b82f6' }}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {loan.book?.title ?? 'Unknown'}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {loan.return_date ? 'Returned' : 'Issued'} by {loan.member?.name ?? 'Unknown'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    loan.return_date
                      ? 'bg-emerald-50 text-emerald-600'
                      : loan.due_date < today
                      ? 'bg-red-50 text-red-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {loan.return_date ? 'Returned' : loan.due_date < today ? 'Overdue' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Overdue Books</h3>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-4 space-y-3">
            {overdue.length === 0 && (
              <p className="text-sm text-slate-400">No overdue books. Everything is on track.</p>
            )}
            {overdue.map((loan: LoanWithRelations) => {
              const daysLate = Math.max(
                1,
                Math.ceil((new Date(today).getTime() - new Date(loan.due_date).getTime()) / 86400000)
              );
              return (
                <div key={loan.id} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {loan.book?.title ?? 'Unknown'}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {loan.member?.name} · Due {new Date(loan.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                    {daysLate}d late
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
