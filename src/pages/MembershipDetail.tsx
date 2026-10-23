import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { getMembership, createMembership, updateMembership } from '../data/store';
import { FormField } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { validateRequired, validatePositiveNumber } from '../validation';
import type { Membership } from '../types';
import toast from 'react-hot-toast';

export function MembershipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<Membership['type']>('basic');
  const [price, setPrice] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['']);

  useEffect(() => {
    if (!isNew && id) {
      getMembership(id).then((existing) => {
        if (!existing) {
          navigate('/memberships');
          return;
        }
        setName(existing.name);
        setType(existing.type);
        setPrice(String(existing.price));
        setDurationMonths(String(existing.durationMonths));
        setDescription(existing.description);
        setBenefits(existing.benefits.length > 0 ? existing.benefits : ['']);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [id, isNew, navigate]);

  const errors = {
    name: submitted ? validateRequired(name, 'Plan name') : '',
    price: submitted ? validatePositiveNumber(price, 'Price') : '',
    durationMonths: submitted ? validatePositiveNumber(durationMonths, 'Duration') : '',
    description: submitted ? validateRequired(description, 'Description') : '',
  };

  const isValid =
    !!name.trim() &&
    !validatePositiveNumber(price, 'Price') &&
    !validatePositiveNumber(durationMonths, 'Duration') &&
    !!description.trim();

  function addBenefit() {
    setBenefits((prev) => [...prev, '']);
  }

  function updateBenefit(index: number, value: string) {
    setBenefits((prev) => prev.map((b, i) => (i === index ? value : b)));
  }

  function removeBenefit(index: number) {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const filteredBenefits = benefits.filter((b) => b.trim() !== '');
      const payload = {
        name: name.trim(),
        type,
        price: parseFloat(price),
        durationMonths: parseInt(durationMonths, 10),
        description: description.trim(),
        benefits: filteredBenefits,
      };

      if (isNew) {
        const created = await createMembership(payload);
        toast.success('Membership plan created!');
        navigate(`/memberships/${created.id}`);
      } else if (id) {
        await updateMembership(id, payload);
        toast.success('Membership plan updated!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      toast.error('Failed to save membership plan.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading membership…" />;

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
            {isNew ? 'New Membership Plan' : name}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {isNew ? 'Define a new membership tier.' : 'Edit membership plan details.'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-surface rounded-card shadow-card p-6 space-y-5">
            <h3 className="text-base font-semibold text-ink border-b border-border pb-3">
              Plan Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Plan Name"
                required
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                error={errors.name}
                placeholder="Basic Plan"
              />
              <FormField
                as="select"
                label="Type"
                value={type}
                onChange={(e) => setType((e.target as HTMLSelectElement).value as Membership['type'])}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Monthly Price ($)"
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice((e.target as HTMLInputElement).value)}
                error={errors.price}
                placeholder="29.99"
                helper="Price in USD per month"
              />
              <FormField
                label="Duration (months)"
                required
                type="number"
                min="1"
                step="1"
                value={durationMonths}
                onChange={(e) => setDurationMonths((e.target as HTMLInputElement).value)}
                error={errors.durationMonths}
                placeholder="1"
              />
            </div>

            <FormField
              as="textarea"
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
              error={errors.description}
              placeholder="Brief description of this plan…"
            />

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                  Benefits
                </label>
                <button
                  type="button"
                  onClick={addBenefit}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
                >
                  <Plus size={13} />
                  Add benefit
                </button>
              </div>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}…`}
                      className="flex-1 px-3 py-2 rounded-btn border border-border text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-ink-muted"
                    />
                    {benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="p-2 text-ink-muted hover:text-danger rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
      </div>
    </div>
  );
}
