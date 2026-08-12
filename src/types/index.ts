export type UserRole = "STUDENT" | "EVALUATOR" | "COORDINATOR";

export interface ReviewerSuggestion {
  evaluatorId: string
  name: string
  email: string
  score: number
  hasConflict: boolean
  conflictReason?: string
}

// CORRIGIDO: Status conforme enum do backend
export type ArticleStatus =
  | "SUBMITTED"
  | "IN_EVALUATION"
  | "APPROVED"
  | "TO_CORRECTION"
  | "REJECTED";

export type EvaluationType = "DIRECT" | "PAIR" | "PANEL";

export type EventStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export * from "./auth";
export * from "./form";
export * from "./dashboard";
export * from "./file";
export * from "./notification";
export * from "./route";
export * from "./error";
export * from "./search";
export * from "./evaluation"; // ✅ NOVO: Tipos de avaliação
export * from "./api";
