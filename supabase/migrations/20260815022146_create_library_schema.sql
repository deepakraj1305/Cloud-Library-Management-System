/*
# Cloud Library Management System — Schema

1. Overview
   A college mini-project library management system. Librarians manage a catalog
   of books, a roster of student members, and track which books are issued to whom
   and when they are returned. No authentication required (single-tenant, shared
   catalog) so the app is usable immediately.

2. New Tables
   - `books`: the library catalog. Columns:
       id (uuid PK), title, author, isbn (unique), category, total_copies,
       available_copies (kept in sync with loans), shelf_location, cover_color
       (for UI visual), created_at, updated_at.
   - `members`: registered library members (students/staff). Columns:
       id (uuid PK), name, email (unique), phone, roll_number, department,
       year_of_study, status (active/blocked), created_at.
   - `loans`: issuance records linking a book to a member. Columns:
       id (uuid PK), book_id (FK books), member_id (FK members),
       issue_date, due_date, return_date (nullable — null means still issued),
       status (issued/returned/overdue), created_at.

3. Security
   - RLS enabled on all three tables.
   - Policies allow anon + authenticated full CRUD (single-tenant shared catalog,
     no sign-in screen).

4. Important Notes
   - `available_copies` is denormalized for quick "is this book available" checks.
     It is managed by the application layer (decrement on issue, increment on return).
   - `due_date` defaults to 14 days after issue.
   - A partial index on `loans` where `return_date IS NULL` gives fast lookups of
     currently-issued books.
*/

-- ===== BOOKS =====
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE,
  category text NOT NULL DEFAULT 'General',
  total_copies integer NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
  available_copies integer NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  shelf_location text DEFAULT '',
  cover_color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_books" ON books;
CREATE POLICY "anon_select_books" ON books FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_books" ON books;
CREATE POLICY "anon_insert_books" ON books FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_books" ON books;
CREATE POLICY "anon_update_books" ON books FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_books" ON books;
CREATE POLICY "anon_delete_books" ON books FOR DELETE
  TO anon, authenticated USING (true);

-- ===== MEMBERS =====
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text DEFAULT '',
  roll_number text DEFAULT '',
  department text DEFAULT '',
  year_of_study text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE
  TO anon, authenticated USING (true);

-- ===== LOANS =====
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL DEFAULT (CURRENT_DATE + 14),
  return_date date,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','returned','overdue')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_loans" ON loans;
CREATE POLICY "anon_select_loans" ON loans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_loans" ON loans;
CREATE POLICY "anon_insert_loans" ON loans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_loans" ON loans;
CREATE POLICY "anon_update_loans" ON loans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_loans" ON loans;
CREATE POLICY "anon_delete_loans" ON loans FOR DELETE
  TO anon, authenticated USING (true);

-- Index for fast "currently issued" lookups
CREATE INDEX IF NOT EXISTS idx_loans_active ON loans (member_id, book_id) WHERE return_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_loans_due_date ON loans (due_date) WHERE return_date IS NULL;

-- ===== SEED DATA =====
INSERT INTO books (title, author, isbn, category, total_copies, available_copies, shelf_location, cover_color)
VALUES
  ('The Pragmatic Programmer', 'Hunt & Thomas', '9780201616224', 'Computer Science', 3, 3, 'A-12', '#3b82f6'),
  ('Clean Code', 'Robert C. Martin', '9780132350884', 'Computer Science', 2, 2, 'A-13', '#10b981'),
  ('Introduction to Algorithms', 'Cormen et al.', '9780262033848', 'Computer Science', 4, 4, 'A-14', '#f59e0b'),
  ('Operating System Concepts', 'Silberschatz', '9781118063330', 'Computer Science', 2, 2, 'A-15', '#ef4444'),
  ('Database System Concepts', 'Silberschatz', '9780073523323', 'Computer Science', 3, 3, 'A-16', '#8b5cf6'),
  ('Computer Networks', 'Tanenbaum', '9780132126953', 'Computer Science', 2, 2, 'A-17', '#06b6d4'),
  ('Artificial Intelligence', 'Russell & Norvig', '9780136042594', 'Computer Science', 2, 2, 'A-18', '#ec4899'),
  ('Discrete Mathematics', 'Rosen', '9780073383095', 'Mathematics', 3, 3, 'B-01', '#14b8a6'),
  ('Linear Algebra', 'Strang', '9780980232776', 'Mathematics', 2, 2, 'B-02', '#f97316'),
  ('The Selfish Gene', 'Richard Dawkins', '9780198575258', 'Biology', 1, 1, 'C-05', '#84cc16')
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO members (name, email, phone, roll_number, department, year_of_study, status)
VALUES
  ('Aarav Sharma', 'aarav.s@college.edu', '9876543210', 'CS21B001', 'Computer Science', '3rd Year', 'active'),
  ('Priya Patel', 'priya.p@college.edu', '9876543211', 'CS21B002', 'Computer Science', '3rd Year', 'active'),
  ('Rohan Verma', 'rohan.v@college.edu', '9876543212', 'EC21B015', 'Electronics', '2nd Year', 'active'),
  ('Sneha Reddy', 'sneha.r@college.edu', '9876543213', 'ME22B007', 'Mechanical', '1st Year', 'active'),
  ('Karthik Nair', 'karthik.n@college.edu', '9876543214', 'CS20B003', 'Computer Science', '4th Year', 'blocked')
ON CONFLICT (email) DO NOTHING;
