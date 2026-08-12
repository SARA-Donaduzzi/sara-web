"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ChecklistForm } from "@/components/forms/ChecklistForm";
import {
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  FileText,
  CheckSquare,
  Circle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

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

interface ChecklistWithQuestions {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions: QuestionFromAPI[];
}

export default function ChecklistsPage() {
  // eslint-disable-next-line
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewQuestionsDialogOpen, setViewQuestionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistWithQuestions | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Buscar checklists COM questões em uma única requisição
  const {
    data: checklists,
    execute: refetchChecklists,
  } = useApi<ChecklistWithQuestions[]>(
    () => {
      const params = new URLSearchParams();
      params.append("withQuestions", "true"); // ✅ Endpoint correto
      if (debouncedSearch) params.append("search", debouncedSearch);
      return api.get(`/checklists?${params.toString()}`);
    },
    { immediate: true }
  );

  // Callback do formulário - recebe o ID do checklist criado
  const handleCreateChecklist = async () => {
    setCreateDialogOpen(false);
    await refetchChecklists(); // Recarrega a lista
    toast.success("Checklist criado com sucesso!");
  };

  // Soft delete - marca como inativo
  const handleDeleteChecklist = async () => {
    if (!selectedChecklist) return;

    try {
      // O backend faz soft delete (marca isActive = false)
      await api.delete(`/checklists/${selectedChecklist.id}`);

      toast.success(`Checklist "${selectedChecklist.name}" foi desativado!`);
      setDeleteDialogOpen(false);
      setSelectedChecklist(null);
      await refetchChecklists(); // Recarrega a lista
    } catch (error: any) {
      toast.error(error.message || "Erro ao desativar checklist");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "YES_NO":
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case "TEXT":
        return <FileText className="w-4 h-4 text-green-600" />;
      case "SCALE":
        return <Circle className="w-4 h-4 text-purple-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "YES_NO":
        return "Sim/Não";
      case "TEXT":
        return "Texto Livre";
      case "SCALE":
        return "Escala (1-10)";
      default:
        return type;
    }
  };

  const breadcrumbs = [{ label: "Checklists" }];

  const checklistColumns = [
    {
      key: "name",
      title: "Título",
      render: (value: string, checklist: ChecklistWithQuestions) => (
        <div>
          <p className="font-medium">{value}</p>
          {checklist.description && (
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {checklist.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "questions",
      title: "Perguntas",
      render: (_: any, checklist: ChecklistWithQuestions) => {
        const activeQuestions =
          checklist.questions?.filter((q) => q.isActive) || [];
          // eslint-disable-next-line
        const requiredCount = activeQuestions.filter(
          (q) => q.isRequired
        ).length;

        return (
          <div className="flex flex-col space-y-1">
            <Badge
              variant="secondary"
              className="flex items-center space-x-1 w-fit"
            >
              <ClipboardList className="w-3 h-3" />
              <span>
                {activeQuestions.length}{" "}
                {activeQuestions.length === 1 ? "pergunta" : "perguntas"}
              </span>
            </Badge>
          </div>
        );
      },
    },
    {
      key: "isActive",
      title: "Status",
      render: (isActive: boolean) => (
        <Badge variant={"default"}>{isActive ? "Ativo" : "Inativo"}</Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Criado em",
      render: (value: string) => (
        <span className="text-sm">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, checklist: ChecklistWithQuestions) => (
        <div className="flex space-x-2">
          {/* Botão Ver Perguntas */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedChecklist(checklist);
              setViewQuestionsDialogOpen(true);
            }}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Ver perguntas"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Botão Excluir (apenas para ativos) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedChecklist(checklist);
              setDeleteDialogOpen(true);
            }}
            disabled={!checklist.isActive}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
            title={
              checklist.isActive
                ? "Desativar checklist"
                : "Checklist já está inativo"
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout
        title="Checklists de Avaliação"
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient-accent text-white">
                <Plus className="mr-2 h-4 w-4" />
                Criar Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                  Criar Novo Checklist
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-1">
                <div className="bg-white">
                  <ChecklistForm onSubmit={handleCreateChecklist} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="space-y-6">
          {/* Lista de Checklists */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Checklists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={checklists || []}
                columns={checklistColumns}
                // loading={loading}
                // emptyMessage="Nenhum checklist encontrado"
                // emptyIcon={ClipboardList}
              />
            </CardContent>
          </Card>

          {/* ✅ MODAL PARA VER PERGUNTAS */}
          <Dialog
            open={viewQuestionsDialogOpen}
            onOpenChange={setViewQuestionsDialogOpen}
          >
            <DialogContent className="bg-white border border-gray-200 shadow-xl max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="pb-4 border-b border-gray-200">
                <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-primary" />
                  Perguntas do Checklist
                </DialogTitle>
                {selectedChecklist && (
                  <div className="mt-2">
                    <p className="text-lg font-medium text-gray-900">
                      {selectedChecklist.name}
                    </p>
                    {selectedChecklist.description && (
                      <p className="text-sm text-gray-600">
                        {selectedChecklist.description}
                      </p>
                    )}
                  </div>
                )}
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedChecklist?.questions &&
                selectedChecklist.questions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedChecklist.questions
                      .filter((q) => q.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((question, index) => (
                        <Card
                          key={question.id}
                          className="border border-gray-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                              </div>

                              <div className="flex-1 space-y-2">
                                <p className="font-medium text-gray-900">
                                  {question.description}
                                </p>

                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    {getQuestionTypeIcon(question.type)}
                                    <span className="text-sm text-gray-600">
                                      {getQuestionTypeLabel(question.type)}
                                    </span>
                                  </div>

                                  <Badge
                                    variant={
                                      question.isRequired
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={
                                      question.isRequired
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : "bg-green-100 text-green-800 border-green-200"
                                    }
                                  >
                                    {question.isRequired
                                      ? "Obrigatória"
                                      : "Opcional"}
                                  </Badge>
                                </div>

                                {/* Preview da resposta */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                  <p className="text-sm text-blue-800">
                                    <strong>Preview:</strong>{" "}
                                    {question.type === "YES_NO"
                                      ? "Resposta: Sim / Não"
                                      : question.type === "TEXT"
                                      ? "Resposta: Campo de texto livre"
                                      : "Resposta: Escala de 1 a 10"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhuma pergunta encontrada
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Este checklist não possui perguntas ativas.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer do modal */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedChecklist?.questions?.filter((q) => q.isActive)
                      .length || 0}{" "}
                    pergunta(s) ativa(s)
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setViewQuestionsDialogOpen(false)}
                    className="bg-white"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog de Confirmação de Exclusão (Soft Delete) */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Desativar Checklist"
            description={
              selectedChecklist ? (
                <div className="space-y-3">
                  <p>
                    Tem certeza que deseja desativar o checklist{" "}
                    <strong>&rsquo;{selectedChecklist.name}&rsquo;</strong>?
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          ⚠️ O que acontecerá:
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              O checklist será marcado como{" "}
                              <strong>inativo</strong>
                            </li>
                            <li>
                              Todas as{" "}
                              {selectedChecklist.questions?.filter(
                                (q) => q.isActive
                              ).length || 0}{" "}
                              pergunta(s) também serão desativadas
                            </li>
                            <li>
                              O checklist não aparecerá mais para novos eventos
                            </li>
                            <li>
                              Avaliações já feitas com este checklist não serão
                              afetadas
                            </li>
                            <li>
                              Esta ação{" "}
                              <strong>não poderá ser revertida</strong>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )
            }
            confirmText="Desativar"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleDeleteChecklist}
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
