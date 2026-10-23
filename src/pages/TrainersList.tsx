import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, UserCheck } from 'lucide-react';
import { getTrainers, deleteTrainer } from '../data/store';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatDate, fullName } from '../utils/format';
import type { Trainer } from '../types';
import toast from 'react-hot-toast';

export function TrainersList() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Trainer['status']>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);

  async function loadTrainers() {
    const data = await getTrainers();
    setTrainers(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadTrainers();
  }, []);

  const filtered = trainers.filter((trainer) => {
    const name = fullName(trainer.firstName, trainer.lastName).toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      trainer.email.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteTrainer(deleteTarget.id);
    toast.success(`${fullName(deleteTarget.firstName, deleteTarget.lastName)} has been removed.`);
    setDeleteTarget(null);
    loadTrainers();
  }

  return (
    <div>
      <PageHeader
        title="Trainers"
        subtitle={`${trainers.length} registered trainers`}
        actions={
          <button
            onClick={() => navigate('/trainers/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Add Trainer
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-2.5 flex-1">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization…"
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
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <UserCheck className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No trainers found</p>
          <p className="text-sm text-ink-muted mt-1">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add your first trainer to get started.'}
          </p>
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
                    Specialization
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Certification
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                    Hired
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
                {filtered.map((trainer) => (
                  <tr
                    key={trainer.id}
                    onClick={() => navigate(`/trainers/${trainer.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-ink">
                          {fullName(trainer.firstName, trainer.lastName)}
                        </p>
                        <p className="text-xs text-ink-secondary">{trainer.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{trainer.specialization}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{trainer.certification}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatDate(trainer.hireDate)}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={trainer.status}
                        variant={trainer.status === 'active' ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/trainers/${trainer.id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-ink-secondary hover:text-primary transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(trainer)}
                          className="p-1.5 rounded hover:bg-danger/10 text-ink-secondary hover:text-danger transition-colors"
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
              Showing {filtered.length} of {trainers.length} trainers
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete trainer"
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
