import { useEffect, useState } from 'react';
import { CalendarCheck, Search, LogIn, LogOut, Clock } from 'lucide-react';
import { getAttendance, checkIn, checkOut, getMembers } from '../data/store';
import { Badge } from '../components/Badge';
import { SkeletonTable } from '../components/LoadingSpinner';
import { PageHeader } from '../components/PageHeader';
import { formatDate, formatTime, formatDuration, fullName } from '../utils/format';
import type { Attendance, Member } from '../types';
import toast from 'react-hot-toast';

export function AttendanceTracking() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [checkInMemberId, setCheckInMemberId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    const [allRecords, allMembers] = await Promise.all([getAttendance(), getMembers()]);
    setRecords(allRecords);
    setMembers(allMembers);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getMemberName(memberId: string): string {
    const member = members.find((m) => m.id === memberId);
    return member ? fullName(member.firstName, member.lastName) : 'Unknown';
  }

  const filtered = records.filter((record) => {
    const matchesDate = !dateFilter || record.date === dateFilter;
    const memberName = getMemberName(record.memberId).toLowerCase();
    const matchesSearch = !search || memberName.includes(search.toLowerCase());
    return matchesDate && matchesSearch;
  });

  // Members who haven't checked in today
  const todayDate = new Date().toISOString().split('T')[0];
  const checkedInToday = records
    .filter((r) => r.date === todayDate)
    .map((r) => r.memberId);

  // Find member who is currently checked in (no checkout)
  const activeSession = records.find((r) => r.date === todayDate && !r.checkOutTime && r.memberId === checkInMemberId);

  async function handleCheckIn() {
    if (!checkInMemberId) {
      toast.error('Please select a member first.');
      return;
    }

    const alreadyIn = records.find(
      (r) => r.memberId === checkInMemberId && r.date === todayDate && !r.checkOutTime,
    );
    if (alreadyIn) {
      toast.error('This member is already checked in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      await checkIn({
        memberId: checkInMemberId,
        checkInTime: now,
        date: todayDate,
        status: 'present',
      });
      toast.success(`${getMemberName(checkInMemberId)} checked in!`);
      await loadData();
    } catch {
      toast.error('Failed to record check-in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCheckOut(record: Attendance) {
    setIsSubmitting(true);
    try {
      const now = new Date();
      const checkInTime = new Date(record.checkInTime);
      const duration = Math.round((now.getTime() - checkInTime.getTime()) / 60000);
      await checkOut(record.id, now.toISOString(), duration);
      toast.success(`${getMemberName(record.memberId)} checked out! Duration: ${formatDuration(duration)}`);
      await loadData();
    } catch {
      toast.error('Failed to record check-out.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const todayRecords = records.filter((r) => r.date === todayDate);
  const activeNow = records.filter((r) => r.date === todayDate && !r.checkOutTime);

  return (
    <div>
      <PageHeader
        title="Attendance Tracking"
        subtitle="Record and monitor member check-ins and check-outs"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today's Check-ins", value: todayRecords.length, color: 'bg-primary/10 text-primary' },
          { label: 'Currently In Gym', value: activeNow.length, color: 'bg-success/10 text-success' },
          { label: 'Total Records', value: records.length, color: 'bg-accent/10 text-accent' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-card shadow-card p-4">
            <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Check-in panel */}
      <div className="bg-surface rounded-card shadow-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
          <LogIn size={16} className="text-primary" />
          Record Attendance
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
              Select Member
            </label>
            <select
              value={checkInMemberId}
              onChange={(e) => setCheckInMemberId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-btn border border-border text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">— Select member —</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {fullName(member.firstName, member.lastName)}
                  {checkedInToday.includes(member.id) ? ' ✓ (checked in)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckIn}
              disabled={!checkInMemberId || isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn size={15} />
              Check In
            </button>
            {activeSession && (
              <button
                onClick={() => handleCheckOut(activeSession)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm font-semibold text-white bg-success hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <LogOut size={15} />
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active sessions */}
      {activeNow.length > 0 && (
        <div className="bg-surface rounded-card shadow-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Clock size={16} className="text-success" />
            Currently In Gym ({activeNow.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeNow.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-btn"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{getMemberName(record.memberId)}</p>
                  <p className="text-xs text-ink-secondary">
                    Checked in at {formatTime(record.checkInTime)}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckOut(record)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold text-white bg-success hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <LogOut size={13} />
                  Out
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-btn px-3 py-2.5 flex-1">
          <Search size={16} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by member name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-surface border border-border rounded-btn px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          onClick={() => setDateFilter('')}
          className="px-3 py-2.5 rounded-btn text-sm text-ink-secondary bg-surface border border-border hover:bg-canvas transition-colors"
        >
          All dates
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-card shadow-card py-16 text-center">
          <CalendarCheck className="mx-auto mb-3 text-ink-muted" size={32} />
          <p className="text-ink-secondary font-medium">No attendance records found</p>
          <p className="text-sm text-ink-muted mt-1">
            {dateFilter ? `No records for ${formatDate(dateFilter)}.` : 'No records match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas border-b border-border">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Check In</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Check Out</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-canvas transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink">{getMemberName(record.memberId)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatDate(record.date)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">{formatTime(record.checkInTime)}</td>
                    <td className="px-5 py-3.5 text-ink-secondary">
                      {record.checkOutTime ? formatTime(record.checkOutTime) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">
                      {record.duration ? formatDuration(record.duration) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        label={record.checkOutTime ? 'Completed' : 'In gym'}
                        variant={record.checkOutTime ? 'success' : 'info'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-canvas">
            <p className="text-xs text-ink-muted">Showing {filtered.length} records</p>
          </div>
        </div>
      )}
    </div>
  );
}
