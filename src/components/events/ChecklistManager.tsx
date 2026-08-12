"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  X,
  FileCheck,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Event } from "@/types";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// Helper para mapear tipos de questão para nomes amigáveis
const getQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case "YES_NO":
      return "Sim/Não";
    case "SCALE":
      return "Escala 1-5";
    case "TEXT":
      return "Texto livre";
    default:
      return type;
  }
};

interface ChecklistManagerProps {
  event: Event;
  onChecklistUpdated: () => void;
}

interface Checklist {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  questions?: Question[];
  _count?: {
    questions: number;
  };
}

interface Question {
  id: string;
  description: string;
  type: "YES_NO" | "TEXT" | "SCALE";
  isRequired: boolean;
  order?: number;
}

export function ChecklistManager({
  event,
  onChecklistUpdated,
}: ChecklistManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    data: checklists,
    loading: checklistsLoading,
    error: checklistsError,
  } = useApi<Checklist[]>(
    () => {
      return api
        .get("/checklists?isActive=true&withQuestions=true")
        .then((response) => {
          return response;
        });
    },
    { immediate: open }
  );

  const handleAssignChecklist = async () => {
    if (!selectedChecklistId) {
      toast.error("Selecione um checklist");
      return;
    }

    try {
      setIsAssigning(true);
      await api.patch(`/events/${event.id}/checklist`, {
        checklistId: selectedChecklistId,
      });

      toast.success("Checklist atribuído com sucesso!");
      setOpen(false);
      setSelectedChecklistId("");
      onChecklistUpdated();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao atribuir checklist"
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveChecklist = async () => {
    try {
      setIsRemoving(true);
      await api.delete(`/events/${event.id}/checklist`);

      toast.success("Checklist removido com sucesso!");
      setOpen(false);
      onChecklistUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao remover checklist");
    } finally {
      setIsRemoving(false);
    }
  };

  const hasChecklist = !!event.checklistId;
  const selectedChecklist = checklists?.find(
    (c) => c.id === selectedChecklistId
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <FileCheck className="mr-2 h-4 w-4" />
          {hasChecklist ? "Gerenciar Checklist" : "Atribuir Checklist"}
          {hasChecklist && (
            <Badge
              variant="secondary"
              className="ml-2 h-4 px-1 text-xs bg-green-100 text-green-800"
            >
              ✓
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-blue-600" />
            Gerenciar Checklist do Evento
          </DialogTitle>
          <DialogDescription>
            {hasChecklist
              ? "Altere ou remova o checklist atribuído a este evento."
              : "Selecione um checklist para ser usado na avaliação dos artigos."}
          </DialogDescription>
        </DialogHeader>

        {/* Status atual */}
        {hasChecklist && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Checklist Atual:</strong> {event.checklist?.name}
              {event.checklist?.description && (
                <div className="text-sm mt-1">
                  {event.checklist.description}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Seleção de checklist */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {hasChecklist
                ? "Trocar para outro checklist:"
                : "Selecionar checklist:"}
            </label>

            {checklistsLoading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Carregando checklists...
              </div>
            ) : checklistsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar checklists. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : !checklists || checklists.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Nenhum checklist disponível. Crie um checklist primeiro.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select
                  value={selectedChecklistId}
                  onValueChange={setSelectedChecklistId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um checklist" />
                  </SelectTrigger>
                  <SelectContent>
                    {checklists.map((checklist) => (
                      <SelectItem
                        key={checklist.id}
                        value={checklist.id}
                        disabled={checklist.id === event.checklistId}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{checklist.name}</div>
                            <div className="text-xs text-gray-500">
                              {checklist._count?.questions || 0} pergunta(s)
                            </div>
                          </div>
                          {checklist.id === event.checklistId && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Pré-visualização do checklist selecionado */}
                {selectedChecklist && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {selectedChecklist.name}
                    </h4>
                    {selectedChecklist.description && (
                      <p className="text-xs text-gray-600 mb-2">
                        {selectedChecklist.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {selectedChecklist._count?.questions || 0} pergunta(s)
                      </span>
                    </div>

                    {/* Lista de questões se disponível */}
                    {selectedChecklist.questions &&
                      selectedChecklist.questions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Questões:
                          </div>
                          {selectedChecklist.questions
                            .slice(0, 3)
                            .map((question, index) => (
                              <div
                                key={question.id}
                                className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200"
                              >
                                {index + 1}. {question.description}
                                <span className="ml-1 text-gray-400">
                                  ({getQuestionTypeLabel(question.type)})
                                </span>
                                {question.isRequired && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </div>
                            ))}
                          {selectedChecklist.questions.length > 3 && (
                            <div className="text-xs text-gray-500 pl-2">
                              ... e mais{" "}
                              {selectedChecklist.questions.length - 3}{" "}
                              questão(ões)
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between pt-4">
            {hasChecklist && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveChecklist}
                disabled={isRemoving}
              >
                <X className="mr-2 h-4 w-4" />
                {isRemoving ? "Removendo..." : "Remover Checklist"}
              </Button>
            )}

            <div className="flex space-x-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isAssigning || isRemoving}
              >
                Cancelar
              </Button>

              {selectedChecklistId &&
                selectedChecklistId !== event.checklistId && (
                  <Button
                    onClick={handleAssignChecklist}
                    disabled={isAssigning || isRemoving}
                    className="btn-gradient-accent"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isAssigning
                      ? "Atribuindo..."
                      : hasChecklist
                      ? "Alterar"
                      : "Atribuir"}
                  </Button>
                )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
