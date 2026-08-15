import { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  BookOpen,
  Users,
  Search,
  Calendar,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useBooks, useMembers, useLoans } from '@/lib/hooks';
import type { Book, Member } from '@/lib/supabase';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

type Tab = 'issue' | 'active' | 'history';

export default function CirculationPage() {
  const { books, refresh: refreshBooks } = useBooks();
  const { members, refresh: refreshMembers } = useMembers();
  const { loans, loading, refresh: refreshLoans, issueBook, returnBook } = useLoans();

  const [tab, setTab] = useState<Tab>('issue');
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [issuing, setIssuing] = useState(false);
  const [returnTarget, setReturnTarget] = useState<{ loanId: string; bookId: string; title: string } | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const availableBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.available_copies > 0 &&
        (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
          b.author.toLowerCase().includes(bookSearch.toLowerCase()))
    );
  }, [books, bookSearch]);

  const activeMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.status === 'active' &&
        (m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.roll_number.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  }, [members, memberSearch]);

  const activeLoans = loans.filter((l) => !l.return_date);
  const returnedLoans = loans.filter((l) => l.return_date);

  const handleIssue = async () => {
    if (!selectedBook || !selectedMember) {
      toast('Select both a book and a member', 'error');
      return;
    }
    if (selectedMember.status === 'blocked') {
      toast('This member is blocked and cannot borrow books', 'error');
      return;
    }
    setIssuing(true);
    const { error } = await issueBook(selectedBook.id, selectedMember.id, dueDate);
    if (error) {
      toast('Failed to issue book', 'error');
    } else {
      toast(`"${selectedBook.title}" issued to ${selectedMember.name}`);
      setSelectedBook(null);
      setSelectedMember(null);
      refreshBooks();
      refreshLoans();
      setTab('active');
    }
    setIssuing(false);
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    const { error } = await returnBook(returnTarget.loanId, returnTarget.bookId);
    if (error) {
      toast('Failed to return book', 'error');
    } else {
      toast(`"${returnTarget.title}" returned successfully`);
      refreshBooks();
      refreshLoans();
    }
    setReturnTarget(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {([
          { id: 'issue', label: 'Issue Book', icon: ArrowLeftRight },
          { id: 'active', label: `Active Loans (${activeLoans.length})`, icon: BookOpen },
          { id: 'history', label: 'History', icon: RotateCcw },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Issue tab */}
      {tab === 'issue' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Book selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <BookOpen className="h-5 w-5 text-blue-500" /> Select Book
            </h3>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Search available books..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {availableBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                    selectedBook?.id === book.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: book.cover_color }}
                  >
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{book.title}</p>
                    <p className="truncate text-xs text-slate-400">{book.author}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-600">
                    {book.available_copies} avail.
                  </span>
                </button>
              ))}
              {availableBooks.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No available books found.</p>
              )}
            </div>
          </div>

          {/* Member selection + issue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <Users className="h-5 w-5 text-emerald-500" /> Select Member
            </h3>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search active members..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {activeMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                    selectedMember?.id === member.id
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{member.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {member.roll_number} · {member.department}
                    </p>
                  </div>
                </button>
              ))}
              {activeMembers.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No active members found.</p>
              )}
            </div>

            {/* Summary + issue button */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-600">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  min={today}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {selectedBook && selectedMember && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="truncate font-medium text-slate-700">{selectedBook.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate font-medium text-slate-700">{selectedMember.name}</span>
                </div>
              )}

              <button
                onClick={handleIssue}
                disabled={!selectedBook || !selectedMember || issuing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {issuing ? 'Issuing...' : 'Issue Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active loans tab */}
      {tab === 'active' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Book</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Member</th>
                  <th className="hidden px-4 py-3 font-semibold text-slate-600 sm:table-cell">Issued</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Due Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => {
                  const isOverdue = loan.due_date < today;
                  return (
                    <tr key={loan.id} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: loan.book?.cover_color ?? '#3b82f6' }}
                          >
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">{loan.book?.title ?? 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{loan.book?.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{loan.member?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{loan.member?.roll_number}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                        {new Date(loan.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            isOverdue
                              ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {new Date(loan.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            setReturnTarget({
                              loanId: loan.id,
                              bookId: loan.book_id,
                              title: loan.book?.title ?? 'this book',
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Return
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {activeLoans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No active loans. Issue a book to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Book</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Member</th>
                  <th className="hidden px-4 py-3 font-semibold text-slate-600 sm:table-cell">Issued</th>
                  <th className="hidden px-4 py-3 font-semibold text-slate-600 md:table-cell">Due</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Returned</th>
                </tr>
              </thead>
              <tbody>
                {returnedLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: loan.book?.cover_color ?? '#3b82f6' }}
                        >
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <p className="font-medium text-slate-700">{loan.book?.title ?? 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{loan.member?.name ?? 'Unknown'}</td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {new Date(loan.issue_date).toLocaleDateString()}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                      {new Date(loan.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        <RotateCcw className="h-3 w-3" />
                        {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {returnedLoans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RotateCcw className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No return history yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Return confirm */}
      <Modal open={!!returnTarget} onClose={() => setReturnTarget(null)} title="Return Book" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <RotateCcw className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Mark <span className="font-semibold text-slate-800">"{returnTarget?.title}"</span> as returned?
            The book will be available for issue again.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setReturnTarget(null)}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReturn}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Return Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
