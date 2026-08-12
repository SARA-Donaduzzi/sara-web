"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Se não está carregando e não há usuário, redireciona para login
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Se usuário não precisa redefinir senha, redireciona para dashboard
    if (!isLoading && user && !user.isFirstLogin) {
      router.push(ROUTES.DASHBOARD);
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  if (!user || !user.isFirstLogin) {
    return null; // Redirecionamento em andamento
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Aviso de Segurança */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Acesso Bloqueado:</strong> Para continuar usando o sistema,
            você deve redefinir sua senha temporária por uma senha pessoal e
            segura.
          </AlertDescription>
        </Alert>

        {/* Formulário de Redefinir Senha */}
        <ChangePasswordForm isFirstLogin={true} />

        {/* Informação do Usuário */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Logado como: <strong>{user.name}</strong>
          </p>
          <p className="text-xs">
            {user.role === "EVALUATOR" ? "Avaliador" : "Coordenador"} •{" "}
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
