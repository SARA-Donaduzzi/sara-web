"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { articleService } from "@/lib/service/articleService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

// Icons
import {
  FileText,
  User,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Users,
  BarChart3,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

// Components
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { getStatusLabel, getStatusColor } from "@/lib/constants";
import { ReassignEvaluatorModal } from "@/components/modals/ReassignEvaluatorModal";
import { ROUTES, USER_ROLES } from "@/lib/utils";

// Types
import { Article, ArticleVersion, Evaluation } from "@/types";

interface ArticleEvaluator {
  id: string;
  name: string;
  email: string;
  isCorrected: boolean;
}

interface ArticleStats {
  totalVersions: number;
  totalEvaluations: number;
  averageGrade: number;
  completedEvaluators: number;
  assignedEvaluators: number;
  evaluationsByStatus: {
    approved: number;
    toCorrection: number;
    rejected: number;
  };
}

interface ChecklistResponseWithQuestion {
  id?: string;
  questionId: string;
  booleanResponse?: boolean;
  scaleResponse?: number;
  textResponse?: string;
  questionDescription?: string;
  questionType?: "YES_NO" | "SCALE" | "TEXT";
  question?: {
    description?: string;
    type?: "YES_NO" | "SCALE" | "TEXT";
  };
}

interface ArticleWithDetails extends Article {
  versions?: Array<
    ArticleVersion & {
      evaluations?: Array<
        Evaluation & {
          checklistResponses?: ChecklistResponseWithQuestion[];
        }
      >;
    }
  >;
  evaluators?: ArticleEvaluator[];
  stats?: ArticleStats;
}

export default function ArticleDetailsPage() {
  const { id: eventId, articleId } = useParams();
  const [article, setArticle] = useState<ArticleWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);

  useEffect(() => {
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const response = await articleService.getComplete(articleId as string);
      setArticle(response.data);
    } catch {
      toast.error("Erro ao carregar artigo");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
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
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
        <PageLayout>
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Artigo não encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                O artigo solicitado não existe ou você não tem permissão para visualizá-lo.
              </p>
              <Button asChild>
                <Link href={ROUTES.EVENT_ARTICLES(eventId as string)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Lista
                </Link>
              </Button>
            </div>
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Eventos", href: "/eventos" },
    { label: article.event?.name || "Evento", href: ROUTES.EVENT_DETAILS(eventId as string) },
    { label: "Artigos", href: ROUTES.EVENT_ARTICLES(eventId as string) },
    { label: article.title },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(article.status)}>
                  {getStatusLabel(article.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Versão {article.currentVersion}
                </span>
              </div>
              <h1 className="text-3xl font-bold">{article.title}</h1>
              <p className="text-muted-foreground mt-1">
                Evento: {article.event?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                asChild
              >
                <Link href={ROUTES.EVENT_ARTICLES(eventId as string)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setReassignModalOpen(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Alterar Avaliador
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="versions">Versões</TabsTrigger>
              <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            {/* Tab: Informações */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Autor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>Nome:</strong> {article.user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {article.user?.email}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Datas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <strong>Submetido em:</strong>{" "}
                      {format(new Date(article.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                    {article.updatedAt && (
                      <p>
                        <strong>Atualizado em:</strong>{" "}
                        {format(new Date(article.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Resumo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{article.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Palavras-chave</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Autores Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  {article.relatedAuthors && article.relatedAuthors.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {article.relatedAuthors.map((author: string, index: number) => (
                        <li key={index}>{author}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Nenhum autor relacionado</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Avaliadores Atribuídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {article.evaluators?.map((evaluator) => (
                      <div
                        key={evaluator.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{evaluator.name}</p>
                          <p className="text-sm text-muted-foreground">{evaluator.email}</p>
                        </div>
                        <Badge variant={evaluator.isCorrected ? "default" : "outline"}>
                          {evaluator.isCorrected ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Avaliou
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Pendente
                            </span>
                          )}
                        </Badge>
                      </div>
                    ))}
                    {(!article.evaluators || article.evaluators.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum avaliador atribuído
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Versões */}
            <TabsContent value="versions">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Versões</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {article.versions?.map((version) => (
                      <AccordionItem key={version.id} value={version.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-4">
                            <span>Versão {version.version}</span>
                            {version.version === article.currentVersion && (
                              <Badge>Atual</Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Enviada em:{" "}
                            {format(
                              new Date(version.createdAt),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </p>
                          <Button variant="outline" asChild>
                            <a
                              href={version.pdfPath}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar PDF
                            </a>
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {(!article.versions || article.versions.length === 0) && (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhuma versão encontrada
                      </p>
                    )}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Avaliações */}
            <TabsContent value="evaluations" className="space-y-4">
              {article.versions?.map((version) =>
                version.evaluations && version.evaluations.length > 0 ? (
                  <Card key={version.id}>
                    <CardHeader>
                      <CardTitle>Versão {version.version}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {version.evaluations.map((evaluation) => (
                        <Card
                          key={evaluation.id}
                          className="border-l-4 border-l-primary"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{evaluation.user.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {evaluation.user.email}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {evaluation.grade}/10
                                </p>
                                {evaluation.status && (
                                  <Badge className={getStatusColor(evaluation.status)}>
                                    {getStatusLabel(evaluation.status)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Comentários
                              </Label>
                              <p className="whitespace-pre-wrap mt-1 p-3 bg-muted rounded-lg">
                                {evaluation.evaluationDescription || "Sem comentários"}
                              </p>
                            </div>

                            {evaluation.checklistResponses &&
                              evaluation.checklistResponses.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Checklist
                                  </Label>
                                  <div className="mt-2 space-y-2">
                                    {(evaluation.checklistResponses as ChecklistResponseWithQuestion[]).map((response) => {
                                      const questionDesc =
                                        response.questionDescription ||
                                        response.question?.description ||
                                        "Pergunta não disponível";
                                      const questionType =
                                        response.questionType ||
                                        response.question?.type ||
                                        "TEXT";

                                      return (
                                        <div
                                          key={response.id || response.questionId}
                                          className="p-3 bg-muted rounded-lg"
                                        >
                                          <p className="font-medium text-sm">
                                            {questionDesc}
                                          </p>
                                          <div className="mt-1">
                                            {questionType === "YES_NO" && (
                                              <Badge
                                                variant={
                                                  response.booleanResponse
                                                    ? "default"
                                                    : "destructive"
                                                }
                                              >
                                                {response.booleanResponse ? (
                                                  <span className="flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Sim
                                                  </span>
                                                ) : (
                                                  <span className="flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" />
                                                    Não
                                                  </span>
                                                )}
                                              </Badge>
                                            )}
                                            {questionType === "SCALE" && (
                                              <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                      i < (response.scaleResponse || 0)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                            )}
                                            {questionType === "TEXT" && (
                                              <p className="text-sm italic">
                                                &ldquo;{response.textResponse || "Sem resposta"}
                                                &rdquo;
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ) : null
              )}
              {(!article.versions ||
                article.versions.every(
                  (v) => !v.evaluations || v.evaluations.length === 0
                )) && (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma avaliação encontrada
                  </h3>
                  <p className="text-gray-600">
                    Este artigo ainda não foi avaliado.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab: Estatísticas */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Total de Versões
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {article.stats?.totalVersions || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Total de Avaliações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {article.stats?.totalEvaluations || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Nota Média
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {(article.stats?.averageGrade || 0).toFixed(1)}/10
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Avaliadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {article.stats?.completedEvaluators || 0}/
                      {article.stats?.assignedEvaluators || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Concluíram avaliação
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Avaliações por Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Aprovados
                    </span>
                    <Badge variant="default">
                      {article.stats?.evaluationsByStatus?.approved || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Para Correção
                    </span>
                    <Badge variant="secondary">
                      {article.stats?.evaluationsByStatus?.toCorrection || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Rejeitados
                    </span>
                    <Badge variant="destructive">
                      {article.stats?.evaluationsByStatus?.rejected || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal */}
          <ReassignEvaluatorModal
            isOpen={reassignModalOpen}
            onClose={() => setReassignModalOpen(false)}
            articleId={articleId as string}
            eventId={eventId as string}
            currentAssignments={
              article.evaluators?.map((e) => ({
                id: e.id,
                userId: e.id,
                user: { id: e.id, name: e.name, email: e.email },
                isCorrected: e.isCorrected,
              })) || []
            }
            onSuccess={loadArticle}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
