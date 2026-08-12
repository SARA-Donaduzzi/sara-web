import { api } from "@/lib/api";
import { Event, User, Article } from "@/types";

interface CreateEventRequest {
  name: string;
  description: string;
  banner?: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: "DIRECT" | "PAIR" | "PANEL";
}

// CORREÇÃO: Interface para resposta paginada da API
interface EventsApiResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const eventService = {
  // CORRIGIDO: Listar eventos
  async getEvents(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    // API retorna formato paginado
    const response = await api.get<EventsApiResponse>(
      `/events?${searchParams.toString()}`
    );

    // CORREÇÃO: Extrair array events da resposta paginada
    return response.events || [];
  },

  // NOVO: Método para buscar eventos com paginação completa
  async getEventsWithPagination(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<EventsApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    return api.get<EventsApiResponse>(`/events?${searchParams.toString()}`);
  },

  // NOVO: Método específico para eventos no período de submissão
  async getEventsInSubmissionPeriod(): Promise<Event[]> {
    try {
      // Buscar todos os eventos ativos
      const allEvents = await this.getEvents({
        status: "SUBMISSIONS_OPEN", // Filtrar por status se disponível
      });

      // Filtrar eventos no período de submissão
      const now = new Date();
      const availableEvents = allEvents.filter((event) => {
        const submissionStart = new Date(event.submissionStartDate);
        const submissionEnd = new Date(event.submissionEndDate);

        return event.isActive && now >= submissionStart && now <= submissionEnd;
      });

      return availableEvents;
    } catch (error) {
      throw error;
    }
  },

  // Buscar evento por ID
  async getEventById(id: string): Promise<Event> {
    return api.get<Event>(`/events/${id}`);
  },

  // Criar evento
  async createEvent(data: CreateEventRequest): Promise<Event> {
    return api.post<Event>("/events", {
      name: data.name,
      banner: data.banner,
      description: data.description,
      eventStartDate: data.eventStartDate,
      eventEndDate: data.eventEndDate,
      submissionStartDate: data.submissionStartDate,
      submissionEndDate: data.submissionEndDate,
      evaluationType: data.evaluationType,
    });
  },

  // Atualizar evento
  async updateEvent(
    id: string,
    data: Partial<CreateEventRequest>
  ): Promise<Event> {
    return api.put<Event>(`/events/${id}`, data);
  },

  // Deletar evento
  async deleteEvent(id: string): Promise<void> {
    return api.delete(`/events/${id}`);
  },

  // Buscar avaliadores do evento
  async getEventEvaluators(eventId: string): Promise<User[]> {
    return api.get<User[]>(`/events/${eventId}/evaluators`);
  },

  // Adicionar avaliadores ao evento
  async addEvaluatorsToEvent(
    eventId: string,
    evaluatorIds: string[]
  ): Promise<void> {
    return api.post(`/events/${eventId}/evaluators`, { evaluatorIds });
  },

  // Remover avaliador do evento
  async removeEvaluatorFromEvent(
    eventId: string,
    evaluatorId: string
  ): Promise<void> {
    return api.delete(`/events/${eventId}/evaluators/${evaluatorId}`);
  },

  // Buscar artigos do evento
  async getEventArticles(
    eventId: string,
    params?: { search?: string; status?: string; submissionType?: string }
  ): Promise<Article[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.submissionType && params.submissionType !== "all") {
      searchParams.append("submissionType", params.submissionType);
    }

    return api.get<Article[]>(
      `/events/${eventId}/articles?${searchParams.toString()}`
    );
  },

  // Adicionar checklist ao evento
  async assignChecklistToEvent(
    eventId: string,
    checklistId: string
  ): Promise<Event> {
    return api.patch<Event>(`/events/${eventId}/checklist`, { checklistId });
  },

  // Remover checklist do evento
  async removeChecklistFromEvent(eventId: string): Promise<Event> {
    return api.delete<Event>(`/events/${eventId}/checklist`);
  },

  // Enviar email em massa para participantes do evento
  async sendBulkEmail(
    eventId: string,
    data: {
      filters: {
        roles?: ("STUDENT" | "EVALUATOR")[];
        articleStatus?: string;
      };
      subject: string;
      body: string;
    }
  ): Promise<{
    data: {
      totalRecipients: number;
      sent: number;
      failed: number;
      errors: string[];
    };
  }> {
    return api.post(`/events/${eventId}/send-bulk-email`, data);
  },
};
