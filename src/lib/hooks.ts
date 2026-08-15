import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Book, Member, LoanWithRelations } from '@/lib/supabase';

export type DashboardStats = {
  totalBooks: number;
  totalMembers: number;
  issuedCount: number;
  overdueCount: number;
  availableCopies: number;
  totalCopies: number;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalMembers: 0,
    issuedCount: 0,
    overdueCount: 0,
    availableCopies: 0,
    totalCopies: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [booksRes, membersRes, loansRes] = await Promise.all([
      supabase.from('books').select('total_copies, available_copies'),
      supabase.from('members').select('id', { count: 'exact', head: true }),
      supabase
        .from('loans')
        .select('id, status, due_date, return_date')
        .is('return_date', null),
    ]);

    const totalCopies = (booksRes.data ?? []).reduce((s, b) => s + b.total_copies, 0);
    const availableCopies = (booksRes.data ?? []).reduce((s, b) => s + b.available_copies, 0);
    const today = new Date().toISOString().slice(0, 10);
    const overdueCount = (loansRes.data ?? []).filter((l) => l.due_date < today).length;

    setStats({
      totalBooks: booksRes.data?.length ?? 0,
      totalMembers: membersRes.count ?? 0,
      issuedCount: loansRes.data?.length ?? 0,
      overdueCount,
      availableCopies,
      totalCopies,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, refresh: fetch };
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });
    if (error) {
      console.error(error);
    }
    setBooks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addBook = useCallback(
    async (b: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'available_copies'>) => {
      return supabase.from('books').insert({ ...b, available_copies: b.total_copies });
    },
    []
  );

  const updateBook = useCallback(async (id: string, patch: Partial<Book>) => {
    return supabase.from('books').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    return supabase.from('books').delete().eq('id', id);
  }, []);

  return { books, loading, refresh: fetch, addBook, updateBook, deleteBook };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });
    if (error) console.error(error);
    setMembers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addMember = useCallback(
    async (m: Omit<Member, 'id' | 'created_at'>) => supabase.from('members').insert(m),
    []
  );
  const updateMember = useCallback(
    async (id: string, patch: Partial<Member>) => supabase.from('members').update(patch).eq('id', id),
    []
  );
  const deleteMember = useCallback(async (id: string) => supabase.from('members').delete().eq('id', id), []);

  return { members, loading, refresh: fetch, addMember, updateMember, deleteMember };
}

export function useLoans() {
  const [loans, setLoans] = useState<LoanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*, book:book_id(title, author, cover_color), member:member_id(name, roll_number, department)')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setLoans((data ?? []) as unknown as LoanWithRelations[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const issueBook = useCallback(async (bookId: string, memberId: string, dueDate: string) => {
    const { error } = await supabase.from('loans').insert({
      book_id: bookId,
      member_id: memberId,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: dueDate,
      status: 'issued',
    });
    if (error) return { error };
    await supabase.rpc('decrement_available_copies', { book_id: bookId });
    return { error: null };
  }, []);

  const returnBook = useCallback(async (loanId: string, bookId: string) => {
    const { error } = await supabase
      .from('loans')
      .update({ return_date: new Date().toISOString().slice(0, 10), status: 'returned' })
      .eq('id', loanId);
    if (error) return { error };
    await supabase.rpc('increment_available_copies', { book_id: bookId });
    return { error: null };
  }, []);

  return { loans, loading, refresh: fetch, issueBook, returnBook };
}
