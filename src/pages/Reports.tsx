import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Download } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getMembers, getPayments, getAttendance } from '../data/store';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatCurrency } from '../utils/format';
import type { Member, Payment, Attendance } from '../types';

// MOCK: Chart aggregations computed client-side from seeded mock data.
// Replace with real aggregation endpoints when backend is available.

const MEMBERSHIP_COLORS = ['#0066CC', '#FF9900', '#5856D6'];

export function Reports() {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'overview' | 'attendance' | 'revenue' | 'membership'>('overview');

  useEffect(() => {
    async function loadData() {
      const [allMembers, allPayments, allAttendance] = await Promise.all([
        getMembers(),
        getPayments(),
        getAttendance(),
      ]);
      setMembers(allMembers);
      setPayments(allPayments);
      setAttendance(allAttendance);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Membership type distribution
  const membershipDistribution = [
    { name: 'Basic', value: members.filter((m) => m.membershipId === 'ms1').length },
    { name: 'Standard', value: members.filter((m) => m.membershipId === 'ms2').length },
    { name: 'Premium', value: members.filter((m) => m.membershipId === 'ms3').length },
  ];

  // Revenue by month (MOCK aggregation)
  // MOCK: Monthly grouping computed from seeded payment dates.
  const revenueByMonth = (() => {
    const grouped: Record<string, number> = {};
    payments
      .filter((p) => p.status === 'completed')
      .forEach((p) => {
        const month = p.paymentDate.slice(0, 7);
        grouped[month] = (grouped[month] ?? 0) + p.amount;
      });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        revenue: parseFloat(revenue.toFixed(2)),
      }));
  })();

  // Attendance by date (MOCK aggregation)
  // MOCK: Daily grouping computed from seeded attendance dates.
  const attendanceByDate = (() => {
    const grouped: Record<string, number> = {};
    attendance.forEach((a) => {
      grouped[a.date] = (grouped[a.date] ?? 0) + 1;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }));
  })();

  // Status stats
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Gym-wide performance metrics and insights"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium text-ink-secondary bg-surface border border-border hover:bg-canvas transition-colors">
            <Download size={15} />
            Export
          </button>
        }
      />

      {/* Tab navigation */}
      <div className="flex gap-1 bg-surface rounded-card shadow-card p-1 mb-6 w-fit">
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'attendance', label: 'Attendance' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'membership', label: 'Membership' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={[
              'px-4 py-2 rounded-btn text-sm font-medium transition-colors',
              activeReport === tab.key
                ? 'bg-primary text-white'
                : 'text-ink-secondary hover:bg-canvas',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : (
        <>
          {activeReport === 'overview' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Total Members', value: members.length, color: 'text-primary' },
                  { label: 'Active Members', value: activeMembers, color: 'text-success' },
                  { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-warning' },
                  { label: 'Attendance Records', value: attendance.length, color: 'text-accent' },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-surface rounded-card shadow-card p-5">
                    <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wide mb-2">
                      {kpi.label}
                    </p>
                    <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-surface rounded-card shadow-card p-5">
                  <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    Revenue Trend (6 months)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#666666' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#666666' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2.5} dot={{ r: 4, fill: '#0066CC' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-surface rounded-card shadow-card p-5">
                  <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                    <BarChart2 size={16} className="text-success" />
                    Membership Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={membershipDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {membershipDistribution.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={MEMBERSHIP_COLORS[index % MEMBERSHIP_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'attendance' && (
            <div className="bg-surface rounded-card shadow-card p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">Daily Attendance (Last 7 days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00AA44" radius={[4, 4, 0, 0]} name="Check-ins" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { label: 'Total Records', value: attendance.length },
                  { label: 'Today', value: attendance.filter((a) => a.date === new Date().toISOString().split('T')[0]).length },
                  { label: 'Completed Sessions', value: attendance.filter((a) => a.checkOutTime).length },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-ink-secondary mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'revenue' && (
            <div className="bg-surface rounded-card shadow-card p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#666666' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0066CC" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
                  {
                    label: 'Pending',
                    value: formatCurrency(payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)),
                  },
                  { label: 'Payments', value: payments.filter((p) => p.status === 'completed').length },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-ink-secondary mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === 'membership' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-surface rounded-card shadow-card p-6">
                  <h3 className="text-sm font-semibold text-ink mb-4">Membership Distribution</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={membershipDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {membershipDistribution.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={MEMBERSHIP_COLORS[index % MEMBERSHIP_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-surface rounded-card shadow-card p-6">
                  <h3 className="text-sm font-semibold text-ink mb-4">Member Status Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Active', value: members.filter((m) => m.status === 'active').length, color: 'bg-success' },
                      { label: 'Inactive', value: members.filter((m) => m.status === 'inactive').length, color: 'bg-muted' },
                      { label: 'Suspended', value: members.filter((m) => m.status === 'suspended').length, color: 'bg-danger' },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-ink-secondary">{bar.label}</span>
                          <span className="font-medium text-ink">{bar.value}</span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bar.color} rounded-full`}
                            style={{ width: `${members.length ? (bar.value / members.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
