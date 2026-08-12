// src/lib/service/evaluationService.ts

import { api } from "@/lib/api";
import {
  Evaluation,
  CreateEvaluationRequest,
  EvaluationFilters,
} from "@/types";

// CORRIGIDO: Interface alinhada com backend
interface CreateEvaluationPayload {
  grade: number;
  evaluationDescription?: string;
  articleVersionId: string;
  status: "TO_CORRECTION" | "APPROVED" | "REJECTED";
  checklistResponses?: Array<{
    questionId: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }>;
}

interface EvaluationResponse {
  evaluation: Evaluation;
  checklistSaved: boolean;
  checklistErrors?: string[];
  articleFinalized: boolean;
  finalStatus?: string;
  finalGrade?: number;
}

export const evaluationService = {
  // CORRIGIDO: Listar avaliações do usuário
  async getMyEvaluations(
    filters?: EvaluationFilters
  ): Promise<{ data: Evaluation[]; total: number }> {
    const searchParams = new URLSearchParams();

    if (filters?.status) searchParams.append("status", filters.status);
    if (filters?.articleId) searchParams.append("articleId", filters.articleId);
    if (filters?.withChecklistResponses)
      searchParams.append("withChecklistResponses", "true");

    const queryString = searchParams.toString();
    const url = queryString ? `/evaluations?${queryString}` : "/evaluations";

    return api.get<{ data: Evaluation[]; total: number }>(url);
  },

  // CORRIGIDO: Buscar avaliação específica
  async getEvaluationById(id: string): Promise<Evaluation> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    return api.get<Evaluation>(`/evaluations/${id}`);
  },

  // CORRIGIDO: Buscar avaliação específica com dados completos (alias)
  async getEvaluation(id: string): Promise<{ data: Evaluation }> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    const evaluation = await api.get<Evaluation>(`/evaluations/${id}`);
    return { data: evaluation };
  },

  // CORRIGIDO: Buscar minha avaliação de um artigo específico
  async getMyEvaluationForArticle(
    articleId: string
  ): Promise<Evaluation | null> {
    if (!articleId) {
      throw new Error("ID do artigo é obrigatório");
    }

    try {
      // Tentar endpoint específico primeiro (se existir)
      try {
        return await api.get<Evaluation>(
          `/evaluations/article/${articleId}/my-evaluation`
        );
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Fallback: usar endpoint de filtros
          const evaluations = await api.get<{
            data: Evaluation[];
            total: number;
          }>(`/evaluations?articleId=${articleId}&withChecklistResponses=true`);

          if (evaluations.data && evaluations.data.length > 0) {
            return evaluations.data[0];
          }
        }
        throw error;
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("❌ Erro ao buscar avaliação:", error);
      throw error;
    }
  },

  // CORRIGIDO: Submeter avaliação
  async submitEvaluation(
    data: CreateEvaluationPayload
  ): Promise<EvaluationResponse> {
    // VALIDAÇÕES LOCAIS
    if (!data.grade && data.grade !== 0) {
      throw new Error("Nota é obrigatória");
    }

    if (data.grade < 0 || data.grade > 10) {
      throw new Error("Nota deve estar entre 0 e 10");
    }

    if (!data.articleVersionId) {
      throw new Error("ID da versão do artigo é obrigatório");
    }

    if (
      !data.status ||
      !["TO_CORRECTION", "APPROVED", "REJECTED"].includes(data.status)
    ) {
      throw new Error("Status válido é obrigatório");
    }

    // FILTRAR checklistResponses vazias
    const payload = {
      ...data,
      checklistResponses:
        data.checklistResponses?.filter((response) => {
          return (
            response.booleanResponse !== undefined ||
            response.scaleResponse !== undefined ||
            (response.textResponse && response.textResponse.trim() !== "")
          );
        }) || [],
    };

    try {
      const response = await api.post<EvaluationResponse>(
        "/evaluations",
        payload
      );

      return response;
    } catch (error: any) {
      console.error("❌ Erro ao submeter avaliação:", error);

      // Melhorar mensagens de erro
      if (error.response?.status === 400) {
        const message = error.response.data?.message || "Dados inválidos";
        throw new Error(`Erro de validação: ${message}`);
      } else if (error.response?.status === 401) {
        throw new Error("Não autorizado. Faça login novamente");
      } else if (error.response?.status === 403) {
        throw new Error("Você não tem permissão para avaliar este artigo");
      } else if (error.response?.status === 404) {
        throw new Error("Artigo não encontrado");
      } else if (error.response?.status >= 500) {
        throw new Error("Erro interno do servidor. Tente novamente");
      }

      throw error;
    }
  },

  // CORRIGIDO: Atualizar avaliação
  async updateEvaluation(
    id: string,
    data: Partial<CreateEvaluationPayload>
  ): Promise<Evaluation> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    // Filtrar checklistResponses se fornecidas
    const payload = {
      ...data,
      checklistResponses: data.checklistResponses?.filter((response) => {
        return (
          response.booleanResponse !== undefined ||
          response.scaleResponse !== undefined ||
          (response.textResponse && response.textResponse.trim() !== "")
        );
      }),
    };

    return api.put<Evaluation>(`/evaluations/${id}`, payload);
  },

  // CORRIGIDO: Salvar rascunho de avaliação
  async saveDraftEvaluation(
    data: Partial<CreateEvaluationPayload>
  ): Promise<Evaluation> {
    try {
      return await api.post<Evaluation>("/evaluations/draft", data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          "Funcionalidade de rascunho não implementada no backend"
        );
      }
      throw error;
    }
  },

  // CORRIGIDO: Atualizar rascunho de avaliação
  async updateDraftEvaluation(
    id: string,
    data: Partial<CreateEvaluationPayload>
  ): Promise<Evaluation> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    try {
      return await api.put<Evaluation>(`/evaluations/${id}/draft`, data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          "Funcionalidade de rascunho não implementada no backend"
        );
      }
      throw error;
    }
  },

  // CORRIGIDO: Limpar checklist da avaliação
  async clearEvaluationChecklist(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    try {
      return await api.delete<{ success: boolean; message: string }>(
        `/evaluations/${id}/clear-checklist`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          "Funcionalidade de limpeza de checklist não implementada"
        );
      }
      throw error;
    }
  },

  // NOVO: Deletar avaliação
  async deleteEvaluation(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID da avaliação é obrigatório");
    }

    return api.delete(`/evaluations/${id}`);
  },

  // NOVO: Estatísticas de avaliações
  async getEvaluationStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    approved: number;
    rejected: number;
    toCorrection: number;
  }> {
    return api.get<any>("/evaluations/stats");
  },

  // NOVO: Validar se pode avaliar artigo
  async canEvaluateArticle(
    articleId: string
  ): Promise<{ canEvaluate: boolean; reason?: string }> {
    if (!articleId) {
      throw new Error("ID do artigo é obrigatório");
    }

    try {
      return await api.get<{ canEvaluate: boolean; reason?: string }>(
        `/evaluations/can-evaluate/${articleId}`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { canEvaluate: false, reason: "Endpoint não implementado" };
      }
      throw error;
    }
  },
};
