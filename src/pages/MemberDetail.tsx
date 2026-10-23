import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import {
  getMember,
  createMember,
  updateMember,
  getMemberships,
  getAttendance,
  getPayments,
} from '../data/store';
import { FormField } from '../components/FormField';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatDateTime, formatCurrency, fullName } from '../utils/format';
import { validateEmail, validateName, validatePhone, validateRequired } from '../validation';
import type { Member, Membership, Attendance, Payment } from '../types';
import toast from 'react-hot-toast';

function paymentStatusVariant(status: Payment['status']): 'success' | 'warning' | 'danger' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

export function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [member, setMember] = useState<Member | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [membershipStartDate, setMembershipStartDate] = useState('');
  const [status, setStatus] = useState<Member['status']>('active');

  useEffect(() => {
    async function loadData() {
      const [allMemberships, allAttendance, allPayments] = await Promise.all([
        getMemberships(),
        getAttendance(),
        getPayments(),
      ]);
      setMemberships(allMemberships);

      if (!isNew && id) {
        const existing = await getMember(id);
        if (!existing) {
          navigate('/members');
          return;
        }
        setMember(existing);
        setFirstName(existing.firstName);
        setLastName(existing.lastName);
        setEmail(existing.email);
        setPhone(existing.phone);
        setDateOfBirth(existing.dateOfBirth);
        setAddress(existing.address);
        setMembershipId(existing.membershipId ?? '');
        setMembershipStartDate(existing.membershipStartDate ?? '');
        setStatus(existing.status);
        setAttendance(allAttendance.filter((a) => a.memberId === id));
        setPayments(allPayments.filter((p) => p.memberId === id));
      }
      setIsLoading(false);
    }
    loadData();
  }, [id, isNew, navigate]);

  // Compute membership end date automatically
  function computedEndDate(): string {
    if (!membershipId || !membershipStartDate) return '';
    const membership = memberships.find((m) => m.id === membershipId);
    if (!membership) return '';
    const start = new Date(membershipStartDate);
    if (isNaN(start.getTime())) return '';
    const end = new Date(start);
    end.setMonth(end.getMonth() + membership.durationMonths);
    return end.toISOString().split('T')[0];
  }

  const errors = {
    firstName: submitted ? validateName(firstName, 'First name') : '',
    lastName: submitted ? validateName(lastName, 'Last name') : '',
    email: submitted ? validateEmail(email) : '',
    phone: submitted ? validatePhone(phone) : '',
    dateOfBirth: submitted ? validateRequired(dateOfBirth, 'Date of birth') : '',
    address: submitted ? validateRequired(address, 'Address') : '',
  };

  const isValid = Object.values(errors).every((e) => e === '') &&
    !validateName(firstName, 'First name') &&
    !validateName(lastName, 'Last name') &&
    !validateEmail(email) &&
    !validatePhone(phone) &&
    !!dateOfBirth.trim() &&
    !!address.trim();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const endDate = computedEndDate();
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        address: address.trim(),
        membershipId: membershipId || undefined,
        membershipStartDate: membershipStartDate || undefined,
        membershipEndDate: endDate || undefined,
        status,
        joinDate: member?.joinDate ?? new Date().toISOString().split('T')[0],
      };

      if (isNew) {
        const created = await createMember(payload);
        toast.success('Member created successfully!');
        navigate(`/members/${created.id}`);
      } else if (id) {
        await updateMember(id, payload);
        toast.success('Member updated successfully!');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      toast.error('Failed to save member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading member…" />;

  const selectedMembership = memberships.find((m) => m.id === membershipId);
  const endDate = computedEndDate();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-btn hover:bg-border text-ink-secondary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-h2 font-bold text-ink">
            {isNew ? 'New Member' : fullName(member?.firstName ?? '', member?.lastName ?? '')}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {isNew ? 'Fill in the details below to register a new member.' : 'View and edit member profile.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-6">
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
                  placeholder="John"
                />
                <FormField
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                  error={errors.lastName}
                  placeholder="Smith"
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
                  placeholder="john@example.com"
                />
                <FormField
                  label="Phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                  error={errors.phone}
                  placeholder="+1 555-0100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Date of Birth"
                  required
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth((e.target as HTMLInputElement).value)}
                  error={errors.dateOfBirth}
                />
                <FormField
                  as="select"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus((e.target as HTMLSelectElement).value as Member['status'])}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </FormField>
              </div>

              <FormField
                label="Address"
                required
                value={address}
                onChange={(e) => setAddress((e.target as HTMLInputElement).value)}
                error={errors.address}
                placeholder="123 Main St, City, State ZIP"
              />

              <h3 className="text-base font-semibold text-ink border-b border-border pb-3 pt-2">
                Membership Assignment
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  as="select"
                  label="Membership Plan"
                  value={membershipId}
                  onChange={(e) => setMembershipId((e.target as HTMLSelectElement).value)}
                >
                  <option value="">— No membership —</option>
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (${m.price}/mo, {m.durationMonths} month
                      {m.durationMonths > 1 ? 's' : ''})
                    </option>
                  ))}
                </FormField>

                <FormField
                  label="Start Date"
                  type="date"
                  value={membershipStartDate}
                  onChange={(e) => setMembershipStartDate((e.target as HTMLInputElement).value)}
                  helper={
                    endDate
                      ? `End date: ${formatDate(endDate)}`
                      : 'End date calculated automatically'
                  }
                />
              </div>

              {selectedMembership && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-btn">
                  <p className="text-xs font-semibold text-primary mb-1">
                    {selectedMembership.name} — ${selectedMembership.price}/month
                  </p>
                  <p className="text-xs text-ink-secondary">{selectedMembership.description}</p>
                  <ul className="mt-2 space-y-1">
                    {selectedMembership.benefits.map((benefit) => (
                      <li key={benefit} className="text-xs text-ink-secondary flex items-center gap-1">
                        <CheckCircle size={12} className="text-success" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
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
                  {isSaving ? 'Saving…' : isNew ? 'Create Member' : 'Save Changes'}
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

        {/* Side panels (only for existing members) */}
        {!isNew && (
          <div className="space-y-6">
            {/* Attendance history */}
            <div className="bg-surface rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Attendance History</h3>
              {attendance.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-4">No attendance records.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {attendance.map((record) => (
                    <li key={record.id} className="flex items-center justify-between text-xs">
                      <span className="text-ink-secondary">{formatDate(record.date)}</span>
                      <span className="text-ink font-medium">{formatDateTime(record.checkInTime)}</span>
                      {record.checkOutTime ? (
                        <Badge label="Done" variant="success" />
                      ) : (
                        <Badge label="In gym" variant="info" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Payment history */}
            <div className="bg-surface rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Payment History</h3>
              {payments.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-4">No payment records.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center justify-between text-xs cursor-pointer hover:bg-canvas rounded px-1 py-1 transition-colors"
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <span className="text-ink font-medium">{formatCurrency(payment.amount)}</span>
                      <span className="text-ink-secondary">{formatDate(payment.paymentDate)}</span>
                      <Badge label={payment.status} variant={paymentStatusVariant(payment.status)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
