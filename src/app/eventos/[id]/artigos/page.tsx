"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  FileText,
  Users,
  Eye,
  Download,
  UserCheck,
  BarChart3,
  UserCog,
} from "lucide-react";
import { ReassignEvaluatorModal } from "@/components/modals/ReassignEvaluatorModal";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Article, Event, User } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface EventArticlesPageProps {
  params: Promise<{ id: string }>;
}

export default function EventArticlesPage({ params }: EventArticlesPageProps) {
  const { id } = React.use(params);
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // eslint-disable-next-line
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<string[]>(
    []
  );
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [evaluatorsLoading, setEvaluatorsLoading] = useState(false);
  const [evaluatorsError, setEvaluatorsError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Busca informações do evento
  const { data: event, loading: eventLoading } = useApi<Event>(
    () => api.get(`/events/${id}`),
    { immediate: true }
  );

  // Busca artigos do evento
  const {
    data: articlesRaw,
    loading: articlesLoading,
    execute: refetchArticles,
  } = useApi<any[]>(
    () => {
      const params_query = new URLSearchParams();
      if (debouncedSearch) params_query.append("search", debouncedSearch);
      if (statusFilter !== "all") params_query.append("status", statusFilter);
      if (submissionTypeFilter !== "all") params_query.append("submissionType", submissionTypeFilter);

      return api.get(`/events/${id}/articles?${params_query.toString()}`);
    },
    {
      immediate: true,
    }
  );

  // Processar artigos para incluir avaliadores
  const articles = React.useMemo(() => {
    if (!articlesRaw) return null;

    return articlesRaw.map((article: any) => ({
      ...article,
      // Extrair avaliadores dos assignments
      evaluators:
        article.evaluatorAssignments
          ?.map((assignment: any) => ({
            id: assignment.eventEvaluator?.user?.id,
            name: assignment.eventEvaluator?.user?.name,
            email: assignment.eventEvaluator?.user?.email,
          }))
          .filter((evaluator: any) => evaluator.id) || [],
      // Manter contagem para referência
      evaluatorCount: article._count?.evaluatorAssignments || 0,
    }));
  }, [articlesRaw]);

  // Função para carregar avaliadores
  const loadEvaluators = async () => {
    setEvaluatorsLoading(true);
    setEvaluatorsError(null);

    try {
      const response = await api.get(`/events/${id}/evaluators`);

      const evaluatorsData =
        response?.data?.evaluators || response?.evaluators || [];

      if (Array.isArray(evaluatorsData)) {
        const processedEvaluators = evaluatorsData
          .filter((item: any) => {
            const isItemActive = item.isActive !== false;
            const isUserActive = item.user?.isActive !== false;
            return isItemActive && isUserActive;
          })
          .map((item: any) => ({
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            role: item.user.role,
            isFromBpk: item.user.isFromBpk,
            isActive: item.user.isActive,
            createdAt: new Date(item.user.createdAt || Date.now()),
            updatedAt: item.user.updatedAt
              ? new Date(item.user.updatedAt)
              : undefined,
          }));

        setEvaluators(processedEvaluators);
      } else {
        setEvaluators([]);
      }
    } catch (error: any) {
      setEvaluatorsError(error.message || "Erro ao carregar avaliadores");
      setEvaluators([]);
    } finally {
      setEvaluatorsLoading(false);
    }
  };

  // Carrega avaliadores quando o diálogo é aberto
  React.useEffect(() => {
    if (assignDialogOpen) {
      loadEvaluators();
    }
  }, [assignDialogOpen, id]);

  const handleAssignEvaluators = async () => {
    if (!selectedArticle) return;

    try {
      await api.post(`/articles/${selectedArticle.id}/evaluators`, {
        evaluators: selectedEvaluatorIds,
      });

      toast.success("Avaliadores atribuídos com sucesso!");
      setAssignDialogOpen(false);
      setSelectedArticle(null);
      setSelectedEvaluatorIds([]);
      refetchArticles();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atribuir avaliadores");
    }
  };

  if (eventLoading) {
    return (
      <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
        <PageLayout>
          <div className="flex justify-center py-8">
            <LoadingSpinner text="Carregando evento..." />
          </div>
        </PageLayout>
      </AuthGuard>
    );
  }

  const breadcrumbs = [
    { label: "Eventos", href: "/eventos" },
    { label: event?.name || "Evento", href: ROUTES.EVENT_DETAILS(id) },
    { label: "Artigos" },
  ];

  const articleColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, article: Article) => (
        <div>
          <Link
            href={ROUTES.ARTICLE_DETAILS(article.id)}
            className="font-medium text-primary hover:underline"
          >
            {value}
          </Link>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: "versionType",
      title: "Tipo",
      render: (_: any, article: Article) => {
        const currentVersion = (article as any).currentVersion;

        if (currentVersion === 1) {
          return (
            <Badge className="bg-primary hover:bg-primary/90">
              1º Envio
            </Badge>
          );
        } else {
          return (
            <Badge variant="secondary">
              Correção (v{currentVersion})
            </Badge>
          );
        }
      },
    },
    {
      key: "createdAt",
      title: "Data de Submissão",
      render: (value: string) => formatDate(value),
    },
    {
      key: "evaluators",
      title: "Avaliadores",
      render: (value: User[], article: Article) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {value?.length || 0} atribuído(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedArticle(article);
              setSelectedEvaluatorIds(
                value?.map((evaluator) => evaluator.id) || []
              );
              setAssignDialogOpen(true);
            }}
          >
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, article: Article) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {article.pdfPath && (
            <Button variant="ghost" size="sm" asChild>
              <a
                href={article.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedArticle(article);
              setReassignModalOpen(true);
            }}
            disabled={
              article.status === "APPROVED" || article.status === "REJECTED"
            }
            title="Alterar avaliador"
          >
            <UserCog className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Artigos do Evento
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie os artigos submetidos para este evento
              </p>
            </div>
            <Button asChild>
              <Link
                href={ROUTES.EVENT_EVALUATORS(id)}
                className="btn-gradient-accent"
              >
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Avaliadores
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Artigos
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Atribuídos
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => (a.evaluatorCount || 0) > 0)
                    .length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => a.status === "APPROVED").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {articles?.filter((a) => a.status === "SUBMITTED").length ||
                    0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Articles Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lista de Artigos</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar por:</span>
                <Select
                  value={submissionTypeFilter}
                  onValueChange={setSubmissionTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de envio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="first">Primeiro Envio</SelectItem>
                    <SelectItem value="correction">Correções</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="Carregando artigos..." />
                </div>
              ) : articles && articles.length > 0 ? (
                <DataTable data={articles} columns={articleColumns} />
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum artigo encontrado
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all" || submissionTypeFilter !== "all"
                      ? "Nenhum artigo corresponde aos filtros aplicados."
                      : "Ainda não há artigos submetidos para este evento."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reassign Evaluator Modal */}
          {selectedArticle && (
            <ReassignEvaluatorModal
              isOpen={reassignModalOpen}
              onClose={() => {
                setReassignModalOpen(false);
                setSelectedArticle(null);
              }}
              articleId={selectedArticle.id}
              eventId={id}
              currentAssignments={
                // @ts-expect-error - evaluatorAssignments e uma propriedade do response
                selectedArticle.evaluatorAssignments || []
              }
              onSuccess={() => {
                refetchArticles();
              }}
            />
          )}

          {/* Assign Evaluators Dialog */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>Atribuir Avaliadores</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 bg-white">
                {selectedArticle && (
                  <div className="p-4 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                    <h4 className="font-medium">{selectedArticle.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedArticle.summary}
                    </p>
                  </div>
                )}

                {evaluatorsLoading ? (
                  <div className="flex justify-center py-8 bg-white">
                    <LoadingSpinner text="Carregando avaliadores..." />
                  </div>
                ) : evaluatorsError ? (
                  <div className="text-center py-8 text-red-500 bg-white">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="font-medium text-red-900 mb-2">
                      Erro ao carregar avaliadores
                    </h3>
                    <p className="text-red-600 mb-4">
                      {evaluatorsError ||
                        "Não foi possível carregar os avaliadores do evento"}
                    </p>
                    <Button onClick={() => loadEvaluators()} variant="outline">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : evaluators &&
                  Array.isArray(evaluators) &&
                  evaluators.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-600 mb-3">
                      Selecione os avaliadores para este artigo (
                      {evaluators.length} disponível(is)):
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2 bg-white">
                      {evaluators.map((evaluator) => (
                        <div
                          key={evaluator.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 bg-white cursor-pointer"
                          onClick={() => {
                            const isSelected = selectedEvaluatorIds.includes(
                              evaluator.id
                            );
                            if (isSelected) {
                              setSelectedEvaluatorIds(
                                selectedEvaluatorIds.filter(
                                  (id) => id !== evaluator.id
                                )
                              );
                            } else {
                              setSelectedEvaluatorIds([
                                ...selectedEvaluatorIds,
                                evaluator.id,
                              ]);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            id={evaluator.id}
                            checked={selectedEvaluatorIds.includes(
                              evaluator.id
                            )}
                            onChange={() => {}} // Controlled by onClick above
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{evaluator.name}</p>
                            <p className="text-sm text-gray-500">
                              {evaluator.email}
                            </p>
                          </div>
                          <Badge
                            variant={
                              evaluator.isFromBpk ? "default" : "outline"
                            }
                          >
                            {evaluator.isFromBpk ? "Biopark" : "Externa"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t bg-white">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAssignDialogOpen(false);
                          setSelectedArticle(null);
                          setSelectedEvaluatorIds([]);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAssignEvaluators}
                        disabled={selectedEvaluatorIds.length === 0}
                        className="btn-gradient-accent"
                      >
                        Atribuir {selectedEvaluatorIds.length} avaliador(es)
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-white">
                    <Users className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Nenhum avaliador atribuído ao evento
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Este evento ainda não possui avaliadores atribuídos.
                      Adicione avaliadores ao evento primeiro.
                    </p>
                    <div className="space-y-2">
                      <Button asChild>
                        <Link href={ROUTES.EVENT_EVALUATORS(id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Adicionar Avaliadores ao Evento
                        </Link>
                      </Button>
                      <div className="text-xs text-gray-500">
                        Você precisa primeiro adicionar avaliadores ao evento
                        para poder atribuí-los aos artigos
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
