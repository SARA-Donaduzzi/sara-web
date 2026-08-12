import { EvaluationType } from ".";
import { Question } from "./api";

export interface EventFormData {
  name: string;
  description: string;
  image?: File;
  banner?: string;
  eventStartDate: Date;
  eventEndDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: EvaluationType;
}

export interface ArticleFormData {
  title: string;
  summary: string;
  keywords: string[];
  relatedAuthors: string[];
  file?: File;
  eventId: string;
}

export interface EvaluationFormData {
  grade: number;
  evaluationDescription: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
}

export interface ChecklistFormData {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: Question["type"];
    isRequired: boolean;
    options?: string[];
  }[];
}

// Novo tipo para avaliação unificada
export interface CompleteEvaluationFormData {
  grade: number;
  evaluationDescription: string;
  status: "APPROVED" | "TO_CORRECTION" | "REJECTED";
  articleVersionId: string;
  checklistResponses?: Array<{
    questionId: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }>;
}

// Tipo para estado do hook de avaliação
export interface EvaluationState {
  grade: number;
  evaluationDescription: string;
  status: "APPROVED" | "TO_CORRECTION" | "REJECTED";
  checklistResponses: Array<{
    questionId: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }>;
}
