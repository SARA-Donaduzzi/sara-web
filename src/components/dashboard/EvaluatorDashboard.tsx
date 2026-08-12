"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  AlertCircle,
  BookOpen,
  Edit,
  Lock,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { Evaluation, EvaluatorStats } from "@/types";
import { ROUTES, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";

export function EvaluatorDashboard() {
  const { data: stats, loading: statsLoading } = useApi<EvaluatorStats>(
    () => api.get("/dashboard/evaluator/stats"),
    { immediate: true }
  );

  const { data: pendingEvaluationsData, loading: evaluationsLoading } = useApi<{
    pendingEvaluations: any[];
    total: number;
  }>(() => api.get("/evaluations/pending?limit=5"), {
    immediate: true,
  });

  // BUSCAR AVALIAÇÕES CONCLUÍDAS (minhas avaliações)
  const {
    data: myEvaluationsData,
    loading: myEvaluationsLoading,
  } = useApi<{
    data: Evaluation[];
    total: number;
  }>(() => api.get("/evaluations?limit=10"), {
    immediate: true,
  });

  // Extrair as avaliações pendentes dos dados
  const pendingEvaluations = pendingEvaluationsData?.pendingEvaluations || [];

  // Extrair minhas avaliações concluídas
  const myEvaluations = myEvaluationsData?.data || [];

  // Helper para verificar se o prazo de avaliação expirou
  const isDeadlineExpired = (evaluation: Evaluation): boolean => {
    const deadline = evaluation.articleVersion?.article?.event?.evaluationDeadline;
    if (!deadline) return false; // Sem prazo = sempre pode editar
    return new Date() > new Date(deadline);
  };

  // Helper para formatar o prazo
  const formatDeadline = (evaluation: Evaluation): string => {
    const deadline = evaluation.articleVersion?.article?.event?.evaluationDeadline;
    if (!deadline) return "Sem prazo";
    const date = new Date(deadline);
    const isExpired = new Date() > date;
    return `${isExpired ? "⏰ Expirado" : "⏰ Prazo"}: ${date.toLocaleDateString("pt-BR")}`;
  };

  if (statsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Dashboard</h1>
          <p className="text-gray-600">
            Gerencie suas avaliações e acompanhe seu progresso
          </p>
        </div>
        <Button asChild className="btn-gradient-accent">
          <Link href={ROUTES.ARTICLES}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver Artigos
          </Link>
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Avaliações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Avaliações
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEvaluations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              avaliações atribuídas
            </p>
          </CardContent>
        </Card>

        {/* Avaliações Concluídas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedEvaluations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((stats?.completedEvaluations || 0) /
                  Math.max(stats?.totalEvaluations || 1, 1)) *
                100
              ).toFixed(1)}
              % do total
            </p>
          </CardContent>
        </Card>

        {/* Avaliações Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingEvaluations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              aguardando avaliação
            </p>
          </CardContent>
        </Card>

        {/* Nota Média */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.averageGrade ? stats.averageGrade.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              das avaliações concluídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Avaliações por Mês */}
      {stats?.evaluationsByMonth && stats.evaluationsByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Avaliações por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.evaluationsByMonth.map((monthData, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{monthData.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2 ">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (monthData.count /
                              Math.max(
                                ...stats.evaluationsByMonth.map((m) => m.count),
                                1
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {monthData.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avaliações Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
            Avaliações Pendentes
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ARTICLES}>Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {evaluationsLoading ? (
            <LoadingSpinner text="Carregando avaliações..." />
          ) : pendingEvaluations && pendingEvaluations.length > 0 ? (
            <div className="space-y-4">
              {pendingEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50  transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {evaluation.articleVersion?.article?.title ||
                        "Artigo sem título"}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Atribuído em {formatDate(evaluation.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Versão {evaluation.articleVersion?.version || 1}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700"
                    >
                      Pendente
                    </Badge>
                    <Button size="sm" asChild>
                      <Link
                        href={ROUTES.EVALUATE_ARTICLE(
                          evaluation.articleVersion?.article?.id || ""
                        )}
                      >
                        Avaliar
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Todas as avaliações em dia!"
              description="Você não possui avaliações pendentes no momento."
            />
          )}
        </CardContent>
      </Card>

      {/* ⏰ MINHAS AVALIAÇÕES CONCLUÍDAS - Com opção de editar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Minhas Avaliações
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ARTICLES}>Ver artigos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {myEvaluationsLoading ? (
            <LoadingSpinner text="Carregando avaliações..." />
          ) : myEvaluations && myEvaluations.length > 0 ? (
            <div className="space-y-4">
              {myEvaluations.map((evaluation) => {
                const expired = isDeadlineExpired(evaluation);
                const deadlineText = formatDeadline(evaluation);

                return (
                  <div
                    key={evaluation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {evaluation.articleVersion?.article?.title ||
                          "Artigo sem título"}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Avaliado em {formatDate(evaluation.evaluationDate)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Nota: {evaluation.grade}/10
                        </Badge>
                        {/* ⏰ Badge de prazo */}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            expired
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {expired ? (
                            <Lock className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {deadlineText}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          evaluation.status === "APPROVED"
                            ? "bg-green-50 text-green-700"
                            : evaluation.status === "TO_CORRECTION"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {evaluation.status === "APPROVED" && "Aprovado"}
                        {evaluation.status === "TO_CORRECTION" &&
                          "Correção"}
                        {evaluation.status === "REJECTED" && "Rejeitado"}
                      </Badge>
                      {/* ⏰ Botão Editar - só aparece se dentro do prazo */}
                      {expired ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="opacity-50 cursor-not-allowed"
                        >
                          <Lock className="mr-1 h-4 w-4" />
                          Prazo Expirado
                        </Button>
                      ) : (
                        <Button size="sm" asChild>
                          <Link
                            href={ROUTES.EVALUATE_ARTICLE(
                              evaluation.articleVersion?.article?.id || ""
                            )}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhuma avaliação encontrada"
              description="Você ainda não avaliou nenhum artigo."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
