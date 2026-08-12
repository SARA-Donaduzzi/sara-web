// types/evaluation.ts

import { Evaluation, QuestionResponse } from "./api";

// TIPOS PARA RESPOSTA DA API
export interface PaginatedEvaluationsResponse {
  evaluations: Evaluation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: {
    averageGrade: number;
    statusDistribution: {
      approved: number;
      toCorrection: number;
      rejected: number;
    };
    articlesCount: number;
    evaluatorsCount: number;
  };
}
