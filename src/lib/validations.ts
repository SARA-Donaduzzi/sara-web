import { z } from "zod";

// ===== SCHEMAS EXISTENTES (mantidos) =====

// Schema de login
export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Schema de registro
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(50, "Senha deve ter no máximo 50 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    isFromBpk: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Schema de registro para API (sem confirmPassword)
export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres"),
  isFromBpk: z.boolean().default(false),
});

// Schema de mudança de senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(6, "Nova senha deve ter pelo menos 6 caracteres")
      .max(50, "Nova senha deve ter no máximo 50 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export const eventFormSchema = z.object({
  name: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  eventStartDate: z.string().min(1, "Data de início do evento é obrigatória"),
  eventEndDate: z.string().min(1, "Data de fim do evento é obrigatória"),
  submissionStartDate: z
    .string()
    .min(1, "Data de início das submissões é obrigatória"),
  submissionEndDate: z
    .string()
    .min(1, "Data de fim das submissões é obrigatória"),
  evaluationType: z.enum(["DIRECT", "PAIR", "PANEL"]),
  banner: z.string().optional(),
  // NOVOS CAMPOS - Datas de gerenciamento de avaliações
  feedbackReleaseDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Data de liberação dos resultados inválida"
    ),
  evaluationDeadline: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Prazo para edição das avaliações inválido"
    ),
});

// Schema de evento
export const eventSchema = z.object({
  name: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  eventStartDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  eventEndDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  submissionStartDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  submissionEndDate: z.union([z.string(), z.date()]).transform((val) => {
    return typeof val === "string" ? new Date(val) : val;
  }),
  evaluationType: z.enum(["DIRECT", "PAIR", "PANEL"]),
  banner: z.string().optional(),
  // NOVOS CAMPOS - Datas de gerenciamento de avaliações
  feedbackReleaseDate: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }),
  evaluationDeadline: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }),
});

// Schema de artigo
export const articleSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(150, "Título deve ter no máximo 150 caracteres")
    .transform((val) => val.trim()),
  summary: z
    .string()
    .min(10, "Resumo deve ter pelo menos 10 caracteres")
    .max(1000, "Resumo deve ter no máximo 1000 caracteres")
    .transform((val) => val.trim()),
  thematicArea: z
    .string()
    .min(2, "Área temática deve ter pelo menos 2 caracteres")
    .max(150, "Área temática deve ter no máximo 150 caracteres")
    .transform((val) => val.trim()),
  keywords: z
    .array(z.string().min(1, "Palavra-chave não pode estar vazia"))
    .min(1, "Pelo menos uma palavra-chave é obrigatória")
    .max(50, "Máximo de 50 palavras-chave permitidas"),
  relatedAuthors: z
    .array(z.string().min(1, "Nome do autor não pode estar vazio"))
    .max(20, "Máximo de 20 autores relacionados"),
  eventId: z.string().min(1, "Evento é obrigatório"),
  pdfPath: z.string().optional(), // Será preenchido após upload
});

// Schema de avaliação
export const evaluationSchema = z.object({
  grade: z
    .number()
    .min(0, "Nota deve ser no mínimo 0")
    .max(10, "Nota deve ser no máximo 10"),
  evaluationDescription: z
    .string()
    .min(50, "Comentário deve ter pelo menos 50 caracteres")
    .max(3000, "Comentário deve ter no máximo 3000 caracteres"),
  responses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

// Schema de criação de avaliador
export const createEvaluatorSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

// ===== SCHEMAS PARA CHECKLISTS =====

// Schema para dados básicos do checklist (Etapa 1)
export const checklistBasicSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .transform((val) => (val === undefined ? val : val?.trim())),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .transform((val) => (val === undefined ? val : val?.trim())),
});

// Schema para uma questão individual - VERSÃO COMPATÍVEL
export const questionSchema = z.object({
  description: z
    .string()
    .min(3, "Pergunta deve ter pelo menos 3 caracteres")
    .max(200, "Pergunta deve ter no máximo 200 caracteres")
    .transform((val) => val.trim()),
  type: z.enum(["YES_NO", "TEXT", "SCALE"], {
    required_error: "Tipo de pergunta é obrigatório",
    invalid_type_error: "Tipo de pergunta inválido",
  }),
  isRequired: z.boolean(),
});

// Schema para múltiplas questões (Etapa 2)
export const questionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "Pelo menos uma pergunta é obrigatória")
    .max(20, "Máximo de 20 perguntas permitidas"),
});

