// Core type definitions for the Gym Management System

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
  lastLogin?: string;
}

export type MemberStatus = 'active' | 'inactive' | 'suspended';

export interface Member {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  membershipId?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  status: MemberStatus;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TrainerStatus = 'active' | 'inactive';

export interface Trainer {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  certification: string;
  hireDate: string;
  status: TrainerStatus;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export type MembershipType = 'basic' | 'standard' | 'premium';

export interface Membership {
  id: string;
  name: string;
  type: MembershipType;
  price: number;
  durationMonths: number;
  benefits: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  workoutPlanId: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  durationMinutes?: number;
  notes?: string;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  trainerId: string;
  name: string;
  description: string;
  frequency: string;
  startDate: string;
  endDate: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberWorkoutAssignment {
  id: string;
  memberId: string;
  workoutPlanId: string;
  assignedDate: string;
  completionStatus: 'assigned' | 'in_progress' | 'completed';
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent';

export interface Attendance {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  duration?: number;
  status: AttendanceStatus;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: string;
  memberId: string;
  membershipId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  invoiceId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth token stored in localStorage
export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
