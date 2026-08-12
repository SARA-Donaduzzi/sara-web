import { api } from "@/lib/api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  CreateEvaluatorRequest,
  User,
} from "@/types";

export const authService = {
  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/login", data);
  },

  // Registro público (apenas alunos)
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/register", data);
  },

  // Buscar perfil do usuário logado
  async getProfile(): Promise<User> {
    return api.get<User>("/auth/profile");
  },

  // Alterar senha
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return api.put("/auth/change-password", data);
  },

  // Criar avaliador (apenas coordenadores)
  async createEvaluator(data: CreateEvaluatorRequest): Promise<User> {
    return api.post<User>("/auth/register-evaluator", data);
  },

  // Atualizar perfil
  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>("/auth/profile", data);
  },
};
