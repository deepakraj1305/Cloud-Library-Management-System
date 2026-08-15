import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  X,
} from 'lucide-react';
import { useBooks } from '@/lib/hooks';
import type { Book } from '@/lib/supabase';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

const COVER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

const CATEGORIES = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Electronics', 'Mechanical', 'Civil', 'Literature', 'History', 'General',
];

type FormState = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  shelf_location: string;
  cover_color: string;
};

const emptyForm: FormState = {
  title: '',
  author: '',
  isbn: '',
  category: 'General',
  total_copies: 1,
  shelf_location: '',
  cover_color: COVER_COLORS[0],
};

export default function BooksPage() {
  const { books, loading, refresh, addBook, updateBook, deleteBook } = useBooks();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        (b.isbn ?? '').includes(search);
      const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category));
    return ['All', ...Array.from(set)];
  }, [books]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? '',
      category: book.category,
      total_copies: book.total_copies,
      shelf_location: book.shelf_location,
      cover_color: book.cover_color,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.author.trim()) {
      toast('Title and author are required', 'error');
      return;
    }
    setSaving(true);
    if (editing) {
      const diff = form.total_copies - editing.total_copies;
      const newAvailable = Math.max(0, editing.available_copies + diff);
      const { error } = await updateBook(editing.id, {
        title: form.title,
        author: form.author,
        isbn: form.isbn || null,
        category: form.category,
        total_copies: form.total_copies,
        available_copies: newAvailable,
        shelf_location: form.shelf_location,
        cover_color: form.cover_color,
      });
      if (error) toast('Failed to update book', 'error');
      else toast('Book updated successfully');
    } else {
      const { error } = await addBook({
        title: form.title,
        author: form.author,
        isbn: form.isbn || null,
        category: form.category,
        total_copies: form.total_copies,
        shelf_location: form.shelf_location,
        cover_color: form.cover_color,
      });
      if (error) toast('Failed to add book', 'error');
      else toast('Book added successfully');
    }
    setSaving(false);
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteBook(deleteId);
    if (error) toast('Failed to delete book', 'error');
    else toast('Book deleted successfully');
    setDeleteId(null);
    refresh();
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
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, or ISBN..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Book
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((book) => (
          <div
            key={book.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Cover */}
            <div
              className="relative flex h-32 items-center justify-center"
              style={{ backgroundColor: book.cover_color }}
            >
              <BookOpen className="h-10 w-10 text-white/80" />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {book.category}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 font-bold text-slate-800">{book.title}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{book.author}</p>
              {book.isbn && <p className="mt-1 text-xs text-slate-400">ISBN: {book.isbn}</p>}

              <div className="mt-3 flex items-center gap-3 text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-medium ${
                    book.available_copies > 0
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {book.available_copies} / {book.total_copies} available
                </span>
                {book.shelf_location && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="h-3 w-3" /> {book.shelf_location}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => openEdit(book)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(book.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No books found. Try adjusting your search or add a new book.</p>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Book' : 'Add New Book'}>
        <div className="space-y-4">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
              placeholder="e.g. Introduction to Algorithms"
            />
          </Field>
          <Field label="Author *">
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="form-input"
              placeholder="e.g. Cormen et al."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISBN">
              <input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                className="form-input"
                placeholder="978-..."
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="form-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Copies">
              <input
                type="number"
                min={1}
                value={form.total_copies}
                onChange={(e) => setForm({ ...form, total_copies: Math.max(1, parseInt(e.target.value) || 1) })}
                className="form-input"
              />
            </Field>
            <Field label="Shelf Location">
              <input
                value={form.shelf_location}
                onChange={(e) => setForm({ ...form, shelf_location: e.target.value })}
                className="form-input"
                placeholder="e.g. A-12"
              />
            </Field>
          </div>
          <Field label="Cover Color">
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, cover_color: c })}
                  className={`h-8 w-8 rounded-lg transition ${form.cover_color === c ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Book" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Are you sure you want to delete this book? This action cannot be undone.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
