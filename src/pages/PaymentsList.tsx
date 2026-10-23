import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, Eye } from 'lucide-react';
import { getPayments, getMembers } from '../data/store';
import { Badge } from '../components/Badge';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatCurrency, formatDate, fullName } from '../utils/format';
import type { Payment, Member } from '../types';

function paymentStatusVariant(status: Payment['status']): 'success' | 'warning' | 'danger' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

function methodLabel(method: Payment['paymentMethod']): string {
  if (method === 'bank_transfer') return 'Bank Transfer';
  if (method === 'card') return 'Card';
  return 'Cash';
}

export function PaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Payment['status']>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | Payment['paymentMethod']>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allPayments, allMembers] = await Promise.all([getPayments(), getMembers()]);
      setPayments(allPayments);
      setMembers(allMembers);
      setIsLoading(false);
    }
    loadData();
  }, []);

  function getMemberName(memberId: string): string {
    const member = members.find((m) => m.id === memberId);
    return member ? fullName(member.firstName, member.lastName) : 'Unknown';
  }

  const filtered = payments.filter((payment) => {
    const memberName = getMemberName(payment.memberId).toLowerCase();
    const matchesSearch =
      memberName.includes(search.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingTotal = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} payment records`}
        actions={
          <button
            onClick={() => navigate('/payments/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Record Payment
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'text-success' },
          { label: 'Pending', value: formatCurrency(pendingTotal), color: 'text-warning' },
          { label: 'Total Payments', value: payments.length, color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-card shadow-card p-4">
            <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-2.5 flex-1">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by member or invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-surface border border-border rounded-btn px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
          className="bg-surface border border-border rounded-btn px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="all">All methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <DollarSign className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No payments found</p>
          <p className="text-sm text-ink-muted mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Invoice</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Member</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => navigate(`/payments/${payment.id}`)}
                    className="hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink">{payment.invoiceId}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{getMemberName(payment.memberId)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-ink">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatDate(payment.paymentDate)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{methodLabel(payment.paymentMethod)}</td>
                    <td className="px-5 py-3.5">
                      <Badge label={payment.status} variant={paymentStatusVariant(payment.status)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/payments/${payment.id}`); }}
                        className="p-1.5 rounded hover:bg-primary/10 text-ink-secondary hover:text-primary transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-canvas">
            <p className="text-xs text-ink-muted">Showing {filtered.length} of {payments.length} payments</p>
          </div>
        </div>
      )}
    </div>
  );
}
