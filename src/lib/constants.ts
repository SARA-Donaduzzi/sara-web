export const APP_CONFIG = {
  name: "SARA - Donaduzzi",
  description: "Sistema de Avaliação e Revisão de Artigos",
  version: "1.0.0",
  company: "Cliick",
  repository: "https://github.com/SARA-Donaduzzi",
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 30000,
  retries: 3,
} as const;

export const FILE_CONFIG = {
  maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"), // 10MB
  allowedImageTypes: (
    process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES ||
    "image/jpeg,image/png,image/webp"
  ).split(","),
  allowedPdfTypes: (
    process.env.NEXT_PUBLIC_ALLOWED_PDF_TYPES || "application/pdf"
  ).split(","),
} as const;

export const ROUTES = {
  // Públicas
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  RESET_PASSWORD: "/redefinir-senha",

  // Autenticadas (URLs limpas)
  DASHBOARD: "/dashboard",
  EVENTS: "/eventos",
  CREATE_EVENT: "/eventos/criar",
  ARTICLES: "/artigos",
  SUBMIT_ARTICLE: "/submeter-artigo",
  USERS: "/usuarios",
  CHECKLISTS: "/checklists",
  PROFILE: "/perfil",

  // Dinâmicas
  EVENT_DETAILS: (id: string) => `/eventos/${id}`,
  EVENT_ARTICLES: (id: string) => `/eventos/${id}/artigos`,
  EVENT_EVALUATORS: (id: string) => `/eventos/${id}/avaliadores`,
  ARTICLE_DETAILS: (id: string) => `/artigos/${id}`,
  ARTICLE_EVALUATIONS: (id: string) => `/artigos/${id}/avaliacoes`,
  EVALUATE_ARTICLE: (id: string) => `/avaliar/${id}`,
  ARTICLE_CORRECTIONS: (id: string) => `/ressalvas/${id}`,
} as const;

export const USER_ROLES = {
  STUDENT: "STUDENT",
  EVALUATOR: "EVALUATOR",
  COORDINATOR: "COORDINATOR",
} as const;

// CORRIGIDO: Status conforme enum do backend
export const ARTICLE_STATUS = {
  SUBMITTED: "SUBMITTED",
  IN_EVALUATION: "IN_EVALUATION",
  APPROVED: "APPROVED",
  TO_CORRECTION: "TO_CORRECTION",
  REJECTED: "REJECTED",
} as const;

export const EVALUATION_TYPE = {
  DIRECT: "DIRECT",
  PAIR: "PAIR",
  PANEL: "PANEL",
} as const;

// CORRIGIDO: Labels corretos para cada status
export const STATUS_LABELS = {
  [ARTICLE_STATUS.SUBMITTED]: "Submetido",
  [ARTICLE_STATUS.IN_EVALUATION]: "Em Avaliação",
  [ARTICLE_STATUS.APPROVED]: "Aprovado",
  [ARTICLE_STATUS.TO_CORRECTION]: "Necessita Correção",
  [ARTICLE_STATUS.REJECTED]: "Rejeitado",
} as const;

// CORRIGIDO: Cores para cada status
export const STATUS_COLORS = {
  [ARTICLE_STATUS.SUBMITTED]: "bg-blue-100 text-blue-800",
  [ARTICLE_STATUS.IN_EVALUATION]: "bg-yellow-100 text-yellow-800",
  [ARTICLE_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [ARTICLE_STATUS.TO_CORRECTION]: "bg-orange-100 text-orange-800",
  [ARTICLE_STATUS.REJECTED]: "bg-red-100 text-red-800",
} as const;

// NOVA FUNÇÃO: Helper para obter label do status
export const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
};

// NOVA FUNÇÃO: Helper para obter cor do status
export const getStatusColor = (status: string): string => {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    "bg-gray-100 text-gray-800"
  );
};

// FUNÇÃO: Verificar se pode submeter nova versão
export const canSubmitNewVersion = (status: string): boolean => {
  return status === ARTICLE_STATUS.TO_CORRECTION;
};
