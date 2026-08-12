"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import {
  useForm,
  useFieldArray,
  FieldError,
  LiteralUnion,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  checklistBasicSchema,
  ChecklistBasicFormData,
} from "@/lib/validations";

// Tipos de pergunta disponíveis (baseado na API)
const QUESTION_TYPES = {
  YES_NO: "Sim/Não",
  TEXT: "Texto Livre",
  SCALE: "Escala (1-10)",
} as const;

type QuestionType = keyof typeof QUESTION_TYPES;

// Schema local para perguntas - corrigido para evitar conflitos de tipo
const questionFormSchema = z.object({
  description: z
    .string()
    .min(3, "Pergunta deve ter pelo menos 3 caracteres")
    .max(200, "Pergunta deve ter no máximo 200 caracteres")
    .transform((val) => val.trim()),
  type: z.enum(["YES_NO", "TEXT", "SCALE"], {
    required_error: "Tipo de pergunta é obrigatório",
    invalid_type_error: "Tipo de pergunta inválido",
  }),
  isRequired: z.boolean(),
});

const questionsFormSchema = z.object({
  questions: z
    .array(questionFormSchema)
    .min(1, "Pelo menos uma pergunta é obrigatória")
    .max(20, "Máximo de 20 perguntas permitidas"),
});

// Tipos inferidos localmente
type QuestionFormData = z.infer<typeof questionFormSchema>;
type QuestionsFormData = z.infer<typeof questionsFormSchema>;
type ChecklistBasicData = ChecklistBasicFormData;

interface ChecklistFormProps {
  onSubmit?: (checklistId: string) => void;
  initialData?: {
    title?: string;
    description?: string;
    questions?: QuestionFormData[];
  };
}

