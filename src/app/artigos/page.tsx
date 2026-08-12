"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { FileText, Plus, Calendar, User, Eye, Edit } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthContext } from "@/providers/AuthProvider";
import { Article } from "@/types";
import { ROUTES, formatDate, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ArticlesPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);

  // Função para recusar avaliação de artigo
  const handleRejectArticle = async (articleId: string) => {
    try {
      setIsRejecting(articleId);

      // Usar o endpoint DELETE que agora permite avaliadores
      await api.delete(`/articles/${articleId}/evaluators`, {
        data: { userId: user?.id },
      });

      toast.success("Artigo recusado com sucesso!");

      // Recarregar a lista
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao recusar artigo");
    } finally {
      setIsRejecting(null);
    }
  };

  // FUNÇÃO PARA DETERMINAR O ENDPOINT BASEADO NO ROLE
  const getArticlesEndpoint = () => {
    if (!user) return null;

    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (statusFilter !== "all") params.append("status", statusFilter);

    const queryString = params.toString();

    switch (user.role) {
      case USER_ROLES.STUDENT:
        return `dashboard/student/articles${
          queryString ? `?${queryString}` : ""
        }`;
      case USER_ROLES.EVALUATOR:
        return `dashboard/evaluator/articles${
          queryString ? `?${queryString}` : ""
        }`;
      case USER_ROLES.COORDINATOR:
        return `dashboard/coordinator/articles${
          queryString ? `?${queryString}` : ""
        }`;
      default:
        return null;
    }
  };

  const {
    data: articlesResponse,
    loading,
    error,
  } = useApi<any>(
    () => {
      const endpoint = getArticlesEndpoint();
      if (!endpoint) {
        throw new Error("Endpoint não definido para o role do usuário");
      }

      return api.get(endpoint);
    },
    {
      immediate: !!user && !!getArticlesEndpoint(),
    }
  );

  // Processar a resposta baseado no role
  const articles = React.useMemo(() => {
    if (!articlesResponse) return [];

    // Para estudante: resposta direta é array
    if (user?.role === USER_ROLES.STUDENT) {
      return Array.isArray(articlesResponse) ? articlesResponse : [];
    }

    // Para avaliador: resposta tem estrutura { articles, total, etc }
    if (user?.role === USER_ROLES.EVALUATOR) {
      return articlesResponse.articles || [];
    }

    // Para coordenador: resposta direta é array
    if (user?.role === USER_ROLES.COORDINATOR) {
      return Array.isArray(articlesResponse) ? articlesResponse : [];
    }

    return [];
  }, [articlesResponse, user?.role]);

  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isEvaluator = user?.role === USER_ROLES.EVALUATOR;
  const isCoordinator = user?.role === USER_ROLES.COORDINATOR;

  const breadcrumbs = [{ label: "Artigos" }];

  // TÍTULO BASEADO NO ROLE
  const getPageTitle = () => {
    switch (user?.role) {
      case USER_ROLES.STUDENT:
        return "Meus Artigos";
      case USER_ROLES.EVALUATOR:
        return "Artigos para Avaliação";
      case USER_ROLES.COORDINATOR:
        return "Todos os Artigos";
      default:
        return "Artigos";
    }
  };

  // MENSAGEM VAZIA BASEADA NO ROLE
  const getEmptyMessage = () => {
    switch (user?.role) {
      case USER_ROLES.STUDENT:
        return "Você ainda não submeteu nenhum artigo";
      case USER_ROLES.EVALUATOR:
        return "Nenhum artigo atribuído para avaliação";
      case USER_ROLES.COORDINATOR:
        return "Nenhum artigo encontrado";
      default:
        return "Nenhum artigo encontrado";
    }
  };

  const articleColumns = [
    {
      key: "title",
      title: "Título",
      render: (value: string, article: Article) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-gray-500">
            Versão {article.currentVersion}
          </p>
        </div>
      ),
    },
    {
      key: "event",
      title: "Evento",
      render: (_: any, article: Article) => (
        <span className="text-sm">
          {article.event?.name || "Evento não encontrado"}
        </span>
      ),
    },
    // MOSTRAR AUTOR APENAS PARA COORDENADOR (avaliador não terá mais esses dados por privacidade)
    ...(isCoordinator
      ? [
          {
            key: "author",
            title: "Autor",
            render: (_: any, article: Article) => (
              <span className="text-sm">
                {article.user?.name || "Autor não encontrado"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "status",
      title: "Status",
      render: (_: any, article: Article) => (
        <StatusBadge status={article.status} />
      ),
    },
    {
      key: "submissionDate",
      title: "Data de Submissão",
      render: (_: any, article: Article) => (
        <div className="text-sm">
          <p>{formatDate(article.createdAt)}</p>
          {article.updatedAt && article.updatedAt !== article.createdAt && (
            <p className="text-gray-500">
              Atualizado em {formatDate(article.updatedAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, article: Article) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          {isEvaluator && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="btn-gradient-accent"
              >
                <Link href={ROUTES.EVALUATE_ARTICLE(article.id)}>Avaliar</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleRejectArticle(article.id)}
                disabled={isRejecting === article.id}
              >
                {isRejecting === article.id ? "Recusando..." : "Recusar"}
              </Button>
            </div>
          )}

          {isStudent && article.user?.id === user?.id && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ];

  // TRATAMENTO DE ERRO
  if (error) {
    return (
      <AuthGuard>
        <PageLayout title="Artigos" breadcrumbs={breadcrumbs}>
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Erro ao carregar artigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Não foi possível carregar os artigos no momento.
              </p>
              <p className="text-sm text-red-600 mt-1">Erro: {error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout
        title={getPageTitle()}
        breadcrumbs={breadcrumbs}
        actions={
          <RoleGuard allowedRoles={[USER_ROLES.STUDENT]}>
            <Button asChild className="btn-gradient-accent">
              <Link href={ROUTES.SUBMIT_ARTICLE}>
                <Plus className="mr-2 h-4 w-4" />
                Submeter Artigo
              </Link>
            </Button>
          </RoleGuard>
        }
      >
        <div className="space-y-6">
          {/* Lista de Artigos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {getPageTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="Carregando artigos..." />
                </div>
              ) : articles && articles.length > 0 ? (
                <DataTable data={articles} columns={articleColumns} />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Nenhum artigo encontrado"
                  description={getEmptyMessage()}
                />
              )}
            </CardContent>
          </Card>

          {/* Cards de Artigos para Mobile */}
          {articles && articles.length > 0 && (
            <div className="md:hidden space-y-4">
              {articles.map((article: any) => (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    (window.location.href = ROUTES.ARTICLE_DETAILS(article.id))
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {article.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {article.event?.name}
                        </p>
                      </div>
                      <StatusBadge status={article.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Mostrar autor apenas para coordenador */}
                    {isCoordinator && (
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="mr-2 h-4 w-4" />
                        {article.user?.name}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDate(article.createdAt)}
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        Versão {article.currentVersion}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={ROUTES.ARTICLE_DETAILS(article.id)}>
                            Ver Detalhes
                          </Link>
                        </Button>

                        {isEvaluator && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link href={ROUTES.EVALUATE_ARTICLE(article.id)}>
                                Avaliar
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectArticle(article.id);
                              }}
                              disabled={isRejecting === article.id}
                            >
                              {isRejecting === article.id
                                ? "Recusando..."
                                : "Recusar"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
