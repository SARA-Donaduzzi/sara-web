"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewer } from "@/components/common/PDFViewer";
import { ChecklistQuestionsList } from "@/components/evaluation/ChecklistQuestion";
import {
  FileText,
  Star,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Save,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useEvaluation } from "@/hooks/useEvaluation";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { getGradeColorClass, getStatusColorClass } from "@/lib/validations";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EvaluateArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluateArticlePage({
  params,
}: EvaluateArticlePageProps) {
  const router = useRouter();
  const [articleId, setArticleId] = React.useState<string | null>(null);

  // Resolver params assíncronos
  React.useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setArticleId(resolvedParams.id);
      } catch (error) {}
    };
    resolveParams();
  }, [params]);

  // Usar o hook personalizado de avaliação
  const {
    evaluationState,
    validationErrors,
    article,
    questions,
    existingEvaluation,
    isLoading,
    isSubmitting,
    articleError,
    updateField,
    updateChecklistResponse,
    submitEvaluation,
    saveDraft,
    resetForm,
    hasChanges,
    canSubmit,
    fileUrl,
    // VERIFICAÇÃO DE PRAZO
    isDeadlineExpired,
    deadlineInfo,
  } = useEvaluation({ articleId: articleId || "" });

  // Submit da avaliação
  const handleSubmit = async () => {
    const success = await submitEvaluation();
    if (success) {
      router.push(ROUTES.ARTICLES);
    }
  };

  // Salvar rascunho
  const handleSaveDraft = async () => {
    await saveDraft();
  };

  // Reset do formulário
  const handleReset = () => {
    if (
      window.confirm(
        "Tem certeza que deseja limpar todos os campos? Esta ação não pode ser desfeita."
      )
    ) {
      resetForm();
      toast.success("Formulário limpo com sucesso!");
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando artigo..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (articleError || !article) {
    return (
      <AuthGuard
        requiredRoles={[
          USER_ROLES.EVALUATOR,
          USER_ROLES.COORDINATOR,
          USER_ROLES.EVALUATOR,
        ]}
      >
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está tentando avaliar não existe ou não está
              disponível.
            </p>
            <Button
              onClick={() => router.push(ROUTES.ARTICLES)}
              className="mt-4"
            >
              Voltar para artigos
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Artigos", href: "/artigos" },
    { label: "Avaliar Artigo" },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.EVALUATOR]}>
      <PageLayout
        title={`${existingEvaluation ? "Editar" : "Avaliar"}: ${
          article.article.title
        }`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Rascunho
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna do PDF - 2/3 da largura */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Documento do Artigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fileUrl ? (
                <PDFViewer
                  fileUrl={fileUrl}
                  fileName={article.article.title}
                  className="min-h-[800px]"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>Nenhum documento disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coluna da direita - Formulário de Avaliação - 1/3 da largura */}
          <div className="space-y-4">
            {/* Alertas de status */}
            {existingEvaluation && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você já avaliou este artigo. Suas alterações substituirão a
                  avaliação anterior.
                </AlertDescription>
              </Alert>
            )}

            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Por favor, corrija os erros destacados antes de submeter a
                  avaliação.
                </AlertDescription>
              </Alert>
            )}

            {/* Informações do Artigo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Artigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <StatusBadge status={article.article.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Versão:</span>
                  <Badge variant="outline">
                    {article.article.currentVersion}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data:</span>
                  <span className="text-sm text-gray-600">
                    {formatDate(article.article.createdAt)}
                  </span>
                </div>
                {/* ⏰ Badge de Prazo para Avaliação */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-medium">Prazo:</span>
                  <Badge
                    variant="outline"
                    className={
                      isDeadlineExpired
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {isDeadlineExpired ? (
                      <>
                        <Lock className="mr-1 h-3 w-3" />
                        {deadlineInfo.text}
                      </>
                    ) : (
                      <>
                        <Clock className="mr-1 h-3 w-3" />
                        {deadlineInfo.text}
                      </>
                    )}
                  </Badge>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium">Resumo:</span>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {article.article.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ⏰ Alerta de Prazo Expirado */}
            {isDeadlineExpired && (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  O prazo para avaliação deste artigo expirou. Você não pode mais
                  submeter ou editar sua avaliação.
                </AlertDescription>
              </Alert>
            )}

            {/* Avaliação Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Avaliação Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nota */}
                <div className="space-y-2">
                  <Label htmlFor="grade">Nota (0-10) *</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={evaluationState.grade || ""}
                      onChange={(e) =>
                        updateField("grade", parseFloat(e.target.value) || 0)
                      }
                      className="w-20"
                      disabled={isSubmitting || isDeadlineExpired}
                    />
                    <span
                      className={`font-medium ${getGradeColorClass(
                        evaluationState.grade
                      )}`}
                    >
                      {evaluationState.grade}/10
                    </span>
                  </div>
                  {validationErrors.grade && (
                    <p className="text-sm text-red-600">
                      {validationErrors.grade}
                    </p>
                  )}
                </div>

                {/* Status da Avaliação */}
                <div className="space-y-2">
                  <Label>Decisão *</Label>
                  <RadioGroup
                    value={evaluationState.status}
                    onValueChange={(value) => updateField("status", value)}
                    disabled={isSubmitting || isDeadlineExpired}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="APPROVED" id="approved" />
                      <Label
                        htmlFor="approved"
                        className="flex items-center cursor-pointer"
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Aprovado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="TO_CORRECTION" id="correction" />
                      <Label
                        htmlFor="correction"
                        className="flex items-center cursor-pointer"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                        Necessita Correção
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="REJECTED" id="rejected" />
                      <Label
                        htmlFor="rejected"
                        className="flex items-center cursor-pointer"
                      >
                        <Clock className="mr-2 h-4 w-4 text-red-600" />
                        Rejeitado
                      </Label>
                    </div>
                  </RadioGroup>
                  {validationErrors.status && (
                    <p className="text-sm text-red-600">
                      {validationErrors.status}
                    </p>
                  )}
                </div>

                {/* Comentários */}
                <div className="space-y-2">
                  <Label htmlFor="evaluationDescription">
                    Comentários e Feedback *
                  </Label>
                  <Textarea
                    id="evaluationDescription"
                    placeholder="Forneça comentários detalhados sobre o artigo, pontos fortes, áreas para melhoria, etc."
                    rows={4}
                    value={evaluationState.evaluationDescription}
                    onChange={(e) =>
                      updateField("evaluationDescription", e.target.value)
                    }
                    disabled={isSubmitting || isDeadlineExpired}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Mínimo 10 caracteres</span>
                    <span
                      className={
                        evaluationState.evaluationDescription.length > 2000
                          ? "text-orange-600"
                          : ""
                      }
                    >
                      {evaluationState.evaluationDescription.length}/2000
                    </span>
                  </div>
                  {validationErrors.evaluationDescription && (
                    <p className="text-sm text-red-600">
                      {validationErrors.evaluationDescription}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checklist do Evento */}
            {questions && questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Checklist de Avaliação
                  </CardTitle>
                  {/* Descrição do checklist se disponível */}
                  <p className="text-sm text-gray-600">
                    Responda às questões específicas do evento
                  </p>
                </CardHeader>
                <CardContent>
                  <ChecklistQuestionsList
                    questions={questions}
                    responses={evaluationState.checklistResponses}
                    onResponseChange={updateChecklistResponse}
                    errors={validationErrors}
                    disabled={isSubmitting || isDeadlineExpired}
                  />
                </CardContent>
              </Card>
            )}

            {/* Resumo da Avaliação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nota:</span>
                  <span
                    className={`font-bold ${getGradeColorClass(
                      evaluationState.grade
                    )}`}
                  >
                    {evaluationState.grade}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Decisão:</span>
                  <Badge
                    variant="outline"
                    className={getStatusColorClass(evaluationState.status)}
                  >
                    {evaluationState.status === "APPROVED" && "Aprovado"}
                    {evaluationState.status === "TO_CORRECTION" &&
                      "Necessita Correção"}
                    {evaluationState.status === "REJECTED" && "Rejeitado"}
                  </Badge>
                </div>
                {questions && questions.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Checklist:</span>
                    <span className="text-sm text-gray-600">
                      {
                        evaluationState.checklistResponses.filter(
                          (r) =>
                            r.booleanResponse !== undefined ||
                            r.scaleResponse !== undefined ||
                            (r.textResponse && r.textResponse.trim() !== "")
                        ).length
                      }{" "}
                      de {questions.length} respondidas
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting || isDeadlineExpired}
                  className="w-full btn-gradient-accent"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Submetendo Avaliação...
                    </>
                  ) : isDeadlineExpired ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Prazo Expirado
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {existingEvaluation
                        ? "Atualizar Avaliação"
                        : "Submeter Avaliação"}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {isDeadlineExpired
                      ? "O prazo para avaliação deste artigo foi encerrado."
                      : existingEvaluation
                        ? "Suas alterações substituirão a avaliação anterior."
                        : "Certifique-se de revisar todos os campos antes de submeter."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
