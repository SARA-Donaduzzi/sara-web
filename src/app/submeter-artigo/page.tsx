"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { articleService } from "@/lib/service/articleService";
import { eventService } from "@/lib/service/eventService";
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/types";
import { ArticleFormData } from "@/lib/validations";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";
import { USER_ROLES } from "@/lib/constants";

export default function SubmitArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Carregar eventos disponíveis
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const eventsData = await eventService.getEvents();

        // Filtrar apenas eventos ativos e dentro do prazo de submissão
        const availableEvents = eventsData.filter((event) => {
          const now = new Date();
          const submissionStart = new Date(event.submissionStartDate);
          const submissionEnd = new Date(event.submissionEndDate);

          const isInSubmissionPeriod =
            now >= submissionStart && now <= submissionEnd;

          return event.isActive && isInSubmissionPeriod;
        });

        setEvents(availableEvents);
      } catch (error) {
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // Handler para submissão do artigo
  const handleSubmitArticle = async (
    formData: ArticleFormData & { pdfPath?: string }
  ) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      setIsSubmitting(true);

      // Dados para submissão
      const submissionData = {
        title: formData.title,
        summary: formData.summary,
        thematicArea: formData.thematicArea,
        keywords: formData.keywords,
        relatedAuthors: formData.relatedAuthors,
        eventId: formData.eventId,
        pdfPath: formData.pdfPath, // Vem do upload já processado no form
      };

      // Submeter artigo usando o serviço integrado
      const article = await articleService.submitArticleWithUpload(
        submissionData,
        user.id
      );

      toast.success("Artigo submetido com sucesso!");

      // Redirecionar para página de detalhes do artigo ou dashboard
      router.push(`/artigos/${article.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao submeter artigo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingEvents) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
        <PageLayout>
          <div className="container mx-auto py-8">
            <div className="flex justify-center items-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Carregando eventos disponíveis...
                </p>
              </div>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (events.length === 0) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
        <PageLayout>
          <div className="container mx-auto py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Submeter Artigo
              </h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Nenhum evento disponível
                </h3>
                <p className="text-yellow-700 mb-4">
                  Não há eventos com submissão aberta no momento.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>Para submeter um artigo, é necessário que:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>O evento esteja ativo</li>
                    <li>O período de submissão esteja aberto</li>
                    <li>Você tenha acesso de estudante</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Recarregar Página
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
      <PageLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Submeter Artigo
              </h1>
              <p className="text-gray-600 mt-2">
                Preencha todos os campos obrigatórios e faça o upload do seu
                artigo em PDF.
              </p>
            </div>

            <ArticleForm
              onSubmit={handleSubmitArticle}
              events={events}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