// Schema alternativo para formulários com possível undefined
export const questionFormSchema = z.object({
  description: z
    .string()
    .min(3, "Pergunta deve ter pelo menos 3 caracteres")
    .max(200, "Pergunta deve ter no máximo 200 caracteres")
    .transform((val) => val.trim()),
  type: z.enum(["YES_NO", "TEXT", "SCALE"], {
    required_error: "Tipo de pergunta é obrigatório",
    invalid_type_error: "Tipo de pergunta inválido",
  }),
  isRequired: z.preprocess((val) => val ?? true, z.boolean()),
});

export const questionsFormSchema = z.object({
  questions: z
    .array(questionFormSchema)
    .min(1, "Pelo menos uma pergunta é obrigatória")
    .max(20, "Máximo de 20 perguntas permitidas"),
});

// Schema completo para checklist (ambas as etapas)
export const completeChecklistSchema = z.object({
  basic: checklistBasicSchema,
  questions: z.array(questionSchema).min(1),
});

// ===== NOVOS SCHEMAS PARA AVALIAÇÃO UNIFICADA =====

// Schema para resposta de checklist individual
export const checklistResponseSchema = z
  .object({
    questionId: z.string().uuid("ID da questão deve ser um UUID válido"),
    booleanResponse: z.boolean().optional(),
    scaleResponse: z
      .number()
      .min(1, "Escala mínima é 1")
      .max(5, "Escala máxima é 5")
      .optional(),
    textResponse: z
      .string()
      .max(1000, "Resposta de texto não pode exceder 1000 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      // Pelo menos um tipo de resposta deve estar presente
      const hasResponse =
        data.booleanResponse !== undefined ||
        data.scaleResponse !== undefined ||
        (data.textResponse && data.textResponse.trim() !== "");
      return hasResponse;
    },
    {
      message: "Pelo menos um tipo de resposta deve ser fornecido",
    }
  );

// Schema principal para avaliação completa - CORRIGIDO STATUS MAPPING
export const completeEvaluationSchema = z.object({
  grade: z
    .number()
    .min(0, "Nota mínima é 0")
    .max(10, "Nota máxima é 10")
    .refine((val) => Number.isFinite(val), "Nota deve ser um número válido"),

  evaluationDescription: z
    .string()
    .min(10, "Comentário deve ter pelo menos 10 caracteres")
    .max(1000, "Comentário não pode exceder 1000 caracteres")
    .transform((val) => val.trim()),

  // CORRIGIDO: Mapeamento correto para backend
  status: z.enum(["APPROVED", "TO_CORRECTION", "REJECTED"], {
    required_error: "Status da avaliação é obrigatório",
    invalid_type_error: "Status deve ser APPROVED, TO_CORRECTION ou REJECTED",
  }),

  articleVersionId: z
    .string()
    .uuid("ID da versão do artigo deve ser um UUID válido"),

  checklistResponses: z.array(checklistResponseSchema).optional(),
});

// Schema para validação rápida de nota
export const gradeValidationSchema = z.object({
  grade: z.number().min(0).max(10),
});

// ===== SCHEMAS PARA FILTROS E BUSCA =====

export const checklistFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  withQuestions: z.boolean().optional(),
});

// ===== VALIDADORES CUSTOMIZADOS =====

// Validar se pelo menos uma pergunta é obrigatória
export const validateAtLeastOneRequired = (
  questions: QuestionFormData[]
): boolean => {
  return questions.some((q) => q.isRequired);
};

// Validar se as descrições das perguntas são únicas
export const validateUniqueQuestions = (
  questions: QuestionFormData[]
): boolean => {
  const descriptions = questions.map((q) => q.description.toLowerCase().trim());
  return new Set(descriptions).size === descriptions.length;
};

// Validar distribuição de tipos de pergunta
export const validateQuestionDistribution = (
  questions: QuestionFormData[]
): {
  isValid: boolean;
  warnings: string[];
} => {
  const types = questions.map((q) => q.type);
  const typeCount = {
    YES_NO: types.filter((t) => t === "YES_NO").length,
    TEXT: types.filter((t) => t === "TEXT").length,
    SCALE: types.filter((t) => t === "SCALE").length,
  };

  const warnings: string[] = [];

  // Avisos para melhor balanceamento
  if (typeCount.YES_NO === 0) {
    warnings.push("Considere adicionar pelo menos uma pergunta Sim/Não");
  }

  if (typeCount.TEXT > questions.length * 0.5) {
    warnings.push(
      "Muitas perguntas de texto livre podem dificultar a avaliação"
    );
  }

  if (questions.length > 10) {
    warnings.push("Checklists muito longos podem desencorajar avaliadores");
  }

  return {
    isValid: true, // Sempre válido, apenas avisos
    warnings,
  };
};

