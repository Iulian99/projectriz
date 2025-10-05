// Interfețe pentru aplicație
export interface User {
  id: number;
  email: string;
  identifier: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  backgroundColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

export interface RegisterFormData {
  email: string;
  identifier: string;
  name: string;
  password: string;
  confirmPassword: string;
  department?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
}

export interface DailyReport {
  id: number;
  date: string;
  userId: number;
  tasksCompleted: string;
  tasksPlanned: string;
  challenges: string;
  achievements: string;
  notes?: string;
  moodRating: number;
  productivityRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportRequest {
  date: string;
  tasksCompleted: string;
  tasksPlanned: string;
  challenges: string;
  achievements: string;
  notes?: string;
  moodRating: number;
  productivityRating: number;
}

export type ActivityType =
  | "routine"
  | "project"
  | "meeting"
  | "training"
  | "other";
export type ActivityStatus = "completed" | "in-progress" | "pending";

export interface ActivityMetrics {
  quantity: number;
  complexity: "low" | "medium" | "high";
  timeSpent: number; // in minutes
}

export interface ITUsage {
  systemsUsed: string[];
  softwareUsed: string[];
}

export interface Activity {
  id: string;
  activityName: string;
  attributes: string[];
  baseAct: string;
  workName: string;
  inputDate: Date;
  outputDate: Date;
  metrics: ActivityMetrics;
  urgency: boolean;
  itUsage: ITUsage;
  activityType: ActivityType;
  observations?: string;
  userId: number;
  status: ActivityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateActivityRequest {
  activityName: string;
  attributes: string[];
  baseAct: string;
  workName: string;
  inputDate: Date;
  outputDate: Date;
  metrics: ActivityMetrics;
  urgency: boolean;
  itUsage: ITUsage;
  activityType: ActivityType;
  observations?: string;
}

export interface DashboardStats {
  totalReports: number;
  averageMood: number;
  averageProductivity: number;
  currentStreak: number;
  recentReports: DailyReport[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
