import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { getTrainer, createTrainer, updateTrainer, getWorkoutPlans } from '../data/store';
import { FormField } from '../components/FormField';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, fullName } from '../utils/format';
import { validateEmail, validateName, validatePhone, validateRequired } from '../validation';
import type { Trainer, WorkoutPlan } from '../types';
import toast from 'react-hot-toast';

export function TrainerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [certification, setCertification] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<Trainer['status']>('active');

  useEffect(() => {
    async function loadData() {
      const plans = await getWorkoutPlans();
      setWorkoutPlans(plans);

      if (!isNew && id) {
        const existing = await getTrainer(id);
        if (!existing) {
          navigate('/trainers');
          return;
        }
        setTrainer(existing);
        setFirstName(existing.firstName);
        setLastName(existing.lastName);
        setEmail(existing.email);
        setPhone(existing.phone);
        setSpecialization(existing.specialization);
        setCertification(existing.certification);
        setHireDate(existing.hireDate);
        setBio(existing.bio ?? '');
        setStatus(existing.status);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, isNew, navigate]);

  const errors = {
    firstName: submitted ? validateName(firstName, 'First name') : '',
    lastName: submitted ? validateName(lastName, 'Last name') : '',
    email: submitted ? validateEmail(email) : '',
    phone: submitted ? validatePhone(phone) : '',
    specialization: submitted ? validateRequired(specialization, 'Specialization') : '',
    certification: submitted ? validateRequired(certification, 'Certification') : '',
    hireDate: submitted ? validateRequired(hireDate, 'Hire date') : '',
  };

  const isValid =
    !validateName(firstName, 'First name') &&
    !validateName(lastName, 'Last name') &&
    !validateEmail(email) &&
    !validatePhone(phone) &&
    !!specialization.trim() &&
    !!certification.trim() &&
    !!hireDate.trim();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        certification: certification.trim(),
        hireDate,
        bio: bio.trim(),
        status,
      };

      if (isNew) {
        const created = await createTrainer(payload);
        toast.success('Trainer created successfully!');
        navigate(`/trainers/${created.id}`);
      } else if (id) {
        await updateTrainer(id, payload);
        toast.success('Trainer updated successfully!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      toast.error('Failed to save trainer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading trainer…" />;

  const trainerPlans = workoutPlans.filter(
    (plan) => !isNew && plan.trainerId === id,
  );

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
            {isNew ? 'New Trainer' : fullName(trainer?.firstName ?? '', trainer?.lastName ?? '')}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {isNew ? 'Register a new trainer.' : 'Edit trainer profile and details.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-surface rounded-card shadow-card p-6 space-y-5">
              <h3 className="text-base font-semibold text-ink border-b border-border pb-3">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
                  error={errors.firstName}
                  placeholder="Alex"
                />
                <FormField
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                  error={errors.lastName}
                  placeholder="Thompson"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                  error={errors.email}
                  placeholder="trainer@gymapp.com"
                />
                <FormField
                  label="Phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                  error={errors.phone}
                  placeholder="+1 555-0200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Specialization"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization((e.target as HTMLInputElement).value)}
                  error={errors.specialization}
                  placeholder="Strength Training"
                />
                <FormField
                  label="Certification"
                  required
                  value={certification}
                  onChange={(e) => setCertification((e.target as HTMLInputElement).value)}
                  error={errors.certification}
                  placeholder="NASM-CPT, CSCS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Hire Date"
                  required
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate((e.target as HTMLInputElement).value)}
                  error={errors.hireDate}
                />
                <FormField
                  as="select"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus((e.target as HTMLSelectElement).value as Trainer['status'])}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </FormField>
              </div>

              <FormField
                as="textarea"
                label="Bio"
                value={bio}
                onChange={(e) => setBio((e.target as HTMLTextAreaElement).value)}
                placeholder="Brief trainer biography…"
              />

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
                  {isSaving ? 'Saving…' : isNew ? 'Create Trainer' : 'Save Changes'}
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-btn">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-sm text-success font-medium">Changes saved successfully!</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar — workout plans */}
        {!isNew && (
          <div className="space-y-6">
            <div className="bg-surface rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Workout Plans</h3>
              {trainerPlans.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-ink-muted">No workout plans assigned.</p>
                  <button
                    onClick={() => navigate('/workout-plans/new')}
                    className="mt-3 text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Create a plan
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {trainerPlans.map((plan) => (
                    <li
                      key={plan.id}
                      onClick={() => navigate(`/workout-plans/${plan.id}`)}
                      className="p-3 bg-canvas rounded-btn cursor-pointer hover:bg-border transition-colors"
                    >
                      <p className="text-sm font-medium text-ink">{plan.name}</p>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        {plan.frequency} · {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick info card */}
            {trainer && (
              <div className="bg-surface rounded-card shadow-card p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Quick Info</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <dt className="text-ink-secondary">Status</dt>
                    <dd>
                      <Badge
                        label={trainer.status}
                        variant={trainer.status === 'active' ? 'success' : 'neutral'}
                      />
                    </dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-ink-secondary">Hired</dt>
                    <dd className="text-ink font-medium">{formatDate(trainer.hireDate)}</dd>
                  </div>
                  <div className="flex justify-between text-xs">
                    <dt className="text-ink-secondary">Plans</dt>
                    <dd className="text-ink font-medium">{trainerPlans.length}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
