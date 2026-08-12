"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Navigation({ items, className }: NavigationProps) {
  const pathname = usePathname();

  // Gera breadcrumbs automáticos se não fornecidos
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-500",
        className
      )}
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-700  transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-gray-700  transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900  font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  const pathMap: Record<string, string> = {
    dashboard: "Dashboard",
    eventos: "Eventos",
    artigos: "Artigos",
    usuarios: "Usuários",
    checklists: "Checklists",
    perfil: "Perfil",
    "submeter-artigo": "Submeter Artigo",
    avaliar: "Avaliar",
    criar: "Criar",
    rascunhos: "Rascunhos",
    historico: "Histórico",
    atribuicoes: "Atribuições",
    relatorios: "Relatórios",
  };

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = isLast
      ? undefined
      : "/" + segments.slice(0, index + 1).join("/");
    const label =
      pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
}
