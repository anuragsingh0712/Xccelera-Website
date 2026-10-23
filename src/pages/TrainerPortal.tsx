import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Plus, CalendarCheck } from 'lucide-react';
import {
  getTrainers,
  getWorkoutPlans,
  getAssignments,
  getMembers,
  getAttendance,
} from '../data/store';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, fullName } from '../utils/format';
import { currentUser } from '../auth/auth';
import type { Trainer, WorkoutPlan, Member, Attendance } from '../types';

export function TrainerPortal() {
  const navigate = useNavigate();
  const user = currentUser();

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [myPlans, setMyPlans] = useState<WorkoutPlan[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [allTrainers, allPlans, allAssignments, allMembers, allAttendance] = await Promise.all([
        getTrainers(),
        getWorkoutPlans(),
        getAssignments(),
        getMembers(),
        getAttendance(),
      ]);

      // Find trainer matching logged-in user email
      const myTrainer = allTrainers.find((t) => t.email === user?.email) ?? allTrainers[0];
      setTrainer(myTrainer ?? null);

      if (myTrainer) {
        const plans = allPlans.filter((p) => p.trainerId === myTrainer.id);
        setMyPlans(plans);

        // Find members assigned to any of my plans
        const planIds = plans.map((p) => p.id);
        const memberIds = [
          ...new Set(
            allAssignments
              .filter((a) => planIds.includes(a.workoutPlanId))
              .map((a) => a.memberId),
          ),
        ];
        const members = allMembers.filter((m) => memberIds.includes(m.id));
        setAssignedMembers(members);

        // Recent attendance for assigned members
        const recent = allAttendance
          .filter((a) => memberIds.includes(a.memberId))
          .slice(0, 10);
        setRecentAttendance(recent);
      }
      setIsLoading(false);
    }
    loadData();
  }, [user?.email]);

  if (isLoading) return <LoadingSpinner message="Loading your portal…" />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h2 font-bold text-ink">Trainer Portal</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Welcome back,{' '}
          {trainer ? fullName(trainer.firstName, trainer.lastName) : user?.name}!
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'My Plans', value: myPlans.length, color: 'text-primary', icon: <Dumbbell size={20} className="text-primary" /> },
          { label: 'Assigned Members', value: assignedMembers.length, color: 'text-success', icon: <Users size={20} className="text-success" /> },
          { label: 'Attendance Records', value: recentAttendance.length, color: 'text-accent', icon: <CalendarCheck size={20} className="text-accent" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-card shadow-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-canvas flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-secondary uppercase">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Workout plans */}
        <div className="bg-surface rounded-card shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Dumbbell size={16} className="text-primary" />
              My Workout Plans
            </h3>
            <button
              onClick={() => navigate('/workout-plans/new')}
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-btn transition-colors"
            >
              <Plus size={12} />
              New Plan
            </button>
          </div>
          {myPlans.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="mx-auto mb-2 text-ink-muted" size={28} />
              <p className="text-sm text-ink-muted">No workout plans yet.</p>
              <button
                onClick={() => navigate('/workout-plans/new')}
                className="mt-3 text-xs text-primary hover:text-primary-dark font-medium"
              >
                Create your first plan
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {myPlans.map((plan) => (
                <li
                  key={plan.id}
                  onClick={() => navigate(`/workout-plans/${plan.id}`)}
                  className="p-3 bg-canvas rounded-btn border border-border cursor-pointer hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ink text-sm">{plan.name}</p>
                      <p className="text-xs text-ink-secondary mt-0.5">{plan.frequency}</p>
                    </div>
                    <Badge
                      label={new Date() >= new Date(plan.startDate) && new Date() <= new Date(plan.endDate) ? 'Active' : 'Inactive'}
                      variant={new Date() >= new Date(plan.startDate) && new Date() <= new Date(plan.endDate) ? 'success' : 'neutral'}
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5">
                    {plan.exercises.length} exercises · {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => navigate('/workout-plans')}
            className="mt-4 w-full py-2 text-xs font-medium text-primary hover:text-primary-dark text-center"
          >
            View all plans →
          </button>
        </div>

        {/* Assigned members */}
        <div className="bg-surface rounded-card shadow-card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Users size={16} className="text-success" />
            Assigned Members ({assignedMembers.length})
          </h3>
          {assignedMembers.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">No members assigned yet.</p>
          ) : (
            <ul className="space-y-3">
              {assignedMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-canvas rounded-btn border border-border"
                >
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {member.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {fullName(member.firstName, member.lastName)}
                    </p>
                    <p className="text-xs text-ink-secondary">{member.email}</p>
                  </div>
                  <Badge
                    label={member.status}
                    variant={
                      member.status === 'active' ? 'success' : member.status === 'suspended' ? 'danger' : 'neutral'
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent attendance of assigned members */}
        <div className="bg-surface rounded-card shadow-card p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <CalendarCheck size={16} className="text-accent" />
            Recent Member Attendance
          </h3>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">No attendance records for your members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-canvas">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Member</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Date</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-ink-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAttendance.map((record) => {
                    const m = assignedMembers.find((mem) => mem.id === record.memberId);
                    return (
                      <tr key={record.id} className="hover:bg-canvas">
                        <td className="px-3 py-2.5 font-medium text-ink">
                          {m ? fullName(m.firstName, m.lastName) : record.memberId}
                        </td>
                        <td className="px-3 py-2.5 text-ink-secondary">{formatDate(record.date)}</td>
                        <td className="px-3 py-2.5">
                          <Badge
                            label={record.checkOutTime ? 'Completed' : 'In gym'}
                            variant={record.checkOutTime ? 'success' : 'info'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
