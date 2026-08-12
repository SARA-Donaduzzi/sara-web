"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Users, Plus, Search, UserMinus } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { User, Event } from "@/types";
import { ROUTES, USER_ROLES } from "@/lib/utils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface EventEvaluatorsPageProps {
  params: Promise<{ id: string }>;
}

export default function EventEvaluatorsPage({
  params,
}: EventEvaluatorsPageProps) {
  const { id } = React.use(params);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState<User | null>(null);
  const [selectedEvaluatorIds, setSelectedEvaluatorIds] = useState<string[]>(
    []
  );
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Busca informações do evento
  const { data: event, loading: eventLoading } = useApi<Event>(
    () => api.get(`/events/${id}`),
    { immediate: true }
  );

  // Busca avaliadores do evento
  const {
    data: eventEvaluators,
    loading: evaluatorsLoading,
    execute: refetchEventEvaluators,
  } = useApi<User[]>(() => api.get(`/events/${id}/evaluators`), {
    immediate: true,
  });

  // Busca todos os avaliadores disponíveis
  const { data: allEvaluators, loading: allEvaluatorsLoading } = useApi<User[]>(
    () => api.get("/users/evaluators"),
    { immediate: true }
  );

  const handleAddEvaluators = async () => {
    try {
      await api.post(`/events/${id}/evaluators`, {
        userIds: selectedEvaluatorIds,
      });

      toast.success(
        `${selectedEvaluatorIds.length} avaliador(es) adicionado(s) com sucesso!`
      );
      setAddDialogOpen(false);
      setSelectedEvaluatorIds([]);
      refetchEventEvaluators();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar avaliadores");
    }
  };

  const handleRemoveEvaluator = async () => {
    if (!selectedEvaluator) return;

    try {
      await api.delete(`/events/${id}/evaluators/${selectedEvaluator.id}`);
      toast.success("Avaliador removido com sucesso!");
      setRemoveDialogOpen(false);
      setSelectedEvaluator(null);
      refetchEventEvaluators();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover avaliador");
    }
  };

  // Melhoria na validação de avaliadores disponíveis
  const getEventEvaluatorsList = () => {
    if (!eventEvaluators) return [];

    // Se eventEvaluators é um array direto
    if (Array.isArray(eventEvaluators)) {
      return eventEvaluators;
    }

    // Se eventEvaluators tem uma propriedade evaluators
    if ((eventEvaluators as any)?.evaluators) {
      return (eventEvaluators as any).evaluators;
    }

    return [];
  };

  const getAllEvaluatorsList = () => {
    if (!allEvaluators) return [];

    // Se allEvaluators é um array direto
    if (Array.isArray(allEvaluators)) {
      return allEvaluators;
    }

    // Se allEvaluators tem uma propriedade evaluators
    if ((allEvaluators as any)?.evaluators) {
      return (allEvaluators as any).evaluators;
    }

    return [];
  };

  const availableEvaluators = (() => {
    const currentEventEvaluators = getEventEvaluatorsList();
    const allEvaluatorsList = getAllEvaluatorsList();

    return allEvaluatorsList.filter(
      (evaluator: any) =>
        !currentEventEvaluators.some(
          (eventEval: any) =>
            eventEval.id === evaluator.id ||
            eventEval.user?.id === evaluator.id ||
            eventEval.userId === evaluator.id
        )
    );
  })();

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
    { label: "Avaliadores" },
  ];

  const evaluatorColumns = [
    {
      key: "name",
      title: "Nome",
      render: (_: any, evaluator: any) => (
        <div>
          <p className="font-medium">{evaluator?.user?.name}</p>
          <p className="text-sm text-gray-500">{evaluator?.user?.email}</p>
        </div>
      ),
    },
    {
      key: "institution",
      title: "Instituição",
      render: (_: any, evaluator: any) => (
        <Badge variant={evaluator?.user?.isFromBpk ? "default" : "outline"}>
          {evaluator?.user?.isFromBpk ? "Biopark" : "Externa"}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_: any, evaluator: any) => (
        <Badge variant={"default"}>
          {evaluator?.user?.isActive ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, evaluator: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedEvaluator(evaluator);
            setRemoveDialogOpen(true);
          }}
        >
          <UserMinus className="h-4 w-4" />
        </Button>
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
                Avaliadores do Evento
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie os avaliadores responsáveis pelos artigos deste evento
              </p>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient-accent">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Avaliadores
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white">
                <DialogHeader>
                  <DialogTitle>Adicionar Avaliadores ao Evento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 bg-white">
                  {allEvaluatorsLoading ? (
                    <div className="flex justify-center py-8 bg-white">
                      <LoadingSpinner text="Carregando avaliadores..." />
                    </div>
                  ) : availableEvaluators.filter(
                      (evaluator: any) => evaluator.isActive !== false
                    ).length > 0 ? (
                    <>
                      <div className="relative bg-white">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar avaliadores..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white"
                        />
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2 bg-white">
                        {availableEvaluators
                          .filter(
                            (evaluator: any) => evaluator.isActive !== false
                          ) // Filtrar apenas ativos
                          .filter((evaluator: { name: string }) =>
                            evaluator.name
                              .toLowerCase()
                              .includes(debouncedSearch.toLowerCase())
                          )
                          .map((evaluator: any) => (
                            <div
                              key={evaluator.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 bg-white"
                            >
                              <input
                                type="checkbox"
                                id={evaluator.id}
                                checked={selectedEvaluatorIds.includes(
                                  evaluator.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEvaluatorIds([
                                      ...selectedEvaluatorIds,
                                      evaluator.id,
                                    ]);
                                  } else {
                                    setSelectedEvaluatorIds(
                                      selectedEvaluatorIds.filter(
                                        (id) => id !== evaluator.id
                                      )
                                    );
                                  }
                                }}
                                className="rounded"
                              />
                              <label
                                htmlFor={evaluator.id}
                                className="flex-1 cursor-pointer"
                              >
                                <div>
                                  <p className="font-medium">
                                    {evaluator.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {evaluator.email}
                                  </p>
                                </div>
                              </label>
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
                            setAddDialogOpen(false);
                            setSelectedEvaluatorIds([]);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddEvaluators}
                          disabled={selectedEvaluatorIds.length === 0}
                          className="btn-gradient-accent"
                        >
                          Adicionar {selectedEvaluatorIds.length} avaliador(es)
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white">
                      <Users className="mx-auto h-12 w-12 mb-4" />
                      <p>
                        {availableEvaluators.length === 0
                          ? "Todos os avaliadores já foram adicionados a este evento"
                          : "Nenhum avaliador ativo disponível para adicionar"}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Avaliadores
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getEventEvaluatorsList().length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avaliadores Ativos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getAllEvaluatorsList().filter(
                    (e: any) =>
                      e.user?.isActive !== false && e.isActive !== false
                  ).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Biopark</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getAllEvaluatorsList().filter(
                    (e: any) => e.user?.isFromBpk || e.isFromBpk
                  ).length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evaluators Table */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliadores do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              {evaluatorsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="Carregando avaliadores..." />
                </div>
              ) : getEventEvaluatorsList().length > 0 ? (
                <DataTable
                  data={getEventEvaluatorsList()}
                  columns={evaluatorColumns}
                />
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum avaliador adicionado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Adicione avaliadores para que possam avaliar os artigos
                    deste evento.
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Avaliador
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Remove Evaluator Dialog */}
          <ConfirmDialog
            open={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            title="Remover Avaliador"
            description={`Tem certeza que deseja remover este usuário como avaliador deste evento? Esta ação não pode ser desfeita.`}
            onConfirm={handleRemoveEvaluator}
            confirmText="Remover"
            variant="destructive"
          />
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
