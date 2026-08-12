import { api } from "@/lib/api";

// Tipos baseados na resposta real da API com withQuestions=true
interface QuestionFromAPI {
  id: string;
  description: string;
  type: "YES_NO" | "TEXT" | "SCALE";
  isRequired: boolean;
  order: number;
  isActive: boolean;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistFromAPI {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistWithQuestions extends ChecklistFromAPI {
  questions: QuestionFromAPI[];
}

// Tipos para criação
interface CreateChecklistBasicRequest {
  name: string;
  description?: string;
}

interface CreateChecklistQuestionsRequest {
  questions: {
    description: string;
    type: "YES_NO" | "TEXT" | "SCALE";
    isRequired: boolean;
    order: number;
  }[];
}

interface ChecklistResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const checklistService = {
  // PRINCIPAL: Buscar checklists COM questões (endpoint otimizado)
  async getChecklistsWithQuestions(params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<ChecklistWithQuestions[]> {
    const searchParams = new URLSearchParams();

    // Flag obrigatória para incluir questões
    searchParams.append("withQuestions", "true");

    if (params?.search) {
      searchParams.append("search", params.search);
    }

    if (params?.isActive !== undefined) {
      searchParams.append("isActive", params.isActive.toString());
    }

    return api.get<ChecklistWithQuestions[]>(
      `/checklists?${searchParams.toString()}`
    );
  },

  // Buscar checklists básicos (sem questões)
  async getChecklists(params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<ChecklistFromAPI[]> {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.append("search", params.search);
    }

    if (params?.isActive !== undefined) {
      searchParams.append("isActive", params.isActive.toString());
    }

    return api.get<ChecklistFromAPI[]>(
      `/checklists?${searchParams.toString()}`
    );
  },

  // ETAPA 1: Criar checklist básico (apenas título e descrição)
  async createChecklistBasic(
    data: CreateChecklistBasicRequest
  ): Promise<ChecklistResponse> {
    return api.post<ChecklistResponse>("/checklists", data);
  },

  // ETAPA 2: Adicionar perguntas ao checklist
  async addChecklistQuestions(
    checklistId: string,
    data: CreateChecklistQuestionsRequest
  ): Promise<QuestionFromAPI[]> {
    return api.post<QuestionFromAPI[]>(
      `/checklists/${checklistId}/questions`,
      data
    );
  },

  // FLUXO COMPLETO: Criar checklist com perguntas em uma única função
  async createCompleteChecklist(
    basicData: CreateChecklistBasicRequest,
    questionsData: CreateChecklistQuestionsRequest
  ): Promise<{ checklist: ChecklistResponse; questions: QuestionFromAPI[] }> {
    try {
      // Etapa 1: Criar checklist básico
      const checklist = await this.createChecklistBasic(basicData);

      // Etapa 2: Adicionar perguntas
      const questions = await this.addChecklistQuestions(
        checklist.id,
        questionsData
      );

      return { checklist, questions };
    } catch (error) {
      // null;
      throw error;
    }
  },

  // Buscar checklist por ID
  async getChecklistById(id: string): Promise<ChecklistFromAPI> {
    return api.get<ChecklistFromAPI>(`/checklists/${id}`);
  },

  // Buscar perguntas de um checklist específico
  async getChecklistQuestions(checklistId: string): Promise<QuestionFromAPI[]> {
    return api.get<QuestionFromAPI[]>(`/checklists/${checklistId}/questions`);
  },

  // Soft Delete - Desativar checklist (marca isActive = false)
  async deleteChecklist(id: string): Promise<ChecklistResponse> {
    // O backend faz soft delete do checklist e das questões automaticamente
    return api.delete<ChecklistResponse>(`/checklists/${id}`);
  },

  // Soft Delete - Desativar pergunta específica
  async deleteQuestion(
    checklistId: string,
    questionId: string
  ): Promise<QuestionFromAPI> {
    return api.delete<QuestionFromAPI>(
      `/checklists/${checklistId}/questions/${questionId}`
    );
  },

  // Buscar perguntas do checklist de um evento específico
  async getEventChecklistQuestions(
    eventId: string
  ): Promise<QuestionFromAPI[]> {
    return api.get<QuestionFromAPI[]>(`/events/${eventId}/checklist/questions`);
  },

  // Filtrar apenas checklists ativos
  async getActiveChecklistsWithQuestions(params?: {
    search?: string;
  }): Promise<ChecklistWithQuestions[]> {
    return this.getChecklistsWithQuestions({
      ...params,
      isActive: true,
    });
  },

  // Filtrar apenas checklists inativos
  async getInactiveChecklistsWithQuestions(params?: {
    search?: string;
  }): Promise<ChecklistWithQuestions[]> {
    return this.getChecklistsWithQuestions({
      ...params,
      isActive: false,
    });
  },

  // Estatísticas completas dos checklists
  async getChecklistStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalQuestions: number;
    totalActiveQuestions: number;
    averageQuestionsPerChecklist: number;
  }> {
    try {
      const allChecklists = await this.getChecklistsWithQuestions();

      const activeChecklists = allChecklists.filter((c) => c.isActive);
      const inactiveChecklists = allChecklists.filter((c) => !c.isActive);

      // Contar questões
      const totalQuestions = allChecklists.reduce(
        (acc, checklist) => acc + (checklist.questions?.length || 0),
        0
      );

      const totalActiveQuestions = allChecklists.reduce(
        (acc, checklist) =>
          acc + (checklist.questions?.filter((q) => q.isActive).length || 0),
        0
      );

      const averageQuestionsPerChecklist =
        activeChecklists.length > 0
          ? Math.round((totalActiveQuestions / activeChecklists.length) * 10) /
            10
          : 0;

      return {
        total: allChecklists.length,
        active: activeChecklists.length,
        inactive: inactiveChecklists.length,
        totalQuestions,
        totalActiveQuestions,
        averageQuestionsPerChecklist,
      };
    } catch (error) {
      throw error;
    }
  },

  // Buscar checklists por tipo de pergunta
  async getChecklistsByQuestionType(
    questionType: "YES_NO" | "TEXT" | "SCALE"
  ): Promise<ChecklistWithQuestions[]> {
    try {
      const allChecklists = await this.getChecklistsWithQuestions();

      return allChecklists.filter((checklist) =>
        checklist.questions?.some(
          (question) => question.type === questionType && question.isActive
        )
      );
    } catch (error) {
      throw error;
    }
  },

  // Validar estrutura de pergunta
  validateQuestionData(question: any): boolean {
    const requiredFields = ["description", "type", "isRequired"];
    const validTypes = ["YES_NO", "TEXT", "SCALE"];

    // Verificar campos obrigatórios
    for (const field of requiredFields) {
      if (!question.hasOwnProperty(field)) {
        throw new Error(`Campo '${field}' é obrigatório`);
      }
    }

    // Verificar tipo válido
    if (!validTypes.includes(question.type)) {
      throw new Error(
        `Tipo '${question.type}' é inválido. Tipos válidos: ${validTypes.join(
          ", "
        )}`
      );
    }

    // Verificar descrição
    if (!question.description || question.description.trim().length < 3) {
      throw new Error("Pergunta deve ter pelo menos 3 caracteres");
    }

    return true;
  },

  // Helper para preparar dados de perguntas
  prepareQuestionsData(questions: any[]): CreateChecklistQuestionsRequest {
    const preparedQuestions = questions.map((question, index) => {
      // Validar cada pergunta
      this.validateQuestionData(question);

      return {
        description: question.description,
        type: question.type,
        isRequired: question.isRequired ?? true,
        order: question.order ?? index + 1,
      };
    });

    return { questions: preparedQuestions };
  },

  // Helper para mapear dados da API para o frontend
  mapChecklistForDisplay(apiChecklist: ChecklistFromAPI) {
    return {
      ...apiChecklist,
      title: apiChecklist.name, // Mapear 'name' para 'title' se necessário
    };
  },

  // Helper para análise de checklist
  analyzeChecklist(checklist: ChecklistWithQuestions): {
    totalQuestions: number;
    activeQuestions: number;
    requiredQuestions: number;
    optionalQuestions: number;
    questionTypes: Record<string, number>;
    isComplete: boolean;
    warnings: string[];
  } {
    const activeQuestions =
      checklist.questions?.filter((q) => q.isActive) || [];
    const requiredQuestions = activeQuestions.filter((q) => q.isRequired);
    const optionalQuestions = activeQuestions.filter((q) => !q.isRequired);

    const questionTypes = activeQuestions.reduce((acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const warnings: string[] = [];

    // Gerar avisos
    if (activeQuestions.length === 0) {
      warnings.push("Checklist não possui perguntas ativas");
    }

    if (requiredQuestions.length === 0 && activeQuestions.length > 0) {
      warnings.push("Nenhuma pergunta é obrigatória");
    }

    if (activeQuestions.length > 15) {
      warnings.push("Checklist muito longo pode desencorajar avaliadores");
    }

    if (!questionTypes.YES_NO && activeQuestions.length > 0) {
      warnings.push(
        "Considere adicionar perguntas Sim/Não para avaliações rápidas"
      );
    }

    return {
      totalQuestions: checklist.questions?.length || 0,
      activeQuestions: activeQuestions.length,
      requiredQuestions: requiredQuestions.length,
      optionalQuestions: optionalQuestions.length,
      questionTypes,
      isComplete: activeQuestions.length > 0 && requiredQuestions.length > 0,
      warnings,
    };
  },

  // Helper para formatar dados para exibição
  formatChecklistForDisplay(checklist: ChecklistWithQuestions) {
    const analysis = this.analyzeChecklist(checklist);

    return {
      ...checklist,
      displayName: checklist.name,
      displayDescription: checklist.description || "Sem descrição",
      questionCount: analysis.activeQuestions,
      requiredCount: analysis.requiredQuestions,
      isComplete: analysis.isComplete,
      statusLabel: checklist.isActive ? "Ativo" : "Inativo",
      createdAtFormatted: new Date(checklist.createdAt).toLocaleDateString(
        "pt-BR"
      ),
      analysis,
    };
  },
};
