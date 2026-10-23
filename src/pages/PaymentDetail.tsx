import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, FileText } from 'lucide-react';
import {
  getPayment,
  createPayment,
  updatePaymentStatus,
  getMembers,
  getMemberships,
} from '../data/store';
import { FormField } from '../components/FormField';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency, formatDate, fullName } from '../utils/format';
import { validateRequired, validatePositiveNumber } from '../validation';
import type { Payment, Member, Membership } from '../types';
import toast from 'react-hot-toast';

function paymentStatusVariant(status: Payment['status']): 'success' | 'warning' | 'danger' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

export function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [payment, setPayment] = useState<Payment | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [memberId, setMemberId] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('card');
  const [status, setStatus] = useState<Payment['status']>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      const [allMembers, allMemberships] = await Promise.all([getMembers(), getMemberships()]);
      setMembers(allMembers);
      setMemberships(allMemberships);

      if (!isNew && id) {
        const existing = await getPayment(id);
        if (!existing) {
          navigate('/payments');
          return;
        }
        setPayment(existing);
        setMemberId(existing.memberId);
        setMembershipId(existing.membershipId ?? '');
        setAmount(String(existing.amount));
        setPaymentDate(existing.paymentDate);
        setPaymentMethod(existing.paymentMethod);
        setStatus(existing.status);
        setNotes(existing.notes ?? '');
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, isNew, navigate]);

  const errors = {
    memberId: submitted ? validateRequired(memberId, 'Member') : '',
    amount: submitted ? validatePositiveNumber(amount, 'Amount') : '',
    paymentDate: submitted ? validateRequired(paymentDate, 'Payment date') : '',
  };

  const isValid = !!memberId && !validatePositiveNumber(amount, 'Amount') && !!paymentDate;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      if (isNew) {
        // MOCK: Invoice ID generated locally — replace with server-side generation.
        const invoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        const created = await createPayment({
          memberId,
          membershipId: membershipId || undefined,
          amount: parseFloat(amount),
          paymentDate,
          paymentMethod,
          status,
          invoiceId,
          notes: notes.trim() || undefined,
        });
        toast.success(`Payment recorded! Invoice: ${created.invoiceId}`);
        navigate(`/payments/${created.id}`);
      } else if (id) {
        const updated = await updatePaymentStatus(id, status);
        setPayment(updated);
        toast.success('Payment status updated!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      toast.error('Failed to save payment.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading payment…" />;

  const memberName = payment
    ? fullName(
        members.find((m) => m.id === payment.memberId)?.firstName ?? '',
        members.find((m) => m.id === payment.memberId)?.lastName ?? '',
      )
    : '';

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
            {isNew ? 'Record Payment' : payment?.invoiceId ?? 'Payment Detail'}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {isNew ? 'Record a new payment transaction.' : `For ${memberName}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-surface rounded-card shadow-card p-6 space-y-5">
              <h3 className="text-base font-semibold text-ink border-b border-border pb-3">
                Payment Information
              </h3>

              {isNew ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      as="select"
                      label="Member"
                      required
                      value={memberId}
                      onChange={(e) => setMemberId((e.target as HTMLSelectElement).value)}
                    >
                      <option value="">— Select member —</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {fullName(member.firstName, member.lastName)}
                        </option>
                      ))}
                    </FormField>
                    <FormField
                      as="select"
                      label="Membership Plan"
                      value={membershipId}
                      onChange={(e) => setMembershipId((e.target as HTMLSelectElement).value)}
                    >
                      <option value="">— Optional —</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({formatCurrency(m.price)})
                        </option>
                      ))}
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Amount ($)"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount((e.target as HTMLInputElement).value)}
                      error={errors.amount}
                      placeholder="29.99"
                    />
                    <FormField
                      label="Payment Date"
                      required
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate((e.target as HTMLInputElement).value)}
                      error={errors.paymentDate}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      as="select"
                      label="Payment Method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod((e.target as HTMLSelectElement).value as Payment['paymentMethod'])}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </FormField>
                    <FormField
                      as="select"
                      label="Status"
                      value={status}
                      onChange={(e) => setStatus((e.target as HTMLSelectElement).value as Payment['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </FormField>
                  </div>

                  <FormField
                    as="textarea"
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                    placeholder="Optional payment notes…"
                  />
                </>
              ) : (
                /* Existing payment — only status is editable */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Member</p>
                      <p className="font-medium text-ink">{memberName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Invoice</p>
                      <p className="font-medium text-ink">{payment?.invoiceId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Amount</p>
                      <p className="font-bold text-xl text-ink">{formatCurrency(payment?.amount ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Date</p>
                      <p className="font-medium text-ink">{formatDate(payment?.paymentDate ?? '')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Method</p>
                      <p className="font-medium text-ink capitalize">
                        {payment?.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Current Status</p>
                      {payment && (
                        <Badge label={payment.status} variant={paymentStatusVariant(payment.status)} />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <FormField
                      as="select"
                      label="Update Status"
                      value={status}
                      onChange={(e) => setStatus((e.target as HTMLSelectElement).value as Payment['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </FormField>
                  </div>

                  {payment?.notes && (
                    <div className="p-3 bg-canvas rounded-btn border border-border">
                      <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Notes</p>
                      <p className="text-sm text-ink">{payment.notes}</p>
                    </div>
                  )}
                </div>
              )}

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
                  {isSaving ? 'Saving…' : isNew ? 'Record Payment' : 'Update Status'}
                </button>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-btn">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-sm text-success font-medium">Payment updated successfully!</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Invoice preview */}
        {!isNew && payment && (
          <div className="bg-surface rounded-card shadow-card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Invoice Preview
            </h3>
            <div className="p-4 bg-canvas rounded-btn border border-border text-xs space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-ink">{payment.invoiceId}</span>
                <Badge label={payment.status} variant={paymentStatusVariant(payment.status)} />
              </div>
              <hr className="border-border my-2" />
              <div className="flex justify-between">
                <span className="text-ink-secondary">Member:</span>
                <span className="text-ink font-medium">{memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Date:</span>
                <span className="text-ink">{formatDate(payment.paymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-secondary">Method:</span>
                <span className="text-ink capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              <hr className="border-border my-2" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-ink">Total</span>
                <span className="text-primary">{formatCurrency(payment.amount)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
