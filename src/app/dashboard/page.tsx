"use client";

import React from "react";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { EvaluatorDashboard } from "@/components/dashboard/EvaluatorDashboard";
import { CoordinatorDashboard } from "@/components/dashboard/CoordinatorDashboard";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PasswordGuard } from "@/components/guards/PasswordGuard";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { USER_ROLES } from "@/lib/constants";

export default function DashboardPage() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case USER_ROLES.STUDENT:
        return <StudentDashboard />;
      case USER_ROLES.EVALUATOR:
        return <EvaluatorDashboard />;
      case USER_ROLES.COORDINATOR:
        return <CoordinatorDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Role não reconhecido
            </h2>
            <p className="text-gray-600">Entre em contato com o suporte.</p>
          </div>
        );
    }
  };

  return (
    <AuthGuard>
      <PageLayout>{renderDashboard()}</PageLayout>
    </AuthGuard>
  );
}
