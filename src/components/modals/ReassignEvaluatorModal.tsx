"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, UserX, UserPlus } from "lucide-react";
import { articleService } from "@/lib/service/articleService";
import { eventService } from "@/lib/service/eventService";
import toast from "react-hot-toast";
import { ReviewerSuggestionsPanel } from "@/components/forms/ReviewerSuggestionsPanel";

interface Evaluator {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  isCorrected: boolean;
}

interface ReassignEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  eventId: string;
  currentAssignments: Assignment[];
  onSuccess?: () => void;
}

export function ReassignEvaluatorModal({
  isOpen,
  onClose,
  articleId,
  eventId,
  currentAssignments,
  onSuccess,
}: ReassignEvaluatorModalProps) {
  const [selectedCurrentEvaluator, setSelectedCurrentEvaluator] =
    useState<string>("");
  const [selectedNewEvaluator, setSelectedNewEvaluator] = useState<string>("");
  const [availableEvaluators, setAvailableEvaluators] = useState<Evaluator[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvaluators, setIsLoadingEvaluators] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar avaliadores disponiveis do evento
  useEffect(() => {
    const loadAvailableEvaluators = async () => {
      setIsLoadingEvaluators(true);
      try {
        const response = await eventService.getEventEvaluators(eventId);
        // Filtrar apenas avaliadores que ainda nao estao atribuidos
        const assignedIds = currentAssignments.map((a) => a.userId);
        const available = response.filter(
          (e: Evaluator) => !assignedIds.includes(e.id)
        );
        setAvailableEvaluators(available);
      } catch {
        toast.error("Erro ao carregar avaliadores disponiveis");
      } finally {
        setIsLoadingEvaluators(false);
      }
    };

    if (isOpen && eventId) {
      loadAvailableEvaluators();
    }
  }, [isOpen, eventId, currentAssignments]);

  // Verificar se avaliador atual ja avaliou
  const hasCurrentEvaluatorEvaluated = (): boolean => {
    const assignment = currentAssignments.find(
      (a) => a.userId === selectedCurrentEvaluator
    );
    return assignment?.isCorrected || false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCurrentEvaluator || !selectedNewEvaluator) {
      setError("Selecione o avaliador atual e o novo avaliador");
      return;
    }

    if (hasCurrentEvaluatorEvaluated()) {
      setError("Nao e possivel alterar um avaliador que ja realizou a avaliacao");
      return;
    }

    setIsLoading(true);
    try {
      await articleService.reassignEvaluator(
        articleId,
        selectedCurrentEvaluator,
        selectedNewEvaluator
      );

      toast.success("Avaliador alterado com sucesso!");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao alterar avaliador";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCurrentEvaluator("");
    setSelectedNewEvaluator("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Alterar Avaliador
          </DialogTitle>
          <DialogDescription>
            Troque o avaliador de um artigo que ainda nao foi avaliado.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEvaluator">Avaliador Atual</Label>
            <Select
              value={selectedCurrentEvaluator}
              onValueChange={setSelectedCurrentEvaluator}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o avaliador atual" />
              </SelectTrigger>
              <SelectContent>
                {currentAssignments.map((assignment) => (
                  <SelectItem
                    key={assignment.userId}
                    value={assignment.userId}
                    disabled={assignment.isCorrected}
                  >
                    {assignment.user.name}
                    {assignment.isCorrected && " (Ja avaliou)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCurrentEvaluator && hasCurrentEvaluatorEvaluated() && (
              <p className="text-sm text-red-600">
                Este avaliador ja realizou a avaliacao e nao pode ser alterado.
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <UserPlus className="w-6 h-6 text-gray-400" />
          </div>

          <ReviewerSuggestionsPanel
            articleId={articleId}
            eventId={eventId}
            onSelect={(evaluatorId) => setSelectedNewEvaluator(evaluatorId)}
          />

          <div className="space-y-2">
            <Label htmlFor="newEvaluator">
              Novo Avaliador
              {isLoadingEvaluators && (
                <span className="text-sm text-gray-500 ml-2">
                  (Carregando...)
                </span>
              )}
            </Label>
            <Select
              value={selectedNewEvaluator}
              onValueChange={setSelectedNewEvaluator}
              disabled={isLoading || isLoadingEvaluators}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo avaliador" />
              </SelectTrigger>
              <SelectContent>
                {availableEvaluators.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhum avaliador disponivel
                  </SelectItem>
                ) : (
                  availableEvaluators.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.id}>
                      {evaluator.name} ({evaluator.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {availableEvaluators.length === 0 && !isLoadingEvaluators && (
              <p className="text-sm text-amber-600">
                Nao ha avaliadores disponiveis. Adicione mais avaliadores ao
                evento.
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !selectedCurrentEvaluator ||
                !selectedNewEvaluator ||
                hasCurrentEvaluatorEvaluated()
              }
            >
              {isLoading ? "Alterando..." : "Alterar Avaliador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