// Função para determinar se uma avaliação pode ser editada
export const canEditEvaluation = (evaluation: any, currentUserId: string) => {
  // Só pode editar se for o autor da avaliação
  if (evaluation.userId !== currentUserId) {
    return false;
  }

  // Verificar se o artigo ainda está em status que permite edição
  const editableStatuses = ["SUBMITTED", "IN_EVALUATION"];
  return editableStatuses.includes(evaluation.articleVersion?.article?.status);
};

// Função para calcular cor da nota baseada no valor
export const getGradeColorClass = (grade: number) => {
  if (grade >= 8) return "text-green-600";
  if (grade >= 6) return "text-yellow-600";
  if (grade >= 4) return "text-orange-600";
  return "text-red-600";
};

// Função para calcular cor do status
export const getStatusColorClass = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "text-green-600";
    case "TO_CORRECTION":
      return "text-yellow-600";
    case "REJECTED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// NOVA FUNÇÃO: Verificar se artigo pode receber nova versão
export const canSubmitNewVersion = (articleStatus: string) => {
  return articleStatus === "TO_CORRECTION";
};

// ===== HELPERS DE VALIDAÇÃO =====

export const getQuestionTypeOptions = () =>
  [
    { value: "YES_NO", label: "Sim/Não", description: "Resposta: Sim / Não" },
    {
      value: "TEXT",
      label: "Texto Livre",
      description: "Resposta: Campo de texto livre",
    },
    {
      value: "SCALE",
      label: "Escala (1-5)",
      description: "Resposta: Escala de 1 a 5",
    },
  ] as const;

