"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from "@/types";
import { ROUTES } from "@/lib/constants";
import { isTokenExpired, getRedirectPath } from "@/lib/auth";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Carrega o usuário do token ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = Cookies.get("sara_token");

        if (!token || isTokenExpired(token)) {
          setIsLoading(false);
          return;
        }

        // Busca o perfil do usuário
        const profile = await api.get<User>("/auth/profile");
        setUser(profile);
      } catch (error) {
        Cookies.remove("sara_token");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/auth/login", data);
        const { token, user: userData, isFirstLogin } = response;

        // IMPORTANTE: Salvar isFirstLogin no userData
        const userWithFirstLogin = { ...userData, isFirstLogin };

        // Salva o token
        api.setToken(token);

        // Atualiza dados do usuário
        setUser(userWithFirstLogin);

        toast.success("Login realizado com sucesso!");

        // Se é primeiro login, vai para redefinir senha, senão dashboard
        if (isFirstLogin) {
          router.push("/redefinir-senha");
        } else {
          router.push("/dashboard");
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao fazer login");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/auth/register", data);
        const { token, user: userData } = response;

        // Salva o token
        api.setToken(token);
        setUser(userData);

        toast.success("Cadastro realizado com sucesso!");

        router.push(ROUTES.DASHBOARD);
      } catch (error: any) {
        toast.error(error.message || "Erro ao fazer cadastro");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
    toast.success("Logout realizado com sucesso!");
    router.push(ROUTES.LOGIN);
  }, [router]);

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      try {
        setIsLoading(true);

        await api.put("/auth/change-password", data);

        // Atualiza o usuário para remover flag de primeiro login
        if (user) {
          setUser({ ...user, isFirstLogin: false });
        }

        toast.success("Senha alterada com sucesso!");

        // Redireciona para dashboard após mudança de senha
        router.push(ROUTES.DASHBOARD);
      } catch (error: any) {
        toast.error(error.message || "Erro ao alterar senha");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, router]
  );

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.get<User>("/auth/profile");
      setUser(profile);
    } catch (error) {
      // Erro silenciado
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    refreshProfile,
  };
}
