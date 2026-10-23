import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CalendarCheck, DollarSign, Dumbbell } from 'lucide-react';
import {
  getMembers,
  getAttendance,
  getPayments,
  getWorkoutPlans,
  getAssignments,
  getMemberships,
} from '../data/store';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatTime, formatCurrency, fullName } from '../utils/format';
import { currentUser } from '../auth/auth';
import type { Member, Attendance, Payment, WorkoutPlan, Membership } from '../types';

export function MemberPortal() {
  const navigate = useNavigate();
  const user = currentUser();

  const [member, setMember] = useState<Member | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allMembers, allAttendance, allPayments, allPlans, allAssignments, allMemberships] =
        await Promise.all([
          getMembers(),
          getAttendance(),
          getPayments(),
          getWorkoutPlans(),
          getAssignments(),
          getMemberships(),
        ]);

      // Find member matching logged-in user email
      const myMember = allMembers.find((m) => m.email === user?.email) ?? allMembers[0];
      setMember(myMember ?? null);

      if (myMember) {
        const myMembership = myMember.membershipId
          ? allMemberships.find((ms) => ms.id === myMember.membershipId) ?? null
          : null;
        setMembership(myMembership);
        setAttendance(allAttendance.filter((a) => a.memberId === myMember.id).slice(0, 5));
        setPayments(allPayments.filter((p) => p.memberId === myMember.id));

        const myAssignments = allAssignments.filter((a) => a.memberId === myMember.id);
        const myPlans = allPlans.filter((plan) =>
          myAssignments.some((a) => a.workoutPlanId === plan.id),
        );
        setWorkoutPlans(myPlans);
      }
      setIsLoading(false);
    }
    loadData();
  }, [user?.email]);

  if (isLoading) return <LoadingSpinner message="Loading your profile…" />;

  const membershipDaysLeft = member?.membershipEndDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(member.membershipEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h2 font-bold text-ink">My Portal</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Welcome back, {member ? fullName(member.firstName, member.lastName) : user?.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-surface rounded-card shadow-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                {member?.firstName?.charAt(0).toUpperCase() ?? 'M'}
              </div>
              <div>
                <p className="font-semibold text-ink text-base">
                  {member ? fullName(member.firstName, member.lastName) : user?.name}
                </p>
                <p className="text-xs text-ink-secondary">{member?.email ?? user?.email}</p>
                <Badge
                  label={member?.status ?? 'active'}
                  variant={
                    member?.status === 'active'
                      ? 'success'
                      : member?.status === 'suspended'
                      ? 'danger'
                      : 'neutral'
                  }
                />
              </div>
            </div>
            <dl className="space-y-2 text-sm border-t border-border pt-3">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Phone</dt>
                <dd className="font-medium text-ink">{member?.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Joined</dt>
                <dd className="font-medium text-ink">{member ? formatDate(member.joinDate) : '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Membership card */}
          <div className="bg-surface rounded-card shadow-card p-6">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              Membership
            </h3>
            {membership ? (
              <div>
                <Badge
                  label={membership.type}
                  variant={
                    membership.type === 'premium'
                      ? 'purple'
                      : membership.type === 'standard'
                      ? 'warning'
                      : 'info'
                  }
                />
                <p className="font-bold text-xl text-ink mt-2">{membership.name}</p>
                <p className="text-xs text-ink-secondary mt-0.5">{membership.description}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-secondary">Expires</span>
                    <span className="font-medium text-ink">
                      {member?.membershipEndDate ? formatDate(member.membershipEndDate) : '—'}
                    </span>
                  </div>
                  {membershipDaysLeft !== null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">Days remaining</span>
                      <span
                        className={`font-semibold ${
                          membershipDaysLeft < 30 ? 'text-danger' : 'text-success'
                        }`}
                      >
                        {membershipDaysLeft} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No active membership.</p>
            )}
          </div>
        </div>

        {/* Center + Right column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Workout plans */}
          <div className="bg-surface rounded-card shadow-card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <Dumbbell size={16} className="text-primary" />
              My Workout Plans ({workoutPlans.length})
            </h3>
            {workoutPlans.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">No workout plans assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workoutPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => navigate(`/workout-plans/${plan.id}`)}
                    className="p-4 bg-canvas rounded-btn border border-border cursor-pointer hover:border-primary hover:shadow-sm transition-all"
                  >
                    <p className="font-medium text-ink text-sm">{plan.name}</p>
                    <p className="text-xs text-ink-secondary mt-0.5">{plan.frequency}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {plan.exercises.length} exercises · ends {formatDate(plan.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent attendance */}
          <div className="bg-surface rounded-card shadow-card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <CalendarCheck size={16} className="text-success" />
              Recent Attendance
            </h3>
            {attendance.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">No attendance records yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-canvas">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Date</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Check In</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Check Out</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-canvas">
                      <td className="px-3 py-2.5 text-ink-secondary">{formatDate(record.date)}</td>
                      <td className="px-3 py-2.5 text-ink">{formatTime(record.checkInTime)}</td>
                      <td className="px-3 py-2.5 text-ink-secondary">
                        {record.checkOutTime ? formatTime(record.checkOutTime) : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          label={record.checkOutTime ? 'Completed' : 'In gym'}
                          variant={record.checkOutTime ? 'success' : 'info'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Payments */}
          <div className="bg-surface rounded-card shadow-card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-warning" />
              Payment History
            </h3>
            {payments.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">No payment records yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-canvas">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Invoice</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Amount</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Date</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-canvas">
                      <td className="px-3 py-2.5 font-medium text-ink">{payment.invoiceId}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-ink">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-ink-secondary">{formatDate(payment.paymentDate)}</td>
                      <td className="px-3 py-2.5">
                        <Badge
                          label={payment.status}
                          variant={
                            payment.status === 'completed'
                              ? 'success'
                              : payment.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
