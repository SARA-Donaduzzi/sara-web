"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { UserRole } from "@/types";
import { canAccess } from "@/lib/utils";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // Se deve ter todos os roles ou apenas um
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { user } = useAuthContext();

  if (requireAll) {
    // Requer todos os roles (caso especial, raramente usado)
    const hasAllRoles = allowedRoles.every((role) => user?.role === role);
    if (!hasAllRoles) {
      return <>{fallback}</>;
    }
  } else {
    // Requer pelo menos um dos roles
    if (!canAccess(user, allowedRoles)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
