"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  Settings,
  Eye,
  Upload,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";

// Interface para a resposta da API
interface EventsApiResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EventsPage() {
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { user } = useAuth();

  const fetchEvents = useCallback(() => {
    const url = `/events${
      debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""
    }`;
    return api.get(url);
  }, [debouncedSearch]);

  const {
    data: apiResponse,
    loading,
    error,
    execute: refetchEvents,
  } = useApi<EventsApiResponse>(fetchEvents, {
    immediate: true,
  });

  const events = apiResponse?.events || [];

  const banners = events.map((event) =>
    event.banner
      ? process.env.NEXT_PUBLIC_API_MINIO + "/submita-images/" + event.banner
      : null
  );

  const pagination = apiResponse
    ? {
        total: apiResponse.total,
        page: apiResponse.page,
        limit: apiResponse.limit,
        totalPages: apiResponse.totalPages,
      }
    : null;

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.submissionStartDate);
    const endDate = new Date(event.submissionEndDate);

    if (now < startDate)
      return { label: "Em breve", color: "bg-blue-100 text-blue-800" };
    if (now > endDate)
      return { label: "Finalizado", color: "bg-gray-100 text-gray-800" };
    return { label: "Ativo", color: "bg-green-100 text-green-800" };
  };

  const getEventType = (event: Event) => {
    switch (event.evaluationType) {
      case "DIRECT":
        return "Direta";
      case "PAIR":
        return "Em par";
      case "PANEL":
        return "Por comitê";
      default:
        return "Desconhecido";
    }
  };

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isCoordinator = user?.role === USER_ROLES.COORDINATOR;

  const breadcrumbs = [{ label: "Eventos" }];

  if (loading) {
    return (
      <AuthGuard>
        <PageLayout title="Eventos" breadcrumbs={breadcrumbs}>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando eventos..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <PageLayout title="Eventos" breadcrumbs={breadcrumbs}>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Erro ao carregar eventos
            </h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button onClick={refetchEvents} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout
        title="Eventos"
        breadcrumbs={breadcrumbs}
        actions={
          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
            <Button asChild className="btn-gradient-accent">
              <Link href={ROUTES.CREATE_EVENT}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Link>
            </Button>
          </RoleGuard>
        }
      >
        <div className="space-y-6">
          {/* Informações de paginação */}
          {pagination && pagination.total > 0 && (
            <div className="text-sm text-gray-500">
              Mostrando {events.length} de {pagination.total} eventos
            </div>
          )}

          {/* Lista de Eventos */}
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum evento encontrado"
              description={
                searchTerm
                  ? `Nenhum evento encontrado para "${searchTerm}"`
                  : "Não há eventos cadastrados ainda."
              }
              action={
                isCoordinator
                  ? {
                      label: "Criar Primeiro Evento",
                      onClick: () =>
                        (window.location.href = ROUTES.CREATE_EVENT),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const status = getEventStatus(event);
                const now = new Date();
                const startDate = new Date(event.submissionStartDate);
                const endDate = new Date(event.submissionEndDate);
                const isActive = now >= startDate && now <= endDate;
                // eslint-disable-next-line
                const canSubmit = isStudent && isActive;

                return (
                  <Card
                    key={event.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      <CardTitle className="text-lg line-clamp-2">
                        {event.name}
                      </CardTitle>

                      <div className="mt-2">
                        {event.banner && (
                          <Image
                            src={banners[events.indexOf(event)] || ""}
                            alt={event.name}
                            width={300}
                            height={150}
                            className="w-full h-32 rounded-md object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Submissões: {formatDate(
                            event.submissionStartDate
                          )} - {formatDate(event.submissionEndDate)}
                        </div>

                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Evento: {formatDate(event.eventStartDate)} -{" "}
                          {formatDate(event.eventEndDate)}
                        </div>

                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Avaliação: {getEventType(event)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          {/* Botão Ver - Apenas para coordenadores */}
                          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={ROUTES.EVENT_DETAILS(event.id)}>
                                <Eye className="mr-1 h-3 w-3" />
                                Ver
                              </Link>
                            </Button>
                          </RoleGuard>

                          {/* Botão Submeter - Apenas para estudantes em eventos ativos */}
                          {isStudent &&
                            (isActive ? (
                              <Button
                                size="sm"
                                asChild
                                className="btn-gradient-accent"
                              >
                                <Link href={ROUTES.SUBMIT_ARTICLE}>
                                  <Upload className="mr-1 h-3 w-3" />
                                  Submeter
                                </Link>
                              </Button>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800 text-xs"
                              >
                                Fora do prazo de submissão
                              </Badge>
                            ))}

                          {/* Botão Gerenciar - Apenas para coordenadores */}
                          <RoleGuard allowedRoles={[USER_ROLES.COORDINATOR]}>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/eventos/${event.id}/editar`}>
                                <Settings className="mr-1 h-3 w-3" />
                                Gerenciar
                              </Link>
                            </Button>
                          </RoleGuard>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
