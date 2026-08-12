import { ArticleStatus, EvaluationType, EventStatus } from ".";
import { User } from "./auth";

export interface Event {
  startSubmissionDate: string | number | Date;
  id: string;
  name: string;
  banner?: string;
  description: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationDeadline?: Date | string | null; // ⏰ Prazo para avaliação
  evaluationType: EvaluationType;
  status: EventStatus;
  isActive: boolean;
  coordinatorId: string;
  checklistId?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  articles?: Article[];
  evaluators?: User[];
  checklist?: Checklist;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  status: ArticleStatus;
  currentVersion: number;
  eventId: string;
  userId: string;
  keywords: string[];
  relatedAuthors: string[];
  pdfPath?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  event?: Event;
  user?: User;
  versions?: ArticleVersion[];
  evaluations?: Evaluation[];
}

export interface ArticleVersion {
  id: string;
  version: number;
  pdfPath: string;
  fileName: string;
  articleId: string;
  createdAt: Date;
  // Relacionamentos
  article?: Article;
  evaluations?: Evaluation[];
}

// CORRIGIDO: Interface Evaluation alinhada com backend
export interface Evaluation {
  id: string;
  grade: number;
  evaluationDescription?: string;
  evaluationDate: string;
  userId: string;
  articleVersionId: string;
  createdAt: string;
  updatedAt: string;
  status?: "TO_CORRECTION" | "APPROVED" | "REJECTED"; // ✅ Status específicos
  user: {
    id: string;
    name: string;
    email: string;
  };
  articleVersion: {
    id: string;
    version: number;
    article: {
      id: string;
      title: string;
      status: ArticleStatus;
      evaluationsDone: number;
      event: {
        id: string;
        name: string;
        evaluationType: EvaluationType;
        evaluationDeadline?: Date | string | null; // ⏰ Prazo para avaliação
      };
    };
  };
  // CORRIGIDO: ChecklistResponses alinhadas com backend
  checklistResponses?: ChecklistResponse[];
}

export interface Checklist {
  id: string;
  name: string; // ✅ Backend usa 'name' não 'title'
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  questions?: Question[];
  events?: Event[];
  _count?: {
    questions: number;
  };
}

// CORRIGIDO: Interface Question alinhada com backend
export interface Question {
  id: string;
  description: string; // ✅ Backend usa 'description' não 'text'
  type: "YES_NO" | "TEXT" | "SCALE";
  isRequired: boolean;
  order?: number;
  checklistId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  // Relacionamentos
  checklist?: Checklist;
  responses?: QuestionResponse[];
}

// MANTIDO: Interface legacy QuestionResponse (pode ser removida futuramente)
export interface QuestionResponse {
  id: string;
  answer: string;
  questionId: string;
  evaluationId: string;
  createdAt: Date;
  // Relacionamentos
  question?: Question;
  evaluation?: Evaluation;
}

// CORRIGIDO: Interface ChecklistResponse alinhada com backend
export interface ChecklistResponse {
  id?: string;
  questionId: string;
  booleanResponse?: boolean;
  scaleResponse?: number;
  textResponse?: string;
  userId?: string;
  articleVersionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Relacionamentos
  question?: Question;
  user?: User;
  articleVersion?: ArticleVersion;
}

// NOVO: Tipos para DTOs de criação e atualização
export interface CreateEvaluationRequest {
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

export interface UpdateEvaluationRequest
  extends Partial<CreateEvaluationRequest> {
  id: string;
}

// NOVO: Tipo para resposta de avaliação completa
export interface EvaluationResponse extends Evaluation {
  checklistResponses: Array<
    ChecklistResponse & {
      question: Question;
    }
  >;
}

// NOVO: Tipo para listagem de avaliações
export interface EvaluationListResponse {
  data: Evaluation[];
  total: number;
  page?: number;
  limit?: number;
}

// NOVO: Tipos para filtros de avaliação
export interface EvaluationFilters {
  status?: "TO_CORRECTION" | "APPROVED" | "REJECTED";
  articleId?: string;
  userId?: string;
  eventId?: string;
  withChecklistResponses?: boolean;
}

// NOVO: Tipo para estatísticas de avaliação
export interface EvaluationStats {
  total: number;
  pending: number;
  completed: number;
  approved: number;
  rejected: number;
  toCorrection: number;
  averageGrade?: number;
}
