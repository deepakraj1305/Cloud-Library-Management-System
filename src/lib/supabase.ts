import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
  cover_color: string;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  roll_number: string;
  department: string;
  year_of_study: string;
  status: 'active' | 'blocked';
  created_at: string;
};

export type Loan = {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: 'issued' | 'returned' | 'overdue';
  created_at: string;
  book?: Pick<Book, 'title' | 'author' | 'cover_color'>;
  member?: Pick<Member, 'name' | 'roll_number' | 'department'>;
};

export type LoanWithRelations = Loan & {
  book: Pick<Book, 'title' | 'author' | 'cover_color'>;
  member: Pick<Member, 'name' | 'roll_number' | 'department'>;
};
