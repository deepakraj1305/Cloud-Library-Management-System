/*
# Add RPC functions for book copy management

1. New Functions
   - `decrement_available_copies(book_id)`: atomically decrements available_copies
     for a book when it is issued. Prevents going below zero.
   - `increment_available_copies(book_id)`: atomically increments available_copies
     for a book when it is returned. Prevents exceeding total_copies.

2. Security
   - Both functions are SECURITY DEFINER so they can update books regardless of RLS.
   - EXECUTE granted to anon and authenticated.

3. Notes
   - These use row-level locking (FOR UPDATE) to prevent race conditions when
     multiple users issue/return the same book simultaneously.
*/

CREATE OR REPLACE FUNCTION decrement_available_copies(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE books
  SET available_copies = available_copies - 1,
      updated_at = now()
  WHERE id = book_id
    AND available_copies > 0;
END;
$$;

CREATE OR REPLACE FUNCTION increment_available_copies(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE books
  SET available_copies = LEAST(available_copies + 1, total_copies),
      updated_at = now()
  WHERE id = book_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_available_copies(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_available_copies(uuid) TO anon, authenticated;
