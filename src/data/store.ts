// Persistent localStorage-backed CRUD store for all entities.
// Every exported function is gated behind USE_MOCK so each can be flipped
// independently when a real backend endpoint is ready.

import apiClient from '../api/client';
import type {
  Member,
  Trainer,
  Membership,
  WorkoutPlan,
  Exercise,
  MemberWorkoutAssignment,
  Attendance,
  Payment,
} from '../types';
import {
  mockMembers,
  mockTrainers,
  mockMemberships,
  mockWorkoutPlans,
  mockAssignments,
  mockAttendance,
  mockPayments,
} from './mockData';

// ─── Key constants ───────────────────────────────────────────────────────────

const KEYS = {
  members: 'gym_members',
  trainers: 'gym_trainers',
  memberships: 'gym_memberships',
  workoutPlans: 'gym_workout_plans',
  assignments: 'gym_assignments',
  attendance: 'gym_attendance',
  payments: 'gym_payments',
} as const;

// ─── Generic seed helpers ────────────────────────────────────────────────────

function seed<T>(key: string, initial: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T[];
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all member records from localStorage (seeded from mockMembers).
function localGetMembers(): Member[] {
  return seed<Member>(KEYS.members, mockMembers);
}

// MOCK: Returns a single member by ID.
function localGetMember(id: string): Member | undefined {
  return localGetMembers().find((m) => m.id === id);
}

// MOCK: Creates a new member and persists to localStorage.
function localCreateMember(input: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Member {
  const all = localGetMembers();
  const now = new Date().toISOString();
  const member: Member = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  all.unshift(member);
  save(KEYS.members, all);
  return member;
}

// MOCK: Updates an existing member and persists to localStorage.
function localUpdateMember(id: string, input: Partial<Omit<Member, 'id' | 'createdAt'>>): Member {
  const all = localGetMembers();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Member not found');
  const updated: Member = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  all[index] = updated;
  save(KEYS.members, all);
  return updated;
}

// MOCK: Deletes a member by ID.
function localDeleteMember(id: string): void {
  const all = localGetMembers().filter((m) => m.id !== id);
  save(KEYS.members, all);
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_MEMBERS = true;

export async function getMembers(): Promise<Member[]> {
  if (USE_MOCK_MEMBERS) return localGetMembers();
  const res = await apiClient.get('/api/v1/members');
  return res.data as Member[];
}

export async function getMember(id: string): Promise<Member | undefined> {
  if (USE_MOCK_MEMBERS) return localGetMember(id);
  const res = await apiClient.get(`/api/v1/members/${id}`);
  return res.data as Member;
}

export async function createMember(input: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
  if (USE_MOCK_MEMBERS) return localCreateMember(input);
  const res = await apiClient.post('/api/v1/members', input);
  return res.data as Member;
}

export async function updateMember(id: string, input: Partial<Omit<Member, 'id' | 'createdAt'>>): Promise<Member> {
  if (USE_MOCK_MEMBERS) return localUpdateMember(id, input);
  const res = await apiClient.put(`/api/v1/members/${id}`, input);
  return res.data as Member;
}

export async function deleteMember(id: string): Promise<void> {
  if (USE_MOCK_MEMBERS) { localDeleteMember(id); return; }
  await apiClient.delete(`/api/v1/members/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAINERS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all trainer records from localStorage (seeded from mockTrainers).
function localGetTrainers(): Trainer[] {
  return seed<Trainer>(KEYS.trainers, mockTrainers);
}

function localGetTrainer(id: string): Trainer | undefined {
  return localGetTrainers().find((t) => t.id === id);
}

function localCreateTrainer(input: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>): Trainer {
  const all = localGetTrainers();
  const now = new Date().toISOString();
  const trainer: Trainer = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  all.unshift(trainer);
  save(KEYS.trainers, all);
  return trainer;
}

function localUpdateTrainer(id: string, input: Partial<Omit<Trainer, 'id' | 'createdAt'>>): Trainer {
  const all = localGetTrainers();
  const index = all.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Trainer not found');
  const updated: Trainer = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  all[index] = updated;
  save(KEYS.trainers, all);
  return updated;
}

function localDeleteTrainer(id: string): void {
  const all = localGetTrainers().filter((t) => t.id !== id);
  save(KEYS.trainers, all);
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_TRAINERS = true;

export async function getTrainers(): Promise<Trainer[]> {
  if (USE_MOCK_TRAINERS) return localGetTrainers();
  const res = await apiClient.get('/api/v1/trainers');
  return res.data as Trainer[];
}

export async function getTrainer(id: string): Promise<Trainer | undefined> {
  if (USE_MOCK_TRAINERS) return localGetTrainer(id);
  const res = await apiClient.get(`/api/v1/trainers/${id}`);
  return res.data as Trainer;
}

export async function createTrainer(input: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trainer> {
  if (USE_MOCK_TRAINERS) return localCreateTrainer(input);
  const res = await apiClient.post('/api/v1/trainers', input);
  return res.data as Trainer;
}

export async function updateTrainer(id: string, input: Partial<Omit<Trainer, 'id' | 'createdAt'>>): Promise<Trainer> {
  if (USE_MOCK_TRAINERS) return localUpdateTrainer(id, input);
  const res = await apiClient.put(`/api/v1/trainers/${id}`, input);
  return res.data as Trainer;
}

export async function deleteTrainer(id: string): Promise<void> {
  if (USE_MOCK_TRAINERS) { localDeleteTrainer(id); return; }
  await apiClient.delete(`/api/v1/trainers/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIPS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all membership tier records from localStorage (seeded from mockMemberships).
function localGetMemberships(): Membership[] {
  return seed<Membership>(KEYS.memberships, mockMemberships);
}

function localGetMembership(id: string): Membership | undefined {
  return localGetMemberships().find((m) => m.id === id);
}

function localCreateMembership(input: Omit<Membership, 'id' | 'createdAt' | 'updatedAt'>): Membership {
  const all = localGetMemberships();
  const now = new Date().toISOString();
  const membership: Membership = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  all.unshift(membership);
  save(KEYS.memberships, all);
  return membership;
}

function localUpdateMembership(id: string, input: Partial<Omit<Membership, 'id' | 'createdAt'>>): Membership {
  const all = localGetMemberships();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Membership not found');
  const updated: Membership = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  all[index] = updated;
  save(KEYS.memberships, all);
  return updated;
}

function localDeleteMembership(id: string): void {
  const all = localGetMemberships().filter((m) => m.id !== id);
  save(KEYS.memberships, all);
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_MEMBERSHIPS = true;

export async function getMemberships(): Promise<Membership[]> {
  if (USE_MOCK_MEMBERSHIPS) return localGetMemberships();
  const res = await apiClient.get('/api/v1/memberships');
  return res.data as Membership[];
}

export async function getMembership(id: string): Promise<Membership | undefined> {
  if (USE_MOCK_MEMBERSHIPS) return localGetMembership(id);
  const res = await apiClient.get(`/api/v1/memberships/${id}`);
  return res.data as Membership;
}

export async function createMembership(input: Omit<Membership, 'id' | 'createdAt' | 'updatedAt'>): Promise<Membership> {
  if (USE_MOCK_MEMBERSHIPS) return localCreateMembership(input);
  const res = await apiClient.post('/api/v1/memberships', input);
  return res.data as Membership;
}

export async function updateMembership(id: string, input: Partial<Omit<Membership, 'id' | 'createdAt'>>): Promise<Membership> {
  if (USE_MOCK_MEMBERSHIPS) return localUpdateMembership(id, input);
  const res = await apiClient.put(`/api/v1/memberships/${id}`, input);
  return res.data as Membership;
}

export async function deleteMembership(id: string): Promise<void> {
  if (USE_MOCK_MEMBERSHIPS) { localDeleteMembership(id); return; }
  await apiClient.delete(`/api/v1/memberships/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKOUT PLANS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all workout plan records from localStorage (seeded from mockWorkoutPlans).
function localGetWorkoutPlans(): WorkoutPlan[] {
  return seed<WorkoutPlan>(KEYS.workoutPlans, mockWorkoutPlans);
}

function localGetWorkoutPlan(id: string): WorkoutPlan | undefined {
  return localGetWorkoutPlans().find((w) => w.id === id);
}

function localCreateWorkoutPlan(input: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): WorkoutPlan {
  const all = localGetWorkoutPlans();
  const now = new Date().toISOString();
  const plan: WorkoutPlan = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  all.unshift(plan);
  save(KEYS.workoutPlans, all);
  return plan;
}

function localUpdateWorkoutPlan(id: string, input: Partial<Omit<WorkoutPlan, 'id' | 'createdAt'>>): WorkoutPlan {
  const all = localGetWorkoutPlans();
  const index = all.findIndex((w) => w.id === id);
  if (index === -1) throw new Error('Workout plan not found');
  const updated: WorkoutPlan = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  all[index] = updated;
  save(KEYS.workoutPlans, all);
  return updated;
}

function localDeleteWorkoutPlan(id: string): void {
  const all = localGetWorkoutPlans().filter((w) => w.id !== id);
  save(KEYS.workoutPlans, all);
}

// MOCK: Adds a new exercise to an existing workout plan in localStorage.
function localAddExercise(planId: string, exercise: Omit<Exercise, 'id' | 'workoutPlanId'>): WorkoutPlan {
  const all = localGetWorkoutPlans();
  const index = all.findIndex((w) => w.id === planId);
  if (index === -1) throw new Error('Workout plan not found');
  const newExercise: Exercise = { ...exercise, id: crypto.randomUUID(), workoutPlanId: planId };
  all[index] = { ...all[index], exercises: [...all[index].exercises, newExercise], updatedAt: new Date().toISOString() };
  save(KEYS.workoutPlans, all);
  return all[index];
}

// MOCK: Removes an exercise from a workout plan by exercise ID.
function localRemoveExercise(planId: string, exerciseId: string): WorkoutPlan {
  const all = localGetWorkoutPlans();
  const index = all.findIndex((w) => w.id === planId);
  if (index === -1) throw new Error('Workout plan not found');
  all[index] = {
    ...all[index],
    exercises: all[index].exercises.filter((e) => e.id !== exerciseId),
    updatedAt: new Date().toISOString(),
  };
  save(KEYS.workoutPlans, all);
  return all[index];
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_WORKOUT_PLANS = true;

export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  if (USE_MOCK_WORKOUT_PLANS) return localGetWorkoutPlans();
  const res = await apiClient.get('/api/v1/workout-plans');
  return res.data as WorkoutPlan[];
}

export async function getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
  if (USE_MOCK_WORKOUT_PLANS) return localGetWorkoutPlan(id);
  const res = await apiClient.get(`/api/v1/workout-plans/${id}`);
  return res.data as WorkoutPlan;
}

export async function createWorkoutPlan(input: Omit<WorkoutPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
  if (USE_MOCK_WORKOUT_PLANS) return localCreateWorkoutPlan(input);
  const res = await apiClient.post('/api/v1/workout-plans', input);
  return res.data as WorkoutPlan;
}

export async function updateWorkoutPlan(id: string, input: Partial<Omit<WorkoutPlan, 'id' | 'createdAt'>>): Promise<WorkoutPlan> {
  if (USE_MOCK_WORKOUT_PLANS) return localUpdateWorkoutPlan(id, input);
  const res = await apiClient.put(`/api/v1/workout-plans/${id}`, input);
  return res.data as WorkoutPlan;
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  if (USE_MOCK_WORKOUT_PLANS) { localDeleteWorkoutPlan(id); return; }
  await apiClient.delete(`/api/v1/workout-plans/${id}`);
}

export async function addExercise(planId: string, exercise: Omit<Exercise, 'id' | 'workoutPlanId'>): Promise<WorkoutPlan> {
  if (USE_MOCK_WORKOUT_PLANS) return localAddExercise(planId, exercise);
  const res = await apiClient.post(`/api/v1/workout-plans/${planId}/exercises`, exercise);
  return res.data as WorkoutPlan;
}

export async function removeExercise(planId: string, exerciseId: string): Promise<WorkoutPlan> {
  if (USE_MOCK_WORKOUT_PLANS) return localRemoveExercise(planId, exerciseId);
  const res = await apiClient.delete(`/api/v1/workout-plans/${planId}/exercises/${exerciseId}`);
  return res.data as WorkoutPlan;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER WORKOUT ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all workout assignments from localStorage.
function localGetAssignments(): MemberWorkoutAssignment[] {
  return seed<MemberWorkoutAssignment>(KEYS.assignments, mockAssignments);
}

function localCreateAssignment(input: Omit<MemberWorkoutAssignment, 'id'>): MemberWorkoutAssignment {
  const all = localGetAssignments();
  const assignment: MemberWorkoutAssignment = { ...input, id: crypto.randomUUID() };
  all.unshift(assignment);
  save(KEYS.assignments, all);
  return assignment;
}

function localDeleteAssignment(id: string): void {
  const all = localGetAssignments().filter((a) => a.id !== id);
  save(KEYS.assignments, all);
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_ASSIGNMENTS = true;

export async function getAssignments(): Promise<MemberWorkoutAssignment[]> {
  if (USE_MOCK_ASSIGNMENTS) return localGetAssignments();
  const res = await apiClient.get('/api/v1/assignments');
  return res.data as MemberWorkoutAssignment[];
}

export async function createAssignment(input: Omit<MemberWorkoutAssignment, 'id'>): Promise<MemberWorkoutAssignment> {
  if (USE_MOCK_ASSIGNMENTS) return localCreateAssignment(input);
  const res = await apiClient.post('/api/v1/assignments', input);
  return res.data as MemberWorkoutAssignment;
}

export async function deleteAssignment(id: string): Promise<void> {
  if (USE_MOCK_ASSIGNMENTS) { localDeleteAssignment(id); return; }
  await apiClient.delete(`/api/v1/assignments/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all attendance records from localStorage (seeded from mockAttendance).
function localGetAttendance(): Attendance[] {
  return seed<Attendance>(KEYS.attendance, mockAttendance);
}

function localCreateAttendance(input: Omit<Attendance, 'id'>): Attendance {
  const all = localGetAttendance();
  const record: Attendance = { ...input, id: crypto.randomUUID() };
  all.unshift(record);
  save(KEYS.attendance, all);
  return record;
}

function localCheckOut(id: string, checkOutTime: string, duration: number): Attendance {
  const all = localGetAttendance();
  const index = all.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Attendance record not found');
  all[index] = { ...all[index], checkOutTime, duration };
  save(KEYS.attendance, all);
  return all[index];
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_ATTENDANCE = true;

export async function getAttendance(): Promise<Attendance[]> {
  if (USE_MOCK_ATTENDANCE) return localGetAttendance();
  const res = await apiClient.get('/api/v1/attendance');
  return res.data as Attendance[];
}

export async function checkIn(input: Omit<Attendance, 'id'>): Promise<Attendance> {
  if (USE_MOCK_ATTENDANCE) return localCreateAttendance(input);
  const res = await apiClient.post('/api/v1/attendance/check-in', input);
  return res.data as Attendance;
}

export async function checkOut(id: string, checkOutTime: string, duration: number): Promise<Attendance> {
  if (USE_MOCK_ATTENDANCE) return localCheckOut(id, checkOutTime, duration);
  const res = await apiClient.post('/api/v1/attendance/check-out', { id, checkOutTime, duration });
  return res.data as Attendance;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

// MOCK: Returns all payment records from localStorage (seeded from mockPayments).
function localGetPayments(): Payment[] {
  return seed<Payment>(KEYS.payments, mockPayments);
}

function localGetPayment(id: string): Payment | undefined {
  return localGetPayments().find((p) => p.id === id);
}

function localCreatePayment(input: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
  const all = localGetPayments();
  const now = new Date().toISOString();
  const payment: Payment = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  all.unshift(payment);
  save(KEYS.payments, all);
  return payment;
}

function localUpdatePaymentStatus(id: string, status: Payment['status']): Payment {
  const all = localGetPayments();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Payment not found');
  all[index] = { ...all[index], status, updatedAt: new Date().toISOString() };
  save(KEYS.payments, all);
  return all[index];
}

// TODO(USE_MOCK): verify path + response shape against the real backend's OpenAPI schema before flipping this to false.
export const USE_MOCK_PAYMENTS = true;

export async function getPayments(): Promise<Payment[]> {
  if (USE_MOCK_PAYMENTS) return localGetPayments();
  const res = await apiClient.get('/api/v1/payments');
  return res.data as Payment[];
}

export async function getPayment(id: string): Promise<Payment | undefined> {
  if (USE_MOCK_PAYMENTS) return localGetPayment(id);
  const res = await apiClient.get(`/api/v1/payments/${id}`);
  return res.data as Payment;
}

export async function createPayment(input: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
  if (USE_MOCK_PAYMENTS) return localCreatePayment(input);
  const res = await apiClient.post('/api/v1/payments', input);
  return res.data as Payment;
}

export async function updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment> {
  if (USE_MOCK_PAYMENTS) return localUpdatePaymentStatus(id, status);
  const res = await apiClient.put(`/api/v1/payments/${id}`, { status });
  return res.data as Payment;
}
