"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ClipboardList, BarChart3, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { CoordinatorStats } from "@/types";
import { ROUTES, STATUS_LABELS } from "@/lib/utils";
import { api } from "@/lib/api";

export function CoordinatorDashboard() {
  const fetchStats = useCallback(() => {
    return api.get("/dashboard/coordinator/stats");
  }, []); // Array vazio - função nunca mudará

  const { data: stats, loading: statsLoading } = useApi<CoordinatorStats>(
    fetchStats, // ✅ FIX: Função memoizada
    { immediate: true }
  );

  if (statsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Carregando dashboard..." />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: "bg-[#541822]/10 text-[#541822]",
      IN_EVALUATION: "bg-[#7a2630]/10 text-[#7a2630]",
      APPROVED: "bg-[#3d1219]/10 text-[#3d1219]",
      REJECTED: "bg-[#2d0d12]/10 text-[#2d0d12]",
      TO_CORRECTION: "bg-[#6b1f28]/10 text-[#6b1f28]",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral do sistema e estatísticas gerais
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.USERS}>
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </Link>
          </Button>
          <Button className="btn-gradient-accent" asChild>
            <Link href={ROUTES.CREATE_EVENT}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Submissões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Submissões
            </CardTitle>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient
                  id="fileTextGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#541822" />
                  <stop offset="25%" stopColor="#7a2630" />
                  <stop offset="50%" stopColor="#9e3a47" />
                  <stop offset="75%" stopColor="#7a2630" />
                  <stop offset="100%" stopColor="#541822" />
                </linearGradient>
              </defs>
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="url(#fileTextGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="url(#fileTextGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <line
                x1="16"
                y1="13"
                x2="8"
                y2="13"
                stroke="url(#fileTextGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="16"
                y1="17"
                x2="8"
                y2="17"
                stroke="url(#fileTextGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="10,9 9,9 8,9"
                stroke="url(#fileTextGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">artigos submetidos</p>
          </CardContent>
        </Card>

        {/* Total de Eventos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos Ativos
            </CardTitle>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient
                  id="calendarGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#541822" />
                  <stop offset="25%" stopColor="#7a2630" />
                  <stop offset="50%" stopColor="#9e3a47" />
                  <stop offset="75%" stopColor="#7a2630" />
                  <stop offset="100%" stopColor="#541822" />
                </linearGradient>
              </defs>
              {/* Corpo principal do calendário */}
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="url(#calendarGradient)"
                strokeWidth="2"
                fill="none"
              />
              {/* Gancho esquerdo */}
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
                stroke="url(#calendarGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Gancho direito */}
              <line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
                stroke="url(#calendarGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Linha divisória horizontal */}
              <line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
                stroke="url(#calendarGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Pontos dos dias - linha 1 */}
              <circle cx="8" cy="14" r="0.5" fill="url(#calendarGradient)" />
              <circle cx="12" cy="14" r="0.5" fill="url(#calendarGradient)" />
              <circle cx="16" cy="14" r="0.5" fill="url(#calendarGradient)" />
              {/* Pontos dos dias - linha 2 */}
              <circle cx="8" cy="18" r="0.5" fill="url(#calendarGradient)" />
              <circle cx="12" cy="18" r="0.5" fill="url(#calendarGradient)" />
              <circle cx="16" cy="18" r="0.5" fill="url(#calendarGradient)" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">eventos criados</p>
          </CardContent>
        </Card>

        {/* Total de Avaliadores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliadores</CardTitle>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient
                  id="userCheckGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#541822" />
                  <stop offset="25%" stopColor="#7a2630" />
                  <stop offset="50%" stopColor="#9e3a47" />
                  <stop offset="75%" stopColor="#7a2630" />
                  <stop offset="100%" stopColor="#541822" />
                </linearGradient>
              </defs>
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="url(#userCheckGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="url(#userCheckGradient)"
                strokeWidth="2"
                fill="none"
              />
              <polyline
                points="16,11 18,13 22,9"
                stroke="url(#userCheckGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEvaluators || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              avaliadores cadastrados
            </p>
          </CardContent>
        </Card>

        {/* Estudantes do Biopark */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biopark</CardTitle>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient
                  id="buildingGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#541822" />
                  <stop offset="25%" stopColor="#7a2630" />
                  <stop offset="50%" stopColor="#9e3a47" />
                  <stop offset="75%" stopColor="#7a2630" />
                  <stop offset="100%" stopColor="#541822" />
                </linearGradient>
              </defs>
              <path
                d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M10 6h4"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 10h4"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 14h4"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 18h4"
                stroke="url(#buildingGradient)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.bioParkStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              estudantes do Biopark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      {stats?.submissionsByStatus && stats.submissionsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Distribuição de Submissões por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.submissionsByStatus.map((statusData) => (
                <div
                  key={statusData.status}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {
                        STATUS_LABELS[
                          statusData.status as keyof typeof STATUS_LABELS
                        ]
                      }
                    </p>
                    <p className="text-2xl font-bold">{statusData.count}</p>
                  </div>
                  <Badge className={getStatusColor(statusData.status)}>
                    {(
                      (statusData.count / (stats.totalSubmissions || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissões por Evento */}
      {stats?.submissionsByEvent && stats.submissionsByEvent.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Submissões por Evento
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.EVENTS}>Ver eventos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.submissionsByEvent.map((eventData) => (
                <div
                  key={eventData.eventId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50  transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{eventData.eventTitle}</h3>
                    <p className="text-sm text-gray-500">
                      {eventData.count}{" "}
                      {eventData.count === 1 ? "submissão" : "submissões"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{eventData.count}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={ROUTES.EVENT_ARTICLES(eventData.eventId)}>
                        Ver artigos
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
