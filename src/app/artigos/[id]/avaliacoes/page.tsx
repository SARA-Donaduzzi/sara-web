"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SubmitNewVersionModal } from "@/components/articles/SubmitNewVersionModal";
import {
  FileText,
  Star,
  MessageSquare,
  Calendar,
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { Article } from "@/types";
import toast from "react-hot-toast";

interface Evaluation {
  id: string;
  grade: number;
  evaluationDescription: string;
  evaluationDate: string;
  userId: string;
  articleVersionId: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
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
      status: string;
      evaluationsDone: number;
      event: {
        id: string;
        name: string;
        evaluationType: string;
      };
    };
  };
  checklistResponses?: Array<{
    id?: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
    question?: {
      id?: string;
      description?: string;
      type?: string;
      order?: number;
    };
  }>;
}

interface ArticleEvaluationsPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleEvaluationsPage({
  params,
}: ArticleEvaluationsPageProps) {
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

  // Buscar dados do artigo
  const {
    data: article,
    loading: articleLoading,
    execute: refetchArticle,
  } = useApi<{
    article: Article;
  }>(() => api.get(`/articles/${articleId}`), { immediate: !!articleId });

  // NOVA IMPLEMENTAÇÃO: Estado para avaliações com melhor tipagem
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);

  const fetchEvaluations = React.useCallback(async () => {
    if (!articleId) {
      return;
    }

    setEvaluationsLoading(true);
    setEvaluationsError(null);

    try {
      // USAR ENDPOINT CORRETO com parâmetros adequados
      const result = await api.get(
        `/evaluations?articleId=${articleId}&withChecklistResponses=true`
      );

      // EXTRAIR dados corretamente da resposta
      let extractedEvaluations: Evaluation[] = [];

      if (result && typeof result === "object") {
        // A resposta da API tem os dados em result.data.evaluations
        if (result.data && Array.isArray(result.data.evaluations)) {
          extractedEvaluations = result.data.evaluations;
        } else if (Array.isArray(result.evaluations)) {
          extractedEvaluations = result.evaluations;
        } else if (Array.isArray(result.data)) {
          extractedEvaluations = result.data;
        } else if (Array.isArray(result)) {
          extractedEvaluations = result;
        }
      }

      setEvaluations(extractedEvaluations);
    } catch (error: any) {
      console.error("Error fetching evaluations:", error); // Para debug

      if (error.status === 403) {
        setEvaluationsError("Você não tem permissão para ver essas avaliações");
      } else if (error.status === 404) {
        setEvaluationsError("Artigo não encontrado");
      } else if (error.status === 401) {
        setEvaluationsError("Sessão expirada. Faça login novamente");
      } else {
        setEvaluationsError(
          `Erro ao carregar avaliações: ${error.message || "Erro desconhecido"}`
        );
      }

      setEvaluations([]);
    } finally {
      setEvaluationsLoading(false);
    }
  }, [articleId]);

  // EXECUTAR busca quando artigo carregar
  React.useEffect(() => {
    if (article?.article.id) {
      fetchEvaluations();
    }
  }, [article?.article.id, fetchEvaluations]);

  // FUNÇÃO para recarregar avaliações
  const refetchEvaluations = React.useCallback(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const handleNewVersionSuccess = () => {
    toast.success("Nova versão submetida com sucesso!");
    refetchArticle();
    refetchEvaluations();
  };

  const getEvaluationStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "TO_CORRECTION":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEvaluationStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Aprovado";
      case "TO_CORRECTION":
        return "Necessita Correção";
      case "REJECTED":
        return "Rejeitado";
      default:
        return "Pendente";
    }
  };

  const getEvaluationStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "TO_CORRECTION":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return "text-green-600";
    if (grade >= 6) return "text-yellow-600";
    if (grade >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const calculateAverageGrade = (): number => {
    if (!evaluations || evaluations.length === 0) return 0;
    const validGrades = evaluations.filter(
      (e) => e.grade !== null && e.grade !== undefined
    );
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, e) => acc + (e.grade || 0), 0);
    return Number((sum / validGrades.length).toFixed(1));
  };

  const hasCorrections =
    evaluations?.some((e) => e.status === "TO_CORRECTION") || false;
  const canSubmitNewVersion =
    hasCorrections && (article?.article.status === "TO_CORRECTION" || "");

  if (articleLoading || evaluationsLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando avaliações..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está buscando não existe.
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
    { label: article.article.title, href: `/artigos/${articleId}` },
    { label: "Avaliações" },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.STUDENT]}>
      <PageLayout
        title="Avaliações do Artigo"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/artigos/${articleId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Artigo
            </Button>
            {canSubmitNewVersion && (
              <SubmitNewVersionModal
                articleId={articleId!}
                currentVersion={article.article.currentVersion}
                onSuccess={handleNewVersionSuccess}
              >
                <Button className="btn-gradient-accent">
                  <Upload className="mr-2 h-4 w-4" />
                  Submeter Nova Versão
                </Button>
              </SubmitNewVersionModal>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Informações do Artigo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {article.article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <StatusBadge status={article.article.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Versão Atual:</span>
                  <Badge variant="outline">
                    v{article.article.currentVersion}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Data de Submissão:
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(article.article.createdAt)}
                  </span>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-sm font-medium">Resumo:</span>
                <p className="text-sm text-gray-700 mt-1">
                  {article.article.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumo das Avaliações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Resumo das Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {evaluations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Avaliações Recebidas
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getGradeColor(
                      calculateAverageGrade()
                    )}`}
                  >
                    {calculateAverageGrade().toFixed(1)}/10
                  </div>
                  <div className="text-sm text-gray-600">Nota Média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Avaliações */}
          {evaluationsError ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Não foi possível carregar as avaliações
                </h3>
                <p className="text-gray-600 mb-4">
                  Talvez você não tenha permissão para ver essas avaliações ou o
                  artigo ainda não foi avaliado.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/artigos/${articleId}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Artigo
                </Button>
              </CardContent>
            </Card>
          ) : evaluations && evaluations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Avaliações Detalhadas</h3>
              {evaluations.map((evaluation, index) => (
                <Card key={evaluation.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getEvaluationStatusIcon(evaluation.status || "")}
                          <CardTitle className="text-lg">
                            Avaliação #{index + 1}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="text-right">
                        {evaluation.grade !== null &&
                          evaluation.grade !== undefined && (
                            <div
                              className={`text-xl font-bold ${getGradeColor(
                                evaluation.grade
                              )}`}
                            >
                              {evaluation.grade}/10
                            </div>
                          )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações do Avaliador */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {evaluation.evaluationDate
                            ? formatDate(evaluation.evaluationDate)
                            : "Data não disponível"}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Comentários da Avaliação */}
                    {evaluation.evaluationDescription && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Comentários e Feedback:
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {evaluation.evaluationDescription}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Respostas do Checklist (se houver) */}
                    {evaluation.checklistResponses &&
                      evaluation.checklistResponses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Respostas do Checklist de Avaliação:
                          </h4>
                          <div className="space-y-4">
                            {evaluation.checklistResponses.map(
                              (response, idx) => {
                                // Determinar o tipo de resposta e valor
                                let responseValue = "";
                                let responseType = "";
                                let badgeColor = "bg-gray-100 text-gray-800";

                                if (
                                  response.booleanResponse !== undefined &&
                                  response.booleanResponse !== null
                                ) {
                                  responseValue = response.booleanResponse
                                    ? "Sim"
                                    : "Não";
                                  responseType = "Sim/Não";
                                  badgeColor = response.booleanResponse
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800";
                                } else if (
                                  response.scaleResponse !== undefined &&
                                  response.scaleResponse !== null
                                ) {
                                  responseValue = `${response.scaleResponse}/5`;
                                  responseType = "Escala";
                                  if ((response.scaleResponse || 0) >= 4)
                                    badgeColor = "bg-green-100 text-green-800";
                                  else if ((response.scaleResponse || 0) >= 3)
                                    badgeColor =
                                      "bg-yellow-100 text-yellow-800";
                                  else badgeColor = "bg-red-100 text-red-800";
                                } else if (
                                  response.textResponse &&
                                  response.textResponse.trim() !== ""
                                ) {
                                  responseValue = response.textResponse;
                                  responseType = "Texto";
                                  badgeColor = "bg-blue-100 text-blue-800";
                                } else {
                                  responseValue = "Não respondido";
                                  responseType = "Vazio";
                                  badgeColor = "bg-gray-100 text-gray-500";
                                }

                                return (
                                  <div
                                    key={idx}
                                    className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                          {response.question?.description ||
                                            `Pergunta ${idx + 1}`}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {response.question?.type && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-purple-50 text-purple-700"
                                            >
                                              {response.question.type ===
                                              "YES_NO"
                                                ? "Sim/Não"
                                                : response.question.type ===
                                                  "SCALE"
                                                ? "Escala 1-5"
                                                : response.question.type ===
                                                  "TEXT"
                                                ? "Texto Livre"
                                                : response.question.type}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Valor da Resposta */}
                                    <div className="mt-3">
                                      <div className="text-sm font-medium text-gray-700 mb-1">
                                        Resposta:
                                      </div>
                                      <div className="bg-gray-50 rounded-md p-3">
                                        {responseType === "Texto" ? (
                                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {responseValue}
                                          </p>
                                        ) : (
                                          <span
                                            className={`text-sm font-medium ${
                                              responseType === "Sim/Não"
                                                ? response.booleanResponse
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                                : responseType === "Escala"
                                                ? (response.scaleResponse ||
                                                    0) >= 4
                                                  ? "text-green-700"
                                                  : (response.scaleResponse ||
                                                      0) >= 3
                                                  ? "text-yellow-700"
                                                  : "text-red-700"
                                                : "text-gray-700"
                                            }`}
                                          >
                                            {responseValue}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Informações extras da pergunta */}
                                    {response.question?.order && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        Pergunta #{response.question.order}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma avaliação disponível
                </h3>
                <p className="text-gray-600">
                  Seu artigo ainda não foi avaliado ou as avaliações ainda não
                  foram publicadas.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ações Disponíveis */}
          {canSubmitNewVersion && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Ação Necessária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 mb-4">
                  Seu artigo foi aprovado com correções. Você pode revisar os
                  comentários dos avaliadores acima e submeter uma nova versão
                  com as alterações solicitadas.
                </p>
                <SubmitNewVersionModal
                  articleId={articleId!}
                  currentVersion={article.article.currentVersion}
                  onSuccess={handleNewVersionSuccess}
                >
                  <Button className="btn-gradient-accent">
                    <Upload className="mr-2 h-4 w-4" />
                    Submeter Nova Versão
                  </Button>
                </SubmitNewVersionModal>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