export const validateChecklistBeforeSubmit = (
  basic: ChecklistBasicFormData,
  questions: QuestionFormData[]
): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar dados básicos
  try {
    checklistBasicSchema.parse(basic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validar questões
  try {
    questionsSchema.parse({ questions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map((e) => e.message));
    }
  }

  // Validações customizadas
  if (!validateAtLeastOneRequired(questions)) {
    warnings.push("Recomenda-se ter pelo menos uma pergunta obrigatória");
  }

  if (!validateUniqueQuestions(questions)) {
    errors.push("Todas as perguntas devem ser únicas");
  }

  const distribution = validateQuestionDistribution(questions);
  warnings.push(...distribution.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Validações individuais por tipo de questão
export const validateChecklistResponseByType = (
  type: string,
  response: any
) => {
  switch (type) {
    case "YES_NO":
      return z.boolean().parse(response.booleanResponse);
    case "SCALE":
      return z.number().min(1).max(5).parse(response.scaleResponse);
    case "TEXT":
      return z.string().min(1).parse(response.textResponse);
    default:
      throw new Error(`Tipo de questão inválido: ${type}`);
  }
};

// FUNÇÃO CORRIGIDA - Validação completa do formulário de avaliação
export const validateEvaluationForm = (
  formData: any,
  questions: any[] = []
) => {
  const errors: Record<string, string> = {};

  // Validar nota (obrigatória)
  if (!formData.grade || formData.grade < 0 || formData.grade > 10) {
    errors.grade = "Nota deve estar entre 0 e 10";
  }

  // Validar descrição da avaliação (opcional, mas se preenchida deve ter mínimo)
  if (
    formData.evaluationDescription &&
    formData.evaluationDescription.trim().length < 10
  ) {
    errors.evaluationDescription =
      "Descrição deve ter pelo menos 10 caracteres";
  }

  // Validar status (obrigatório)
  if (
    !formData.status ||
    !["TO_CORRECTION", "APPROVED", "REJECTED"].includes(formData.status)
  ) {
    errors.status = "Status de avaliação é obrigatório";
  }

  // CORRIGIDO: Validar respostas do checklist
  if (questions && questions.length > 0) {
    questions.forEach((question, index) => {
      // CORREÇÃO PRINCIPAL: usar question.description em vez de question.text
      if (question.isRequired) {
        const response = formData.checklistResponses?.[index];
        if (!response) {
          errors[
            `checklist_${question.id}`
          ] = `Resposta para "${question.description}" é obrigatória`;
          return;
        }

        try {
          validateChecklistResponseByType(question.type, response);
        } catch (error: any) {
          errors[`checklist_${question.id}`] =
            error.issues?.[0]?.message ||
            `Resposta inválida para "${question.description}"`;
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// FUNÇÃO CORRIGIDA para formatar dados da avaliação para envio à API
export const formatEvaluationForAPI = (
  formData: any,
  articleVersionId: string
) => {
  // FILTRAR E MAPEAR checklistResponses corretamente
  const checklistResponses =
    formData.checklistResponses
      ?.filter((response: any) => {
        // Filtrar apenas respostas que têm valores válidos
        return (
          response.booleanResponse !== undefined ||
          response.scaleResponse !== undefined ||
          (response.textResponse && response.textResponse.trim() !== "")
        );
      })
      .map((response: any) => {
        // CORREÇÃO: garantir que apenas um tipo de resposta seja enviado
        const mappedResponse: any = {
          questionId: response.questionId,
        };

        // Adicionar apenas o tipo de resposta apropriado
        if (response.booleanResponse !== undefined) {
          mappedResponse.booleanResponse = response.booleanResponse;
        } else if (response.scaleResponse !== undefined) {
          mappedResponse.scaleResponse = response.scaleResponse;
        } else if (
          response.textResponse &&
          response.textResponse.trim() !== ""
        ) {
          mappedResponse.textResponse = response.textResponse.trim();
        }

        return mappedResponse;
      }) || [];

  return {
    grade: Number(formData.grade),
    evaluationDescription: formData.evaluationDescription?.trim() || undefined,
    articleVersionId,
    status: formData.status,
    checklistResponses,
  };
};

// MAPEAMENTO DE STATUS: Frontend -> Backend -> Article Status
export const getBackendStatusMapping = () => ({
  // Status que o frontend envia
  TO_CORRECTION: "TO_CORRECTION", // ✅ Backend recebe corretamente
  APPROVED: "APPROVED", // ✅ Backend recebe corretamente
  REJECTED: "REJECTED", // ✅ Backend recebe corretamente
});

// MAPEAMENTO DE STATUS: Article Status -> Label para UI
export const getArticleStatusMapping = () => ({
  SUBMITTED: "Submetido",
  IN_EVALUATION: "Em Avaliação",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  TO_CORRECTION: "Para Correção",
});

// NOVA FUNÇÃO: Validar estrutura de checklistResponses antes do envio
export const validateChecklistResponsesStructure = (
  checklistResponses: any[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(checklistResponses)) {
    errors.push("checklistResponses deve ser um array");
    return { isValid: false, errors };
  }

  checklistResponses.forEach((response, index) => {
    if (!response.questionId) {
      errors.push(`Resposta ${index + 1}: questionId é obrigatório`);
    }

    const responseValues = [
      response.booleanResponse,
      response.scaleResponse,
      response.textResponse,
    ].filter((r) => r !== undefined && r !== null && r !== "");

    if (responseValues.length === 0) {
      errors.push(`Resposta ${index + 1}: pelo menos um valor é obrigatório`);
    }

    if (responseValues.length > 1) {
      errors.push(
        `Resposta ${index + 1}: apenas um tipo de resposta é permitido`
      );
    }

    if (
      response.scaleResponse !== undefined &&
      (response.scaleResponse < 1 || response.scaleResponse > 5)
    ) {
      errors.push(`Resposta ${index + 1}: escala deve estar entre 1 e 5`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===== TIPOS INFERIDOS DOS SCHEMAS =====

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type EventFormFields = z.infer<typeof eventFormSchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
export type EvaluationFormData = z.infer<typeof evaluationSchema>;
export type CreateEvaluatorFormData = z.infer<typeof createEvaluatorSchema>;
export type ChecklistBasicFormData = z.infer<typeof checklistBasicSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type QuestionsFormData = z.infer<typeof questionsSchema>;
export type QuestionFormSchemaData = z.infer<typeof questionFormSchema>;
export type QuestionsFormSchemaData = z.infer<typeof questionsFormSchema>;
export type CompleteChecklistFormData = z.infer<typeof completeChecklistSchema>;
export type ChecklistFiltersData = z.infer<typeof checklistFiltersSchema>;
export type CompleteEvaluationFormData = z.infer<
  typeof completeEvaluationSchema
>;
