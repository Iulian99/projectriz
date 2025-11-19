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

export type ActivityType = "INDIVIDUALA" | "COLECTIVA";

export interface Activity {
  id: string;
  activityName: string;
  attributes: string[];
  baseAct: string;
  workName: string;
  inputDate: Date;
  outputDate: Date;
  entryReference: string;
  exitReference: string;
  mainActivities: number;
  relatedActivities: number;
  nonProductiveActivities: number;
  urgency: boolean;
  usesIT: boolean;
  itProgramName?: string;
  activityType: ActivityType;
  observations?: string;
  userId: number;
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
  entryReference: string;
  exitReference: string;
  mainActivities: number;
  relatedActivities: number;
  nonProductiveActivities: number;
  urgency: boolean;
  usesIT: boolean;
  itProgramName: string;
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
