"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserRole } from "@/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiresAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRoles = [],
  requiresAuth = true,
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  // USAR useEffect PARA REDIRECIONAMENTOS - NÃO NO RENDER
  useEffect(() => {
    if (!isLoading && !hasRedirectedRef.current) {
      // Não autenticado e precisa de autenticação
      if (requiresAuth && !isAuthenticated) {
        hasRedirectedRef.current = true;
        router.push("/login");
        return;
      }

      // Verificar roles se necessário
      if (
        requiredRoles.length > 0 &&
        user &&
        !requiredRoles.includes(user.role)
      ) {
        hasRedirectedRef.current = true;
        router.push("/dashboard");
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, requiresAuth, requiredRoles, router]);

  // Reset do flag quando usuário muda
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [user?.id]);

  // Carregando
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Verificando autenticação..." />
        </div>
      )
    );
  }

  // Não autenticado e precisa de autenticação
  if (requiresAuth && !isAuthenticated) {
    return fallback || null;
  }

  // Não tem permissão
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
}
