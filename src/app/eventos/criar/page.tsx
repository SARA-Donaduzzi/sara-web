"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/forms/EventForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { EventFormData } from "@/lib/validations";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function CreateEventPage() {
  const router = useRouter();

  const handleSubmit = async (data: EventFormData & { banner?: string }) => {
    try {
      await api.post("/events", {
        ...data,
        banner: data.banner,
      });

      toast.success("Evento criado com sucesso!");
      router.push(ROUTES.EVENTS);
    } catch (error: any) {
      throw new Error(error.message || "Erro ao criar evento");
    }
  };

  const breadcrumbs = [
    { label: "Eventos", href: "/eventos" },
    { label: "Criar Evento" },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout title="Criar Novo Evento" breadcrumbs={breadcrumbs}>
        <div className="max-w-4xl mx-auto">
          <EventForm onSubmit={handleSubmit} />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
