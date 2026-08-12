import { api } from "@/lib/api";
import { CoordinatorStats, StudentStats, EvaluatorStats } from "@/types";

export const dashboardService = {
  // Estatísticas do coordenador
  async getCoordinatorStats(): Promise<CoordinatorStats> {
    return api.get<CoordinatorStats>("/dashboard/coordinator/stats");
  },

  // Artigos por evento (coordenador)
  async getArticlesByEvent(eventId: string): Promise<any> {
    return api.get(`/dashboard/coordinator/articles/${eventId}`);
  },

  // Artigos submetidos por evento (coordenador)
  async getSubmittedArticlesByEvent(eventId: string): Promise<any> {
    return api.get(`/dashboard/coordinator/articles/submitted/${eventId}`);
  },

  // Artigos pendentes por evento (coordenador)
  async getPendingArticlesByEvent(eventId: string): Promise<any> {
    return api.get(`/dashboard/coordinator/articles/pending/${eventId}`);
  },

  // Estatísticas do aluno
  async getStudentStats(): Promise<StudentStats> {
    return api.get<StudentStats>("/dashboard/student/stats");
  },

  // Estatísticas do avaliador
  async getEvaluatorStats(): Promise<EvaluatorStats> {
    return api.get<EvaluatorStats>("/dashboard/evaluator/stats");
  },
};
