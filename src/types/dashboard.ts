import { ArticleStatus } from ".";
import { Article, Evaluation } from "./api";

export interface CoordinatorStats {
  totalSubmissions: number;
  totalEvents: number;
  totalEvaluators: number;
  totalStudents: number;
  bioParkStudents: number; // Atualizado
  submissionsByStatus: {
    status: ArticleStatus;
    count: number;
  }[];
  submissionsByEvent: {
    eventId: string;
    eventTitle: string;
    count: number;
  }[];
  evaluationProgress: {
    completed: number;
    pending: number;
    inProgress: number;
  };
}

export interface StudentStats {
  totalSubmissions: number;
  approvedArticles: number;
  rejectedArticles: number;
  pendingArticles: number;
  articlesWithCorrections: number;
  recentSubmissions: Article[];
}

export interface EvaluatorStats {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageGrade: number;
  recentEvaluations: Evaluation[];
  evaluationsByMonth: {
    month: string;
    count: number;
  }[];
}
