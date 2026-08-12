import { User, UserRole } from "@/types";

export function decodeToken(token: string): any {
  try {
    // Decodifica o payload do JWT sem verificar a assinatura
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function canAccess(
  user: User | null,
  requiredRoles: UserRole[]
): boolean {
  return hasRole(user, requiredRoles);
}

export function getRedirectPath(user: User): string {
  if (user.isFirstLogin) {
    return "/redefinir-senha";
  }

  return "/dashboard";
}

export function formatUserRole(role: UserRole): string {
  const roleLabels = {
    STUDENT: "Aluno",
    EVALUATOR: "Avaliador",
    COORDINATOR: "Coordenador",
  };

  return roleLabels[role] || role;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
