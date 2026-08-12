"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function PageLayout({
  children,
  title,
  breadcrumbs,
  actions,
  className,
  showSidebar = true,
  showFooter = true,
}: PageLayoutProps) {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Fixo */}
      {showSidebar && user && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      {/* Conteúdo Principal com margem para o sidebar */}
      <div
        className={cn(
          "min-h-screen flex flex-col",
          showSidebar && user ? "lg:pl-64" : ""
        )}
      >
        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col pt-5">
          {/* Header da Página */}
          {(title || breadcrumbs || actions) && (
            <div className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
              <div className="max-w-7xl mx-auto">
                {breadcrumbs && (
                  <Navigation items={breadcrumbs} className="mb-2" />
                )}

                {(title || actions) && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {title && (
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {title}
                        </h1>
                      </div>
                    )}
                    {actions && (
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {actions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Área de Conteúdo */}
          <div className={cn("flex-1 p-4 lg:p-6", className)}>
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
