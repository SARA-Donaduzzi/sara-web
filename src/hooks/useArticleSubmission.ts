import { useState, useEffect } from "react";
import { eventService } from "@/lib/service/eventService";
import { articleService } from "@/lib/service/articleService";
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/types";
import { ArticleFormData } from "@/lib/validations";

// Hook para verificar se eventos estão no período de submissão
export function useEventsInSubmissionPeriod() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const eventsData = await eventService.getEvents();

      const availableEvents = eventsData.filter((event) => {
        const now = new Date();
        const submissionStart = new Date(event.submissionStartDate);
        const submissionEnd = new Date(event.submissionEndDate);

        return event.isActive && now >= submissionStart && now <= submissionEnd;
      });

      setEvents(availableEvents);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return { events, isLoading, error, refetch: loadEvents };
}

// Hook personalizado para submissão de artigos
export function useArticleSubmission() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitArticle = async (
    formData: ArticleFormData & { pdfPath?: string }
  ) => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        title: formData.title,
        summary: formData.summary,
        thematicArea: formData.thematicArea,
        keywords: formData.keywords,
        relatedAuthors: formData.relatedAuthors,
        eventId: formData.eventId,
        pdfPath: formData.pdfPath,
      };

      const article = await articleService.submitArticleWithUpload(
        submissionData,
        user.id
      );

      return article;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitArticle,
    isSubmitting,
  };
}
