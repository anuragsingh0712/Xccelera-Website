import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, Users } from 'lucide-react';
import { getMembers, deleteMember } from '../data/store';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatDate, fullName } from '../utils/format';
import type { Member } from '../types';
import toast from 'react-hot-toast';

function statusVariant(status: Member['status']): 'success' | 'neutral' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'neutral';
  return 'danger';
}

export function MembersList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Member['status']>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  async function loadMembers() {
    const data = await getMembers();
    setMembers(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filtered = members.filter((member) => {
    const name = fullName(member.firstName, member.lastName).toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMember(deleteTarget.id);
    toast.success(`${fullName(deleteTarget.firstName, deleteTarget.lastName)} has been removed.`);
    setDeleteTarget(null);
    loadMembers();
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} registered members`}
        actions={
          <button
            onClick={() => navigate('/members/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Add Member
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-2.5 flex-1">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-surface border border-border rounded-btn px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <Users className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No members found</p>
          <p className="text-sm text-ink-muted mt-1">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add your first member to get started.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => navigate('/members/new')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Add Member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Joined
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {fullName(member.firstName, member.lastName)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{member.email}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{member.phone}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatDate(member.joinDate)}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={member.status} variant={statusVariant(member.status)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-ink-secondary hover:text-primary transition-colors"
                          title="Edit member"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="p-1.5 rounded hover:bg-danger/10 text-ink-secondary hover:text-danger transition-colors"
                          title="Delete member"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-canvas">
            <p className="text-xs text-ink-muted">
              Showing {filtered.length} of {members.length} members
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete member"
        message={`Are you sure you want to delete ${
          deleteTarget ? fullName(deleteTarget.firstName, deleteTarget.lastName) : ''
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
