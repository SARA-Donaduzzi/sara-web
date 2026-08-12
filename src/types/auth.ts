import { UserRole } from ".";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isFromBpk?: boolean; // Atualizado para Biopark
  isActive: boolean;
  isFirstLogin?: boolean; // Flag para primeira senha
  createdAt: Date;
  updatedAt?: Date;
}

export interface StudentUser extends User {
  role: "STUDENT";
  articlesCount: number;
}

export interface EvaluatorUser extends User {
  role: "EVALUATOR";
  evaluationsCount: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  pagination?: Pagination;
}

export interface UserSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  isFirstLogin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isFromBpk?: boolean; // Biopark
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateEvaluatorRequest {
  name: string;
  email: string;
  temporaryPassword: string;
}
