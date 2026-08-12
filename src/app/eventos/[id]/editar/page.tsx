"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { EventForm } from "@/components/forms/EventForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { EventFormData } from "@/lib/validations";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { eventService } from "@/lib/service/eventService";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";
import { Event } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line
  const { updateEvent, isUpdating } = useUpdateEvent();

  const formatDateForInput = (dateString: string | Date) => {
    // Se for Date, converte para string ISO primeiro
    const isoString =
      typeof dateString === "string" ? dateString : dateString.toISOString();
    return isoString.substring(0, 16);
  };

  // Buscar dados do evento
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const event = await eventService.getEventById(eventId);
        setEvent(event);
      } catch (error: any) {
        setError(error.message || "Erro ao carregar evento");
        toast.error("Erro ao carregar evento");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleSubmit = async (data: EventFormData) => {
    try {
      await updateEvent(eventId, data);
      router.push(ROUTES.EVENT_DETAILS(eventId));
    } catch (error) {}
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Eventos", href: "/eventos" },
    { label: event?.name || "Carregando...", href: `/eventos/${eventId}` },
    { label: "Editar" },
  ];

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
        <PageLayout title="Editar Evento" breadcrumbs={breadcrumbs}>
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (error || !event) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
        <PageLayout title="Editar Evento" breadcrumbs={breadcrumbs}>
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>
                {error || "Evento não encontrado"}
              </AlertDescription>
            </Alert>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout title="Editar Evento" breadcrumbs={breadcrumbs}>
        <div className="max-w-4xl mx-auto">
          <EventForm
            onSubmit={handleSubmit}
            initialData={{
              name: event.name,
              description: event.description,
              eventStartDate: formatDateForInput(event.eventStartDate),
              eventEndDate: formatDateForInput(event.eventEndDate),
              submissionStartDate: formatDateForInput(
                event.submissionStartDate
              ),
              submissionEndDate: formatDateForInput(event.submissionEndDate),
              evaluationType: event.evaluationType,
              banner: event.banner || "",
            }}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
