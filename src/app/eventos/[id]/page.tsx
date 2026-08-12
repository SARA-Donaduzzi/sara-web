"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ChecklistManager } from "@/components/events/ChecklistManager";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Settings,
  Upload,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuthContext } from "@/providers/AuthProvider";
import { Event, Article } from "@/types";
import { ROUTES, formatDate, formatDateTime, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { user } = useAuthContext();
  const [eventId, setEventId] = React.useState<string | null>(null);
  const [paramsError, setParamsError] = React.useState<string | null>(null);

  // Tratamento seguro de params
  React.useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setEventId(resolvedParams.id);
      } catch (error) {
        setParamsError("Erro ao carregar parâmetros da página");
      }
    };

    resolveParams();
  }, [params]);

  // Hooks de API com tratamento de erro
  const {
    data: event,
    loading: eventLoading,
    error: eventError,
  } = useApi<Event>(() => api.get(`/events/${eventId}`), {
    immediate: !!eventId,
  });

  const {
    data: articles,
    loading: articlesLoading,
    error: articlesError,
  } = useApi<Article[]>(
    () =>
      api.get(`/events/${eventId}/articles`).catch((error) => {
        // Tratar 404 como array vazio ao invés de erro
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }),
    { immediate: !!eventId }
  );

  const {
    data: eventStats,
    loading: statsLoading,
    error: statsError,
  } = useApi<any>(
    () =>
      api.get(`/dashboard/coordinator/articles/${eventId}`).catch((error) => {
        // Tratar 404 como dados vazios
        if (error.response?.status === 404) {
          return {
            stats: {
              totalSubmissions: 0,
              underReview: 0,
              approved: 0,
              evaluators: 0,
            },
          };
        }
        throw error;
      }),
    { immediate: !!eventId && user?.role === USER_ROLES.COORDINATOR }
  );

  // Show error if params failed to resolve
  if (paramsError) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Erro ao carregar página
              </h2>
              <p className="text-gray-600 mb-4">{paramsError}</p>
              <Button onClick={() => window.history.back()}>Voltar</Button>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  // Show loading while resolving params or loading event
  if (!eventId || eventLoading) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  // Handle event error
  if (eventError || !event) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Evento não encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Button asChild className="mt-4">
              <Link href={ROUTES.EVENTS}>Voltar para eventos</Link>
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const banner =
    process.env.NEXT_PUBLIC_API_MINIO + "/submita-images/" + event?.banner;

  const breadcrumbs = [
    { label: "Eventos", href: "/eventos" },
    { label: event.name },
  ];

  const now = new Date();
  const startDate = new Date(event.submissionStartDate);
  const endDate = new Date(event.submissionEndDate);

  const isActive = now >= startDate && now <= endDate;
  const isUpcoming = now < startDate;
  const isFinished = now > endDate;

  const getEventStatus = () => {
    if (isUpcoming)
      return {
        label: "Em breve",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      };
    if (isActive)
      return {
        label: "Ativo",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    return {
      label: "Finalizado",
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    };
  };

  const status = getEventStatus();

  const canSubmit = user?.role === USER_ROLES.STUDENT && isActive;

  return (
    <AuthGuard>
      <PageLayout
        title={event.name}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {canSubmit && (
              <Button asChild>
                <Link href={ROUTES.SUBMIT_ARTICLE}>
                  <Upload className="mr-2 h-4 w-4" />
                  Submeter Artigo
                </Link>
              </Button>
            )}

            <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
              <ChecklistManager
                event={event}
                onChecklistUpdated={() => window.location.reload()}
              />
              <Button variant="outline" asChild>
                <Link href={ROUTES.EVENT_ARTICLES(event.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Artigos
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={ROUTES.EVENT_EVALUATORS(event.id)}
                  className="btn-gradient-accent"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Avaliadores
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={`/eventos/${event.id}/editar`}
                  className="btn-gradient-primary"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Editar Evento
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={`/eventos/${event.id}/emails`}
                  className="btn-gradient-accent"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email em Massa
                </Link>
              </Button>
            </RoleGuard>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Banner */}
            {event.banner && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative h-64 w-full">
                    <Image
                      src={banner}
                      alt={event.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Articles Statistics (Coordinator Only) */}
            <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Estatísticas de Submissões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-8 rounded mb-2"></div>
                          <div className="bg-gray-200 h-4 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {eventStats?.stats?.totalSubmissions || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total de Submissões
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {eventStats?.stats?.underReview || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Em Avaliação
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {eventStats?.stats?.approved || 0}
                        </div>
                        <div className="text-sm text-gray-600">Aprovados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {eventStats?.stats?.evaluators || 0}
                        </div>
                        <div className="text-sm text-gray-600">Avaliadores</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </RoleGuard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <status.icon className="mr-2 h-5 w-5" />
                  Status do Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={status.color}>{status.label}</Badge>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Início das Submissões</p>
                      <p className="text-gray-600">
                        {formatDateTime(event.submissionStartDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Fim das Submissões</p>
                      <p className="text-gray-600">
                        {formatDateTime(event.submissionEndDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {canSubmit && (
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href={ROUTES.SUBMIT_ARTICLE}>
                        <Upload className="mr-2 h-4 w-4" />
                        Submeter Artigo
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações para Submissão */}
            {canSubmit && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Como Submeter seu Artigo
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Prepare seu artigo em formato PDF</li>
                    <li>Tenha em mãos o resumo e palavras-chave</li>
                    <li>Liste todos os co-autores (se houver)</li>
                    <li>Clique em "Submeter Artigo" e preencha o formulário</li>
                    <li>Aguarde a confirmação de submissão</li>
                  </ol>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href={ROUTES.SUBMIT_ARTICLE}>
                        <Upload className="mr-2 h-4 w-4" />
                        Submeter Artigo Agora
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
