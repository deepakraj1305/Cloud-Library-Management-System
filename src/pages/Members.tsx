import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Phone,
  X,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { useMembers } from '@/lib/hooks';
import type { Member } from '@/lib/supabase';
import Modal from '@/components/Modal';
import { toast } from '@/components/Toast';

const DEPARTMENTS = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil',
  'Electrical', 'Chemical', 'Information Technology', 'Biotechnology', 'Other',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

type FormState = {
  name: string;
  email: string;
  phone: string;
  roll_number: string;
  department: string;
  year_of_study: string;
  status: 'active' | 'blocked';
};

const emptyForm: FormState = {
  name: '',
  email: '',
  phone: '',
  roll_number: '',
  department: 'Computer Science',
  year_of_study: '1st Year',
  status: 'active',
};

export default function MembersPage() {
  const { members, loading, refresh, addMember, updateMember, deleteMember } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        m.roll_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setForm({
      name: member.name,
      email: member.email ?? '',
      phone: member.phone,
      roll_number: member.roll_number,
      department: member.department,
      year_of_study: member.year_of_study,
      status: member.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('Name is required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone,
      roll_number: form.roll_number,
      department: form.department,
      year_of_study: form.year_of_study,
      status: form.status,
    };
    if (editing) {
      const { error } = await updateMember(editing.id, payload);
      if (error) toast('Failed to update member', 'error');
      else toast('Member updated successfully');
    } else {
      const { error } = await addMember(payload);
      if (error) toast('Failed to add member', 'error');
      else toast('Member added successfully');
    }
    setSaving(false);
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await deleteMember(deleteId);
    if (error) toast('Failed to delete member', 'error');
    else toast('Member deleted successfully');
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
              placeholder="Search name, email, or roll number..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Member</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Roll No.</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Department</th>
                <th className="hidden px-4 py-3 font-semibold text-slate-600 lg:table-cell">Contact</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white">
                        {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.year_of_study}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.roll_number || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{member.department}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="space-y-0.5">
                      {member.email && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3" /> {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3" /> {member.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {member.status === 'active' ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <ShieldBan className="h-3 w-3" />
                      )}
                      {member.status === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(member)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(member.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No members found. Try adjusting your search or add a new member.</p>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Member' : 'Add New Member'}>
        <div className="space-y-4">
          <Field label="Name *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Aarav Sharma"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
                placeholder="aarav.s@college.edu"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-input"
                placeholder="9876543210"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Roll Number">
              <input
                value={form.roll_number}
                onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                className="form-input"
                placeholder="CS21B001"
              />
            </Field>
            <Field label="Department">
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="form-input"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year of Study">
              <select
                value={form.year_of_study}
                onChange={(e) => setForm({ ...form, year_of_study: e.target.value })}
                className="form-input"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'blocked' })}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </Field>
          </div>
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
              {saving ? 'Saving...' : editing ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Member" maxWidth="max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <X className="h-7 w-7 text-red-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Are you sure you want to delete this member? This action cannot be undone.
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
