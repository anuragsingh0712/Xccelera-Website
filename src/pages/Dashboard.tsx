import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CreditCard,
  DollarSign,
  TrendingUp,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { StatsCard } from '../components/StatsCard';
import { SkeletonTable } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { getMembers } from '../data/store';
import { getPayments } from '../data/store';
import { getAttendance } from '../data/store';
import { formatCurrency, formatDate, fullName } from '../utils/format';
import type { Member, Payment } from '../types';

// MOCK: Monthly revenue chart data — replace with real aggregation from the API.
const mockRevenueData = [
  { month: 'Aug', revenue: 2800 },
  { month: 'Sep', revenue: 3200 },
  { month: 'Oct', revenue: 2950 },
  { month: 'Nov', revenue: 3600 },
  { month: 'Dec', revenue: 4100 },
  { month: 'Jan', revenue: 3850 },
];

// MOCK: Weekly attendance chart data — replace with real aggregation from the API.
const mockAttendanceData = [
  { day: 'Mon', count: 28 },
  { day: 'Tue', count: 35 },
  { day: 'Wed', count: 42 },
  { day: 'Thu', count: 38 },
  { day: 'Fri', count: 30 },
  { day: 'Sat', count: 55 },
  { day: 'Sun', count: 20 },
];

function memberStatusVariant(status: Member['status']) {
  if (status === 'active') return 'success';
  if (status === 'inactive') return 'neutral';
  return 'danger';
}

function paymentStatusVariant(status: Payment['status']) {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allMembers, allPayments, allAttendance] = await Promise.all([
        getMembers(),
        getPayments(),
        getAttendance(),
      ]);
      setMembers(allMembers);
      setPayments(allPayments);
      setAttendanceCount(allAttendance.length);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const activeMembers = members.filter((m) => m.status === 'active').length;
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;

  const recentMembers = members.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h2 font-bold text-ink">Dashboard</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Welcome back! Here's what's happening at your gym today.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="bg-surface rounded-card shadow-card p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Members"
            value={members.length}
            subtitle={`${activeMembers} active`}
            icon={<Users size={22} className="text-primary" />}
            iconBg="bg-primary/10"
            trend={{ value: '12% this month', positive: true }}
          />
          <StatsCard
            title="Active Memberships"
            value={activeMembers}
            subtitle="Paid & current"
            icon={<CreditCard size={22} className="text-success" />}
            iconBg="bg-success/10"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle="All completed payments"
            icon={<DollarSign size={22} className="text-warning" />}
            iconBg="bg-warning/10"
            trend={{ value: '8% vs last month', positive: true }}
          />
          <StatsCard
            title="Attendance Records"
            value={attendanceCount}
            subtitle={`${pendingPayments} payments pending`}
            icon={<CalendarCheck size={22} className="text-accent" />}
            iconBg="bg-accent/10"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="bg-surface rounded-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-ink">Monthly Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2.5} dot={{ r: 4, fill: '#0066CC' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance chart */}
        <div className="bg-surface rounded-card shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={18} className="text-success" />
            <h3 className="text-sm font-semibold text-ink">Weekly Attendance</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#00AA44" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent members */}
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-ink">Recent Members</h3>
            </div>
            <button
              onClick={() => navigate('/members')}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {isLoading ? (
            <SkeletonTable rows={4} />
          ) : recentMembers.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">No members yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Name</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Joined</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-ink">
                      {fullName(member.firstName, member.lastName)}
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">{formatDate(member.joinDate)}</td>
                    <td className="px-5 py-3">
                      <Badge label={member.status} variant={memberStatusVariant(member.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent payments */}
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-warning" />
              <h3 className="text-sm font-semibold text-ink">Recent Payments</h3>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {isLoading ? (
            <SkeletonTable rows={4} />
          ) : recentPayments.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted">No payments yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-canvas">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Invoice</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Amount</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-ink">{payment.invoiceId}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={payment.status} variant={paymentStatusVariant(payment.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-surface rounded-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <UserCheck size={16} className="text-primary" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Member', to: '/members/new', color: 'bg-primary/10 text-primary hover:bg-primary/20' },
            { label: 'Add Trainer', to: '/trainers/new', color: 'bg-success/10 text-success hover:bg-success/20' },
            { label: 'Record Payment', to: '/payments/new', color: 'bg-warning/10 text-warning hover:bg-warning/20' },
            { label: 'Log Attendance', to: '/attendance', color: 'bg-accent/10 text-accent hover:bg-accent/20' },
          ].map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className={`py-3 px-4 rounded-btn text-sm font-semibold transition-colors ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