export function ChecklistForm({ onSubmit, initialData }: ChecklistFormProps) {
  const [currentStep, setCurrentStep] = useState<"basic" | "questions">(
    "basic"
  );
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form para dados básicos
  const basicForm = useForm<ChecklistBasicData>({
    resolver: zodResolver(checklistBasicSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  // Form para perguntas
  const questionsForm = useForm<QuestionsFormData>({
    resolver: zodResolver(questionsFormSchema),
    defaultValues: {
      questions: initialData?.questions || [
        {
          description: "",
          type: "YES_NO",
          isRequired: true,
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: questionsForm.control,
    name: "questions",
  });

  // Etapa 1: Criar checklist básico
  const handleBasicSubmit = async (data: ChecklistBasicData) => {
    try {
      setIsSubmitting(true);

      const response = await api.post("/checklists", {
        name: data.title,
        description: data.description,
      });

      setChecklistId(response.id);
      setCurrentStep("questions");

      toast.success("Checklist criado! Agora adicione as perguntas.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Etapa 2: Adicionar perguntas
  const handleQuestionsSubmit = async (data: QuestionsFormData) => {
    if (!checklistId) {
      toast.error("ID do checklist não encontrado");
      return;
    }

    try {
      setIsSubmitting(true);

      const questionsWithOrder = data.questions.map((question, index) => ({
        description: question.description,
        type: question.type,
        isRequired: question.isRequired,
        order: index + 1,
      }));

      await api.post(`/checklists/${checklistId}/questions`, {
        questions: questionsWithOrder,
      });

      toast.success("Checklist criado com sucesso!");
      onSubmit?.(checklistId);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para adicionar nova pergunta
  const addQuestion = () => {
    append({
      description: "",
      type: "YES_NO",
      isRequired: true,
    });
  };

  // Função para remover pergunta
  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("É necessário ter pelo menos uma pergunta");
    }
  };

  // Função para mover pergunta para cima
  const moveQuestionUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  // Função para mover pergunta para baixo
  const moveQuestionDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  // Helper para obter mensagem de erro
  const getErrorMessage = (error: any): string | undefined => {
    if (!error) return undefined;
    if (typeof error === "string") return error;
    if (typeof error === "object" && error.message) return error.message;
    return undefined;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "basic"
                ? "bg-blue-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            1
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">
            Informações Básicas
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === "questions"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-500"
            }`}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">
            Perguntas
          </span>
        </div>
      </div>

      {/* Etapa 1: Informações Básicas */}
      {currentStep === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Criar Checklist - Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={basicForm.handleSubmit(handleBasicSubmit)}
              className="space-y-4"
            >
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do Checklist *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Avaliação de Artigos Científicos"
                  {...basicForm.register("title")}
                />
                {basicForm.formState.errors.title && (
                  <p className="text-sm text-red-600">
                    {getErrorMessage(basicForm.formState.errors.title)}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o propósito e contexto deste checklist..."
                  rows={3}
                  {...basicForm.register("description")}
                />
                {basicForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {getErrorMessage(basicForm.formState.errors.description)}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner className="mr-2" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Próximo: Perguntas
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Etapa 2: Perguntas */}
      {currentStep === "questions" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Criar Checklist - Perguntas
              </div>
              <Badge variant="outline">{fields.length} pergunta(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={questionsForm.handleSubmit(handleQuestionsSubmit)}
              className="space-y-6"
            >
              {/* Lista de Perguntas */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Pergunta {index + 1}</Badge>
                        {/* Botões de reordenação */}
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestionUp(index)}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveQuestionDown(index)}
                            disabled={index === fields.length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        disabled={fields.length <= 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Descrição da pergunta */}
                      <div className="md:col-span-2">
                        <Label htmlFor={`questions.${index}.description`}>
                          Pergunta *
                        </Label>
                        <Textarea
                          id={`questions.${index}.description`}
                          placeholder="Digite sua pergunta..."
                          rows={2}
                          {...questionsForm.register(
                            `questions.${index}.description`
                          )}
                        />
                        {questionsForm.formState.errors.questions?.[index]
                          ?.description && (
                          <p className="text-sm text-red-600 mt-1">
                            {getErrorMessage(
                              questionsForm.formState.errors.questions[index]
                                ?.description
                            )}
                          </p>
                        )}
                      </div>

                      {/* Tipo de pergunta */}
                      <div>
                        <Label htmlFor={`questions.${index}.type`}>
                          Tipo de Resposta *
                        </Label>
                        <Select
                          value={questionsForm.watch(`questions.${index}.type`)}
                          onValueChange={(value: QuestionType) =>
                            questionsForm.setValue(
                              `questions.${index}.type`,
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(QUESTION_TYPES).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        {questionsForm.formState.errors.questions?.[index]
                          ?.type && (
                          <p className="text-sm text-red-600 mt-1">
                            {getErrorMessage(
                              questionsForm.formState.errors.questions[index]
                                ?.type
                            )}
                          </p>
                        )}
                      </div>

                      {/* Obrigatória */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <Label
                            htmlFor={`questions.${index}.isRequired`}
                            className={`text-sm font-medium ${
                              questionsForm.watch(
                                `questions.${index}.isRequired`
                              )
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {questionsForm.watch(
                              `questions.${index}.isRequired`
                            )
                              ? "Obrigatória"
                              : "Opcional"}
                          </Label>
                          <span className="text-xs text-gray-500">
                            {questionsForm.watch(
                              `questions.${index}.isRequired`
                            )
                              ? "Avaliador deve responder"
                              : "Resposta opcional"}
                          </span>
                        </div>
                        <Switch
                          checked={questionsForm.watch(
                            `questions.${index}.isRequired`
                          )}
                          onCheckedChange={(checked) =>
                            questionsForm.setValue(
                              `questions.${index}.isRequired`,
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Adicionar Pergunta */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  disabled={fields.length >= 20}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Pergunta
                  {fields.length >= 20 && " (Máximo atingido)"}
                </Button>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("basic")}
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                  className="flex items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner className="mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Criar Checklist
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
