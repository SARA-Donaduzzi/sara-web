// src/middleware.ts - Correção do fluxo isFirstLogin

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register"];

// Rotas de redefinir senha (permitidas mesmo com isFirstLogin=true)
const passwordResetRoutes = ["/redefinir-senha"];

// Rotas por role
const roleRoutes = {
  STUDENT: [
    "/dashboard",
    "/artigos",
    "/submeter-artigo",
    "/ressalvas",
    "/perfil",
    "/eventos",
  ],
  EVALUATOR: [
    "/dashboard",
    "/artigos",
    "/avaliar",
    "/rascunhos",
    "/historico",
    "/perfil",
  ],
  COORDINATOR: [
    "/dashboard",
    "/eventos",
    "/usuarios",
    "/checklists",
    "/atribuicoes",
    "/relatorios",
    "/perfil",
  ],
};

/**
 * Busca o perfil do usuário na API para verificar isFirstLogin
 */
async function fetchUserProfile(token: string): Promise<any> {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await fetch(`${baseURL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se a rota atual é de redefinição de senha
 */
function isPasswordResetRoute(pathname: string): boolean {
  return passwordResetRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Verifica se a rota é pública
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pular arquivos estáticos
  if (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Permite acesso às rotas públicas sem autenticação
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verifica se tem token
  const token = request.cookies.get("sara_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Busca o perfil completo do usuário para verificar isFirstLogin
    const userProfile = await fetchUserProfile(token);

    if (!userProfile) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sara_token");
      return response;
    }

    const isFirstLogin = userProfile.isFirstLogin === true;

    // FLUXO 1: Usuário com isFirstLogin=true
    if (isFirstLogin) {
      // Se já está na rota de redefinir senha, permite o acesso
      if (isPasswordResetRoute(pathname)) {
        return NextResponse.next();
      }

      // Se está tentando acessar qualquer outra rota protegida,
      // redireciona para /redefinir-senha
      return NextResponse.redirect(new URL("/redefinir-senha", request.url));
    }

    // FLUXO 2: Usuário com isFirstLogin=false (senha já redefinida)
    // Se está tentando acessar rota de redefinir senha, redireciona para dashboard
    if (!isFirstLogin && isPasswordResetRoute(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // FLUXO 3: Verifica permissões por role para rotas protegidas
    const userRole = userProfile.role;
    const allowedRoutes =
      roleRoutes[userRole as keyof typeof roleRoutes] || [];

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Em caso de erro, limpa o token e redireciona para login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("sara_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
