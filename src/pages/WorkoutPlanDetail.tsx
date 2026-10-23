import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Dumbbell,
} from 'lucide-react';
import {
  getWorkoutPlan,
  createWorkoutPlan,
  updateWorkoutPlan,
  addExercise,
  removeExercise,
  getTrainers,
  getMembers,
  createAssignment,
} from '../data/store';
import { FormField } from '../components/FormField';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { validateRequired } from '../validation';
import { fullName } from '../utils/format';
import { currentRole, currentUser } from '../auth/auth';
import type { WorkoutPlan, Exercise, Trainer, Member } from '../types';
import toast from 'react-hot-toast';

interface NewExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  durationMinutes: string;
  notes: string;
}

const defaultExercise: NewExercise = {
  name: '',
  sets: '3',
  reps: '10',
  weight: '',
  durationMinutes: '',
  notes: '',
};

export function WorkoutPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const role = currentRole();
  const user = currentUser();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Exercise state
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState<NewExercise>(defaultExercise);
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Exercise | null>(null);

  // Assignment
  const [assignMemberId, setAssignMemberId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Form fields
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [frequency, setFrequency] = useState('3x per week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function loadData() {
      const [allTrainers, allMembers] = await Promise.all([getTrainers(), getMembers()]);
      setTrainers(allTrainers);
      setMembers(allMembers);

      if (!isNew && id) {
        const existing = await getWorkoutPlan(id);
        if (!existing) {
          navigate('/workout-plans');
          return;
        }
        setPlan(existing);
        setPlanName(existing.name);
        setDescription(existing.description);
        setTrainerId(existing.trainerId);
        setFrequency(existing.frequency);
        setStartDate(existing.startDate);
        setEndDate(existing.endDate);
      } else if (isNew && role === 'trainer' && user) {
        // Pre-fill trainer ID for trainer role
        const myTrainer = allTrainers.find((t) => t.email === user.email);
        if (myTrainer) setTrainerId(myTrainer.id);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, isNew, navigate, role, user]);

  const errors = {
    name: submitted ? validateRequired(planName, 'Plan name') : '',
    description: submitted ? validateRequired(description, 'Description') : '',
    trainerId: submitted ? validateRequired(trainerId, 'Trainer') : '',
    startDate: submitted ? validateRequired(startDate, 'Start date') : '',
    endDate: submitted ? validateRequired(endDate, 'End date') : '',
  };

  const isValid =
    !!planName.trim() &&
    !!description.trim() &&
    !!trainerId &&
    !!startDate &&
    !!endDate;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: planName.trim(),
        description: description.trim(),
        trainerId,
        frequency: frequency.trim(),
        startDate,
        endDate,
        exercises: plan?.exercises ?? [],
      };

      if (isNew) {
        const created = await createWorkoutPlan(payload);
        toast.success('Workout plan created!');
        navigate(`/workout-plans/${created.id}`);
      } else if (id) {
        const updated = await updateWorkoutPlan(id, payload);
        setPlan(updated);
        toast.success('Workout plan updated!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      toast.error('Failed to save workout plan.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddExercise() {
    setExerciseSubmitted(true);
    if (!newExercise.name.trim() || !plan) return;

    try {
      const updated = await addExercise(plan.id, {
        name: newExercise.name.trim(),
        sets: parseInt(newExercise.sets, 10) || 1,
        reps: parseInt(newExercise.reps, 10) || 1,
        weight: newExercise.weight ? parseFloat(newExercise.weight) : undefined,
        durationMinutes: newExercise.durationMinutes
          ? parseInt(newExercise.durationMinutes, 10)
          : undefined,
        notes: newExercise.notes.trim() || undefined,
        order: plan.exercises.length + 1,
      });
      setPlan(updated);
      setNewExercise(defaultExercise);
      setExerciseSubmitted(false);
      setShowExerciseForm(false);
      toast.success('Exercise added!');
    } catch {
      toast.error('Failed to add exercise.');
    }
  }

  async function handleRemoveExercise() {
    if (!removeTarget || !plan) return;
    try {
      const updated = await removeExercise(plan.id, removeTarget.id);
      setPlan(updated);
      setRemoveTarget(null);
      toast.success('Exercise removed.');
    } catch {
      toast.error('Failed to remove exercise.');
    }
  }

  async function handleAssign() {
    if (!assignMemberId || !plan) return;
    setIsAssigning(true);
    try {
      await createAssignment({
        memberId: assignMemberId,
        workoutPlanId: plan.id,
        assignedDate: new Date().toISOString().split('T')[0],
        completionStatus: 'assigned',
      });
      toast.success('Plan assigned to member!');
      setAssignMemberId('');
    } catch {
      toast.error('Failed to assign plan.');
    } finally {
      setIsAssigning(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading workout plan…" />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-btn hover:bg-border text-ink-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-h2 font-bold text-ink">
            {isNew ? 'New Workout Plan' : plan?.name ?? ''}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {isNew ? 'Create a new workout plan.' : 'Edit plan details and manage exercises.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-surface rounded-card shadow-card p-6 space-y-5">
              <h3 className="text-base font-semibold text-ink border-b border-border pb-3">
                Plan Information
              </h3>

              <FormField
                label="Plan Name"
                required
                value={planName}
                onChange={(e) => setPlanName((e.target as HTMLInputElement).value)}
                error={errors.name}
                placeholder="Beginner Strength Program"
              />

              <FormField
                as="textarea"
                label="Description"
                required
                value={description}
                onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                error={errors.description}
                placeholder="Brief overview of this workout plan…"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  as="select"
                  label="Trainer"
                  required
                  value={trainerId}
                  onChange={(e) => setTrainerId((e.target as HTMLSelectElement).value)}
                >
                  <option value="">— Select trainer —</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {fullName(trainer.firstName, trainer.lastName)}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Frequency"
                  value={frequency}
                  onChange={(e) => setFrequency((e.target as HTMLInputElement).value)}
                  placeholder="3x per week"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Start Date"
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate((e.target as HTMLInputElement).value)}
                  error={errors.startDate}
                />
                <FormField
                  label="End Date"
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate((e.target as HTMLInputElement).value)}
                  error={errors.endDate}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2.5 rounded-btn text-sm font-medium text-ink-secondary bg-canvas hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isSaving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={15} />
                  {isSaving ? 'Saving…' : isNew ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-btn">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-sm text-success font-medium">Plan updated successfully!</p>
                </div>
              )}
            </div>
          </form>

          {/* Exercises section — only for existing plans */}
          {!isNew && plan && (
            <div className="bg-surface rounded-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Dumbbell size={16} className="text-primary" />
                  Exercises ({plan.exercises.length})
                </h3>
                <button
                  onClick={() => setShowExerciseForm((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-btn transition-colors"
                >
                  <Plus size={13} />
                  Add Exercise
                </button>
              </div>

              {showExerciseForm && (
                <div className="mb-5 p-4 bg-canvas rounded-btn border border-border space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                        Exercise Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Barbell Squat"
                        className={[
                          'w-full px-3 py-2.5 rounded-btn border text-sm text-ink bg-surface',
                          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-ink-muted',
                          exerciseSubmitted && !newExercise.name.trim() ? 'border-danger' : 'border-border',
                        ].join(' ')}
                      />
                      {exerciseSubmitted && !newExercise.name.trim() && (
                        <p className="text-xs text-danger">Exercise name is required.</p>
                      )}
                    </div>

                    {[
                      { label: 'Sets', key: 'sets', type: 'number' },
                      { label: 'Reps', key: 'reps', type: 'number' },
                      { label: 'Weight (kg)', key: 'weight', type: 'number' },
                      { label: 'Duration (min)', key: 'durationMinutes', type: 'number' },
                    ].map(({ label, key, type }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                          {label}
                        </label>
                        <input
                          type={type}
                          min="0"
                          value={newExercise[key as keyof NewExercise]}
                          onChange={(e) =>
                            setNewExercise((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="w-full px-3 py-2.5 rounded-btn border border-border text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>
                    ))}

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={newExercise.notes}
                        onChange={(e) => setNewExercise((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Optional notes…"
                        className="w-full px-3 py-2.5 rounded-btn border border-border text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-ink-muted"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowExerciseForm(false); setExerciseSubmitted(false); }}
                      className="px-3 py-1.5 rounded-btn text-xs font-medium text-ink-secondary bg-surface hover:bg-border transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExercise}
                      className="px-3 py-1.5 rounded-btn text-xs font-semibold text-white bg-primary hover:bg-primary-dark transition-colors"
                    >
                      Add Exercise
                    </button>
                  </div>
                </div>
              )}

              {plan.exercises.length === 0 ? (
                <div className="text-center py-8 text-ink-muted">
                  <Dumbbell className="mx-auto mb-2" size={28} />
                  <p className="text-sm">No exercises yet. Add your first exercise above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-canvas">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">#</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Exercise</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Sets</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Reps</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Weight</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Dur.</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {plan.exercises.map((exercise, index) => (
                        <tr key={exercise.id} className="hover:bg-canvas">
                          <td className="px-3 py-2.5 text-ink-muted text-xs">{index + 1}</td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-ink">{exercise.name}</p>
                            {exercise.notes && (
                              <p className="text-xs text-ink-muted">{exercise.notes}</p>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center text-ink-secondary">{exercise.sets}</td>
                          <td className="px-3 py-2.5 text-center text-ink-secondary">{exercise.reps}</td>
                          <td className="px-3 py-2.5 text-center text-ink-secondary">
                            {exercise.weight ? `${exercise.weight}kg` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center text-ink-secondary">
                            {exercise.durationMinutes ? `${exercise.durationMinutes}m` : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => setRemoveTarget(exercise)}
                              className="p-1 rounded hover:bg-danger/10 text-ink-muted hover:text-danger transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!isNew && (
          <div className="space-y-6">
            {/* Assign to member */}
            <div className="bg-surface rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Assign to Member</h3>
              <div className="space-y-3">
                <select
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-btn border border-border text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">— Select member —</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {fullName(member.firstName, member.lastName)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!assignMemberId || isAssigning}
                  className="w-full py-2 rounded-btn text-xs font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAssigning ? 'Assigning…' : 'Assign Plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!removeTarget}
        title="Remove exercise"
        message={`Remove "${removeTarget?.name}" from this plan?`}
        confirmLabel="Remove"
        onConfirm={handleRemoveExercise}
        onCancel={() => setRemoveTarget(null)}
        variant="warning"
      />
    </div>
  );
}
