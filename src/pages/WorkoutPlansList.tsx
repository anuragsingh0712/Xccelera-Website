import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, Dumbbell } from 'lucide-react';
import { getWorkoutPlans, deleteWorkoutPlan, getTrainers } from '../data/store';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatDate, fullName } from '../utils/format';
import { currentRole } from '../auth/auth';
import type { WorkoutPlan, Trainer } from '../types';
import toast from 'react-hot-toast';

export function WorkoutPlansList() {
  const navigate = useNavigate();
  const role = currentRole();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutPlan | null>(null);

  async function loadData() {
    const [allPlans, allTrainers] = await Promise.all([getWorkoutPlans(), getTrainers()]);
    setPlans(allPlans);
    setTrainers(allTrainers);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getTrainerName(trainerId: string): string {
    const trainer = trainers.find((t) => t.id === trainerId);
    return trainer ? fullName(trainer.firstName, trainer.lastName) : 'Unknown';
  }

  const filtered = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.description.toLowerCase().includes(search.toLowerCase());
    const matchesTrainer = trainerFilter === 'all' || plan.trainerId === trainerFilter;
    return matchesSearch && matchesTrainer;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteWorkoutPlan(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);
    loadData();
  }

  const isActive = (plan: WorkoutPlan): boolean => {
    const now = new Date();
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    return now >= start && now <= end;
  };

  return (
    <div>
      <PageHeader
        title="Workout Plans"
        subtitle={`${plans.length} plans total`}
        actions={
          <button
            onClick={() => navigate('/workout-plans/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Create Plan
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-2.5 flex-1">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search plans…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full"
          />
        </div>
        {role === 'admin' && (
          <select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="bg-surface border border-border rounded-btn px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="all">All trainers</option>
            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {fullName(trainer.firstName, trainer.lastName)}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <Dumbbell className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No workout plans found</p>
          <button
            onClick={() => navigate('/workout-plans/new')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Plan Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Trainer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Frequency</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Exercises</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => navigate(`/workout-plans/${plan.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{plan.name}</p>
                      <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">{plan.description}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{getTrainerName(plan.trainerId)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{plan.frequency}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">
                      {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{plan.exercises.length}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={isActive(plan) ? 'Active' : 'Inactive'}
                        variant={isActive(plan) ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => navigate(`/workout-plans/${plan.id}`)}
                          className="p-1.5 rounded hover:bg-primary/10 text-ink-secondary hover:text-primary transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(plan)}
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
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete workout plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
