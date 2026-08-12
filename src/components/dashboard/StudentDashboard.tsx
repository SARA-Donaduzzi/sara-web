"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { StudentStats } from "@/types";
import { ROUTES, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export function StudentDashboard() {
  const { data: stats, loading: statsLoading } = useApi<StudentStats>(
    () => api.get("/dashboard/student/stats"),
    {
      immediate: true,
    }
  );

  if (statsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  const recentSubmissonsList = stats?.recentSubmissions || [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Dashboard</h1>
          <p className="text-gray-600">Acompanhe suas submissões e progresso</p>
        </div>
        <Button asChild className="btn-gradient-accent">
          <Link href={ROUTES.SUBMIT_ARTICLE}>
            <Upload className="mr-2 h-4 w-4" />
            Submeter Artigo
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Submissões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Submissões
            </CardTitle>
            <FileText
              className="h-4 w-4 text-muted-foreground"
              stroke="url(#ia360-primary)"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalSubmissions === 1
                ? "artigo submetido"
                : "artigos submetidos"}
            </p>
          </CardContent>
        </Card>

        {/* Artigos Aprovados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4" stroke="url(#ia360-primary)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.approvedArticles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((stats?.approvedArticles || 0) /
                  Math.max(stats?.totalSubmissions || 1, 1)) *
                100
              ).toFixed(1)}
              % do total
            </p>
          </CardContent>
        </Card>

        {/* Artigos em Avaliação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Avaliação</CardTitle>
            <Clock className="h-4 w-4 " stroke="url(#ia360-primary)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingArticles || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              aguardando resultado
            </p>
          </CardContent>
        </Card>

        {/* Correções Necessárias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correções</CardTitle>
            <AlertTriangle
              className="h-4 w-4 text-orange-600"
              stroke="url(#ia360-primary)"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.articlesWithCorrections || 0}
            </div>
            <p className="text-xs text-muted-foreground">precisam de ajustes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso */}
      {stats && stats.totalSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Progresso das Submissões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Aprovados</span>
                <span>
                  {stats.approvedArticles}/{stats.totalSubmissions}
                </span>
              </div>
              <Progress
                value={(stats.approvedArticles / stats.totalSubmissions) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Em Avaliação</span>
                <span>
                  {stats.pendingArticles}/{stats.totalSubmissions}
                </span>
              </div>
              <Progress
                value={(stats.pendingArticles / stats.totalSubmissions) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Necessitam Correções</span>
                <span>
                  {stats.articlesWithCorrections}/{stats.totalSubmissions}
                </span>
              </div>
              <Progress
                value={
                  (stats.articlesWithCorrections / stats.totalSubmissions) * 100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissões Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Submissões Recentes
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ARTICLES}>Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <LoadingSpinner text="Carregando artigos..." />
          ) : recentSubmissonsList && recentSubmissonsList.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissonsList.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50  transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{article.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(article.createdAt)}
                      </span>
                      <span>Versão {article.currentVersion}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <StatusBadge status={article.status} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                        Ver detalhes
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhuma submissão ainda"
              description="Que tal começar submetendo seu primeiro artigo?"
              action={{
                label: "Submeter Artigo",
                onClick: () => (window.location.href = ROUTES.SUBMIT_ARTICLE),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
