// hooks/useEvaluation.ts

import { useState, useCallback, useEffect, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { Article, Question } from "@/types";
import {
  formatEvaluationForAPI,
  validateEvaluationForm,
} from "@/lib/validations";
import toast from "react-hot-toast";

interface UseEvaluationProps {
  articleId: string;
}

interface EvaluationState {
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

export function useEvaluation({ articleId }: UseEvaluationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [evaluationState, setEvaluationState] = useState<EvaluationState>({
    grade: 0,
    evaluationDescription: "",
    status: "TO_CORRECTION",
    checklistResponses: [],
  });

  // Buscar dados do artigo com informações do evento e checklist
  const {
    data: article,
    loading: articleLoading,
    error: articleError,
  } = useApi<{ article: Article }>(
    () => {
      return api
        .get(`/articles/${articleId}?include=event,event.checklist`)
        .then((response) => {
          return response;
        });
    },
    {
      immediate: !!articleId,
    }
  );

  // CORRIGIDO: Buscar perguntas do checklist com melhor tratamento de erro
  const {
    data: questions,
    loading: questionsLoading,
    error: questionsError,
    execute: refetchQuestions,
  } = useApi<Question[]>(
    () => {
      if (!article?.article.eventId) {
        return Promise.resolve([]);
      }

      return api
        .get(`/events/${article.article.eventId}/checklist/questions`)
        .then((data) => {
          return data;
        })
        .catch((error) => {
          // Se não há checklist (404), retorna array vazio
          if (error.response?.status === 404) {
            return [];
          }
          throw error;
        });
    },
    { immediate: false }
  );

  // VERIFICAR se já existe uma avaliação do usuário para este artigo (opcional)
  const { data: existingEvaluation, loading: evaluationLoading } = useApi<any>(
    () => {
      // Tentativa de buscar avaliação existente - se endpoint não existir, ignora
      return api.get(`/evaluations/my-evaluation/${articleId}`).catch(() => {
        return null;
      });
    },
    { immediate: !!articleId }
  );

  // Carregar perguntas quando o artigo for carregado
  useEffect(() => {
    if (article?.article.eventId) {
      refetchQuestions();
    }
  }, [article?.article.eventId, refetchQuestions]);

  // Inicializar respostas do checklist quando as perguntas forem carregadas
  useEffect(() => {
    if (questions && questions.length > 0) {
      const initialResponses = questions.map((q) => ({
        questionId: q.id,
        booleanResponse: undefined,
        scaleResponse: undefined,
        textResponse: undefined,
      }));

      setEvaluationState((prev) => ({
        ...prev,
        checklistResponses: initialResponses,
      }));
    } else if (questions && questions.length === 0) {
      setEvaluationState((prev) => ({
        ...prev,
        checklistResponses: [],
      }));
    }
  }, [questions]);

  // Carregar dados da avaliação existente se houver
  useEffect(() => {
    if (existingEvaluation) {
      setEvaluationState({
        grade: existingEvaluation.grade || 0,
        evaluationDescription: existingEvaluation.evaluationDescription || "",
        status: existingEvaluation.status || "TO_CORRECTION",
        checklistResponses: existingEvaluation.checklistResponses || [],
      });
    }
  }, [existingEvaluation]);

  // Atualizar campo específico do estado
  const updateField = useCallback(
    (field: keyof EvaluationState, value: any) => {
      setEvaluationState((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpar erro de validação para este campo
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  // Atualizar resposta específica do checklist
  const updateChecklistResponse = useCallback(
    (
      questionIndex: number,
      response: Partial<{
        booleanResponse: boolean;
        scaleResponse: number;
        textResponse: string;
      }>
    ) => {
      setEvaluationState((prev) => ({
        ...prev,
        checklistResponses: prev.checklistResponses.map((item, index) =>
          index === questionIndex ? { ...item, ...response } : item
        ),
      }));
    },
    []
  );

  // Validar formulário
  const validateForm = useCallback(() => {
    const validation = validateEvaluationForm(evaluationState, questions || []);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [evaluationState, questions]);

  // CORRIGIDO: Submeter avaliação com debug detalhado
  const submitEvaluation = useCallback(async () => {
    if (!article?.article.versions?.[0]?.id) {
      toast.error("Versão do artigo não encontrada");
      return false;
    }

    // Validar antes de enviar
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros antes de submeter");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = formatEvaluationForAPI(
        evaluationState,
        article.article.versions[0].id
      );

      let response;
      if (existingEvaluation) {
        // Atualizar avaliação existente
        response = await api.put(
          `/evaluations/${existingEvaluation.id}`,
          payload
        );
      } else {
        // Criar nova avaliação
        response = await api.post("/evaluations", payload);
      }

      toast.success(
        existingEvaluation
          ? "Avaliação atualizada com sucesso!"
          : "Avaliação submetida com sucesso!"
      );

      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erro ao submeter avaliação. Tente novamente."
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [article, evaluationState, existingEvaluation, validateForm]);

  // Salvar como rascunho (se implementado no backend)
  const saveDraft = useCallback(async () => {
    if (!article?.article.versions?.[0]?.id) {
      toast.error("Versão do artigo não encontrada");
      return false;
    }

    try {
      const payload = {
        ...formatEvaluationForAPI(
          evaluationState,
          article.article.versions[0].id
        ),
        isDraft: true,
      };

      await api.post("/evaluations/draft", payload);
      toast.success("Rascunho salvo com sucesso!");
      return true;
    } catch (error: any) {
      toast.error("Funcionalidade de rascunho não implementada no backend");
      return false;
    }
  }, [article, evaluationState]);

  // Reset do formulário
  const resetForm = useCallback(() => {
    setEvaluationState({
      grade: 0,
      evaluationDescription: "",
      status: "TO_CORRECTION",
      checklistResponses:
        questions?.map((q) => ({
          questionId: q.id,
          booleanResponse: undefined,
          scaleResponse: undefined,
          textResponse: undefined,
        })) || [],
    });
    setValidationErrors({});
  }, [questions]);

  // Verificar se o formulário tem alterações
  const hasChanges = useCallback(() => {
    if (!existingEvaluation) {
      return (
        evaluationState.grade > 0 ||
        evaluationState.evaluationDescription.trim() !== "" ||
        evaluationState.checklistResponses.some(
          (r) =>
            r.booleanResponse !== undefined ||
            r.scaleResponse !== undefined ||
            (r.textResponse && r.textResponse.trim() !== "")
        )
      );
    }

    // Comparar com avaliação existente
    return (
      evaluationState.grade !== existingEvaluation.grade ||
      evaluationState.evaluationDescription !==
        existingEvaluation.evaluationDescription ||
      evaluationState.status !== existingEvaluation.status
    );
  }, [evaluationState, existingEvaluation]);

  // VERIFICAÇÃO DE PRAZO: Verificar se o prazo de avaliação expirou
  const isDeadlineExpired = useMemo(() => {
    const event = article?.article?.event;
    if (!event?.evaluationDeadline) {
      return false; // Sem prazo definido = pode editar sempre
    }

    const deadline = new Date(event.evaluationDeadline);
    const now = new Date();
    return now > deadline;
  }, [article?.article?.event]);

  // VERIFICAÇÃO DE PRAZO: Verificar se pode editar (dentro do prazo)
  const canEdit = useMemo(() => {
    return !isDeadlineExpired;
  }, [isDeadlineExpired]);

  // VERIFICAÇÃO DE PRAZO: Obter texto do prazo formatado
  const deadlineInfo = useMemo(() => {
    const event = article?.article?.event;
    if (!event?.evaluationDeadline) {
      return {
        text: "Sem prazo definido",
        isExpired: false,
        date: null,
      };
    }

    const deadline = new Date(event.evaluationDeadline);
    const now = new Date();
    const isExpired = now > deadline;

    return {
      text: isExpired
        ? `⏰ Expirado em: ${deadline.toLocaleDateString("pt-BR")}`
        : `⏰ Prazo até: ${deadline.toLocaleDateString("pt-BR")}`,
      isExpired,
      date: deadline,
    };
  }, [article?.article?.event]);

  return {
    // Estado
    evaluationState,
    validationErrors,

    // Dados carregados
    article,
    questions: questions || [],
    existingEvaluation,

    // Estados de loading
    isLoading: articleLoading || questionsLoading || evaluationLoading,
    isSubmitting,

    // Dados de erro
    articleError,
    questionsError,

    // Ações
    updateField,
    updateChecklistResponse,
    submitEvaluation,
    saveDraft,
    resetForm,
    validateForm,

    // Utilitários
    hasChanges: hasChanges(),
    canSubmit: !isSubmitting && !articleLoading && !questionsLoading,

    // URLs
    fileUrl: article?.article.versions?.[0]?.pdfPath
      ? `${process.env.NEXT_PUBLIC_API_MINIO}/submita-pdfs/${article.article.versions[0].pdfPath}`
      : null,

    // VERIFICAÇÃO DE PRAZO
    isDeadlineExpired,
    canEdit,
    deadlineInfo,

    // Debug info
    debugInfo: {
      hasArticle: !!article,
      hasQuestions: !!questions,
      questionsCount: questions?.length || 0,
      hasExistingEvaluation: !!existingEvaluation,
      checklistResponsesCount: evaluationState.checklistResponses.length,
    },
  };
}
