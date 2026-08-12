"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/utils";

interface PasswordGuardProps {
  children: React.ReactNode;
  bypassForPasswordReset?: boolean;
}

export function PasswordGuard({
  children,
  bypassForPasswordReset = false,
}: PasswordGuardProps) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  // FIX: Usar ref para evitar redirecionamentos múltiplos
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (
      !isLoading &&
      user?.isFirstLogin &&
      !bypassForPasswordReset &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;
      router.push(ROUTES.RESET_PASSWORD);
    }
  }, [user, isLoading, bypassForPasswordReset, router]);

  // FIX: Reset do flag quando usuário muda
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [user?.id]);

  // Se é primeira senha e não é bypass, não renderiza
  if (user?.isFirstLogin && !bypassForPasswordReset) {
    return null;
  }

  return <>{children}</>;
}
