import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { getMemberships, deleteMembership } from '../data/store';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatCurrency } from '../utils/format';
import type { Membership } from '../types';
import toast from 'react-hot-toast';

function typeVariant(type: Membership['type']): 'info' | 'warning' | 'purple' {
  if (type === 'basic') return 'info';
  if (type === 'standard') return 'warning';
  return 'purple';
}

export function MembershipsList() {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Membership | null>(null);

  async function loadMemberships() {
    const data = await getMemberships();
    setMemberships(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMemberships();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteMembership(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" membership plan removed.`);
    setDeleteTarget(null);
    loadMemberships();
  }

  return (
    <div>
      <PageHeader
        title="Membership Plans"
        subtitle={`${memberships.length} plans available`}
        actions={
          <button
            onClick={() => navigate('/memberships/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Add Plan
          </button>
        }
      />

      {isLoading ? (
        <SkeletonTable rows={3} />
      ) : memberships.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <CreditCard className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No membership plans yet</p>
          <button
            onClick={() => navigate('/memberships/new')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <>
          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="bg-surface rounded-card shadow-card p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge label={membership.type} variant={typeVariant(membership.type)} />
                    <h3 className="text-base font-bold text-ink mt-2">{membership.name}</h3>
                    <p className="text-xs text-ink-secondary mt-1">{membership.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-ink">
                    {formatCurrency(membership.price)}
                    <span className="text-sm font-normal text-ink-secondary">/mo</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {membership.durationMonths} month{membership.durationMonths > 1 ? 's' : ''} commitment
                  </p>
                </div>

                <ul className="space-y-1.5 flex-1 mb-5">
                  {membership.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-xs text-ink-secondary">
                      <CheckCircle size={13} className="text-success mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => navigate(`/memberships/${membership.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-btn text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(membership)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-btn text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table view */}
          <div className="bg-surface rounded-card shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-canvas">
              <h3 className="text-sm font-semibold text-ink">All Plans</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-canvas border-b border-border">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Type</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Price</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Duration</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {memberships.map((membership) => (
                    <tr
                      key={membership.id}
                      onClick={() => navigate(`/memberships/${membership.id}`)}
                      className="hover:bg-canvas cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-ink">{membership.name}</td>
                      <td className="px-5 py-3.5">
                        <Badge label={membership.type} variant={typeVariant(membership.type)} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-ink">
                        {formatCurrency(membership.price)}
                      </td>
                      <td className="px-5 py-3.5 text-ink-secondary">
                        {membership.durationMonths} month{membership.durationMonths > 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/memberships/${membership.id}`)}
                            className="p-1.5 rounded hover:bg-primary/10 text-ink-secondary hover:text-primary transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(membership)}
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
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete membership plan"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" plan? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
