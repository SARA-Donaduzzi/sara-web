import { api } from "@/lib/api";
import { QuestionResponse } from "@/types";

interface CreateQuestionResponseRequest {
  questionId: string;
  answer: string;
  evaluationId: string;
}

export const questionResponseService = {
  // Responder checklist
  async submitQuestionResponse(
    data: CreateQuestionResponseRequest
  ): Promise<QuestionResponse> {
    return api.post<QuestionResponse>("/question-responses", data);
  },

  // Responder múltiplas perguntas
  async submitMultipleResponses(
    responses: CreateQuestionResponseRequest[]
  ): Promise<QuestionResponse[]> {
    return api.post<QuestionResponse[]>("/question-responses/bulk", {
      responses,
    });
  },

  // Buscar respostas de uma avaliação
  async getEvaluationResponses(
    evaluationId: string
  ): Promise<QuestionResponse[]> {
    return api.get<QuestionResponse[]>(
      `/question-responses/evaluation/${evaluationId}`
    );
  },

  // Atualizar resposta
  async updateQuestionResponse(
    id: string,
    answer: string
  ): Promise<QuestionResponse> {
    return api.put<QuestionResponse>(`/question-responses/${id}`, { answer });
  },

  // Deletar resposta
  async deleteQuestionResponse(id: string): Promise<void> {
    return api.delete(`/question-responses/${id}`);
  },
};
