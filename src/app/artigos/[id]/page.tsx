"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewer } from "@/components/common/PDFViewer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SubmitNewVersionModal } from "@/components/articles/SubmitNewVersionModal";
import { FileText, Download, Star, Upload, AlertTriangle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuthContext } from "@/providers/AuthProvider";
import { Article, Evaluation } from "@/types";
import { ROUTES, formatDate, formatUserRole, USER_ROLES } from "@/lib/utils";
import { canSubmitNewVersion } from "@/lib/validations";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = React.use(params);
  const { user } = useAuthContext();
  const router = useRouter();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // FUNÇÃO DE TESTE temporária para debug
  const handleTestEvaluations = async () => {
    try {
      const result = await api.get("/evaluations/debug/all");
      toast.success(
        `Debug: ${result.summary?.total || 0} avaliações encontradas`
      );
    } catch (error: any) {
      toast.error(`Debug falhou: ${error.message}`);
    }
  };

  // Buscar dados do artigo e suas avaliações
  const {
    data: article,
    loading: articleLoading,
    execute: refetchArticle,
  } = useApi<{ article: Article }>(() => api.get(`/articles/${id}`), {
    immediate: true,
  });

  // NOVA IMPLEMENTAÇÃO: Estado para avaliações com melhores tipos
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);

  // FUNÇÃO MELHORADA para buscar avaliações
  const fetchEvaluations = React.useCallback(async () => {
    if (!id || !user) {
      return;
    }

    setEvaluationsLoading(true);
    setEvaluationsError(null);

    try {
      // USAR ENDPOINT CORRETO baseado no role do usuário
      let endpoint = "";
      let queryParams = "";

      if (user.role === "STUDENT") {
        // Para estudantes: buscar avaliações do próprio artigo
        endpoint = `/evaluations`;
        queryParams = `?articleId=${id}&withChecklistResponses=true`;
      } else if (user.role === "EVALUATOR") {
        // Para avaliadores: buscar apenas suas próprias avaliações
        endpoint = `/evaluations`;
        queryParams = `?articleId=${id}&evaluatorId=${user.id}&withChecklistResponses=true`;
      } else if (user.role === "COORDINATOR") {
        // Para coordenadores: buscar todas as avaliações do artigo
        endpoint = `/evaluations`;
        queryParams = `?articleId=${id}&withChecklistResponses=true`;
      } else {
        throw new Error("Role de usuário não reconhecido");
      }

      const fullUrl = endpoint + queryParams;

      const result = await api.get(fullUrl);

      // EXTRAIR dados corretamente da resposta paginada
      let extractedEvaluations: Evaluation[] = [];

      if (result && typeof result === "object") {
        if (Array.isArray(result.evaluations)) {
          // Resposta paginada com estrutura {evaluations: [], total: number, ...}
          extractedEvaluations = result.evaluations;
        } else if (Array.isArray(result.data)) {
          // Resposta direta com array em data
          extractedEvaluations = result.data;
        } else if (Array.isArray(result)) {
          // Resposta direta como array
          extractedEvaluations = result;
        }
      }

      setEvaluations(extractedEvaluations);
    } catch (error: any) {
      // TRATAR diferentes tipos de erro
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
  }, [id, user]);

  // EXECUTAR busca quando artigo e usuário estiverem disponíveis
  React.useEffect(() => {
    if (article?.article.id && user?.id) {
      fetchEvaluations();
    }
  }, [article?.article.id, user?.id, fetchEvaluations]);

  // FUNÇÃO para recarregar avaliações
  const refetchEvaluations = React.useCallback(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const fileUrl =
    process.env.NEXT_PUBLIC_API_MINIO +
    "/submita-pdfs/" +
    (article?.article.versions?.find(
      (v) => v.version === article.article.currentVersion
    )?.pdfPath || article?.article.versions?.[0]?.pdfPath);

  const isAuthor = user?.id === article?.article.userId;
  const isEvaluator = user?.role === USER_ROLES.EVALUATOR;
  const isStudent = user?.role === USER_ROLES.STUDENT;

  // Verificar se pode submeter nova versão
  const canSubmitVersion =
    isAuthor && canSubmitNewVersion(article?.article.status || "");

  const handleWithdrawArticle = async () => {
    try {
      await api.delete(`/articles/${id}`);
      toast.success("Artigo retirado com sucesso!");
      window.location.href = ROUTES.ARTICLES;
    } catch (error: any) {
      toast.error(error.message || "Erro ao retirar artigo");
    }
  };

  const handleRejectArticle = async () => {
    try {
      setIsRejecting(true);

      await api.delete(`/articles/${id}/evaluators`, {
        data: { userId: user?.id },
      });

      toast.success("Artigo recusado com sucesso!");
      router.push(ROUTES.ARTICLES);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao recusar artigo");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await api.downloadFile(
        `/files/file/submita-pdfs?fileName=${article?.article.pdfPath}`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article?.article.title || "artigo"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Erro ao baixar arquivo");
    }
  };

  // Callback quando nova versão for submetida com sucesso
  const handleNewVersionSuccess = () => {
    refetchArticle();
    refetchEvaluations();
    toast.success("Nova versão submetida! O artigo voltará para avaliação.");
  };

  if (articleLoading) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando artigo..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard>
        <PageLayout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">
              Artigo não encontrado
            </h2>
            <p className="text-gray-600 mt-2">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Button asChild className="mt-4 btn-gradient-accent">
              <Link href={ROUTES.ARTICLES}>Voltar para artigos</Link>
            </Button>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Artigos", href: "/artigos" },
    { label: article.article.title },
  ];

  const canEvaluate =
    isEvaluator &&
    ["IN_EVALUATION", "SUBMITTED"].includes(article?.article.status || "");

  return (
    <AuthGuard>
      <PageLayout
        title={article.article.title}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            {article?.article.pdfPath && (
              <Button
                variant="outline"
                className="btn-event-accent"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}

            {/* ✅ Botão para submeter nova versão (apenas para autores quando necessário) */}
            {canSubmitVersion && (
              <SubmitNewVersionModal
                articleId={article.article.id}
                currentVersion={article.article.currentVersion}
                onSuccess={handleNewVersionSuccess}
              >
                <Button className="btn-gradient-accent">
                  <Upload className="mr-2 h-4 w-4" />
                  Submeter Versão {article.article.currentVersion + 1}
                </Button>
              </SubmitNewVersionModal>
            )}

            {canEvaluate && (
              <>
                <Button asChild className="btn-gradient-accent">
                  <Link href={ROUTES.EVALUATE_ARTICLE(article.article.id)}>
                    <Star className="mr-2 h-4 w-4" />
                    Avaliar
                  </Link>
                </Button>

                <Button
                  variant="default"
                  onClick={handleRejectArticle}
                  disabled={isRejecting}
                >
                  {isRejecting ? "Recusando..." : "Recusar"}
                </Button>
              </>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna do PDF - 2/3 da largura */}
          <Card className="lg:col-span-2">
            <CardContent>
              {article.article.versions![0].pdfPath ? (
                <PDFViewer
                  fileUrl={fileUrl}
                  fileName={fileUrl}
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

          {/* Coluna da direita - 1/3 da largura */}
          <div className="space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList
                className={`grid w-full ${
                  isEvaluator ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                <TabsTrigger value="overview" className="text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  Visão Geral
                </TabsTrigger>
                {!isEvaluator && (
                  <TabsTrigger value="evaluations" className="text-xs">
                    <Star className="mr-1 h-3 w-3" />
                    Avaliações
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab Visão Geral */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* ✅ Alert para status de correção */}
                {canSubmitVersion && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-800">
                          Correções Necessárias
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Seu artigo foi avaliado e necessita de correções.
                          Visualize as correções necessárias na tab "Avaliações"
                          e submeta uma nova versão corrigida.
                        </p>
                        <div className="mt-3">
                          <SubmitNewVersionModal
                            articleId={article.article.id}
                            currentVersion={article.article.currentVersion}
                            onSuccess={handleNewVersionSuccess}
                          >
                            <Button
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Submeter Versão Corrigida
                            </Button>
                          </SubmitNewVersionModal>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Informações Gerais
                    </CardTitle>
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
                  </CardContent>
                </Card>

                {/* Resumo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {article.article.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Evento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        {article.article.event?.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {article.article.event?.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          Submissões:{" "}
                          {formatDate(
                            article.article.event?.submissionStartDate
                          )}{" "}
                          -{" "}
                          {formatDate(article.article.event?.submissionEndDate)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {article.article.event?.evaluationType === "DIRECT"
                          ? "Avaliação Direta"
                          : article.article.event?.evaluationType === "PAIR"
                          ? "Avaliação por Pares"
                          : "Painel"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Avaliações - ESCONDIDO PARA AVALIADORES */}
              {!isEvaluator && (
                <TabsContent value="evaluations" className="space-y-4 mt-4">
                  {/* Avaliações Existentes */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Avaliações Recebidas
                        </CardTitle>
                        {evaluations && evaluations.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/artigos/${id}/avaliacoes`)
                            }
                          >
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {evaluationsLoading ? (
                        <div className="text-center py-4">
                          <LoadingSpinner text="Carregando avaliações..." />
                        </div>
                      ) : evaluationsError ? (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                          <p className="text-sm text-red-600">
                            {evaluationsError}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={refetchEvaluations}
                            className="mt-3"
                          >
                            Tentar Novamente
                          </Button>
                        </div>
                      ) : evaluations && evaluations.length > 0 ? (
                        <div className="space-y-4">
                          <Button
                            onClick={() =>
                              router.push(`/artigos/${id}/avaliacoes`)
                            }
                            className="w-full btn-gradient-accent"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Visualizar Avaliações Completas
                          </Button>

                          {/* Resumo rápido das avaliações */}
                          <div className="space-y-2">
                            {evaluations
                              .slice(0, 2)
                              .map((evaluation, index) => (
                                <div
                                  key={evaluation.id}
                                  className="border rounded-lg p-3 bg-gray-50"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p className="font-medium text-sm">
                                        Avaliação #{index + 1}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {evaluation.evaluationDate
                                          ? formatDate(
                                              evaluation.evaluationDate
                                            )
                                          : "Em andamento"}
                                      </p>
                                    </div>
                                    {evaluation.grade && (
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-primary">
                                          {evaluation.grade.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          / 10
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {evaluation.evaluationDescription && (
                                    <div className="mb-2">
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {evaluation.evaluationDescription
                                          .length > 100
                                          ? evaluation.evaluationDescription.substring(
                                              0,
                                              100
                                            ) + "..."
                                          : evaluation.evaluationDescription}
                                      </p>
                                    </div>
                                  )}

                                  {evaluation.status === "TO_CORRECTION" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Necessita Correção
                                    </Badge>
                                  )}
                                </div>
                              ))}

                            {evaluations.length > 2 && (
                              <div className="text-center text-sm text-gray-500 py-2">
                                e mais {evaluations.length - 2} avaliação(s)...
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Star className="mx-auto h-12 w-12 mb-3 text-gray-300" />
                          <p className="text-sm">
                            Nenhuma avaliação recebida ainda
                          </p>
                          {article.article.status === "SUBMITTED" && (
                            <p className="text-xs mt-2">
                              O artigo está aguardando atribuição de avaliadores
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Dialog de Confirmação de Retirada */}
        <ConfirmDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          title="Retirar Artigo"
          description="Tem certeza que deseja retirar este artigo? Esta ação não pode ser desfeita e o artigo será removido permanentemente do evento."
          confirmText="Retirar Artigo"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={handleWithdrawArticle}
        />
      </PageLayout>
    </AuthGuard>
  );
}
