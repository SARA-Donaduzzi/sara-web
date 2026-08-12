"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { evaluationSchema, EvaluationFormData } from "@/lib/validations";
import { Article, Question } from "@/types";

interface EvaluationFormProps {
  article: Article;
  questions: Question[];
  onSubmit: (data: EvaluationFormData) => Promise<void>;
  onSaveDraft?: (data: Partial<EvaluationFormData>) => Promise<void>;
  initialData?: Partial<EvaluationFormData>;
  isSubmitting?: boolean;
}

export function EvaluationForm({
  article,
  questions,
  onSubmit,
  onSaveDraft,
  initialData,
  isSubmitting = false,
}: EvaluationFormProps) {
  const [error, setError] = useState<string>("");
  const [isDraft, setIsDraft] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      grade: 0,
      evaluationDescription: "",
      responses: questions.map((q) => ({
        questionId: q.id,
        answer: "",
      })),
      ...initialData,
    },
  });

  const watchedGrade = watch("grade");
  const watchedResponses = watch("responses");

  const handleFormSubmit = async (data: EvaluationFormData) => {
    try {
      setError("");

      if (isDraft && onSaveDraft) {
        await onSaveDraft(data);
      } else {
        await onSubmit(data);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar avaliação");
    }
  };

  // const handleSaveDraft = () => {
  //   setIsDraft(true);
  //   handleSubmit(handleFormSubmit)();
  // };

  const handleFinalSubmit = () => {
    setIsDraft(false);
    handleSubmit(handleFormSubmit)();
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return "text-green-600";
    if (grade >= 6) return "text-yellow-600";
    if (grade >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const renderQuestion = (question: Question, index: number) => {
    const currentAnswer = watchedResponses[index]?.answer || "";

    switch (question.type) {
      case "YES_NO":
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value: string) =>
              setValue(`responses.${index}.answer`, value)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`}>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>Não</Label>
            </div>
          </RadioGroup>
        );

      case "SCALE":
        return (
          <div className="space-y-2">
            <Input
              type="range"
              min="1"
              max="10"
              value={currentAnswer || "1"}
              onChange={(e) =>
                setValue(`responses.${index}.answer`, e.target.value)
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 (Muito Ruim)</span>
              <span className="font-medium">{currentAnswer || "1"}</span>
              <span>10 (Excelente)</span>
            </div>
          </div>
        );

      case "TEXT":
      default:
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) =>
              setValue(`responses.${index}.answer`, e.target.value)
            }
            placeholder="Digite sua resposta..."
            rows={3}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações do Artigo */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Artigo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Título:</Label>
            <p className="text-sm text-gray-700 ">{article.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Resumo:</Label>
            <p className="text-sm text-gray-700 ">{article.summary}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Palavras-chave:</Label>
            <p className="text-sm text-gray-700 ">
              {/* {article.keywords.join(", ")} */}
              não tem keyword na resposta da API
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação do Artigo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nota Geral */}
            <div className="space-y-2">
              <Label htmlFor="grade">Nota geral (0-10) *</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="grade"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-20"
                  {...register("grade", { valueAsNumber: true })}
                />
                <span className={`font-medium ${getGradeColor(watchedGrade)}`}>
                  {watchedGrade}/10
                </span>
              </div>
              {errors.grade && (
                <p className="text-sm text-red-600">{errors.grade.message}</p>
              )}
            </div>

            {/* Comentários Gerais */}
            <div className="space-y-2">
              <Label htmlFor="evaluationDescription">
                Comentários e feedback *
              </Label>
              <Textarea
                id="evaluationDescription"
                placeholder="Forneça comentários detalhados sobre o artigo, pontos fortes, áreas para melhoria, etc."
                rows={6}
                {...register("evaluationDescription")}
              />
              {errors.evaluationDescription && (
                <p className="text-sm text-red-600">
                  {errors.evaluationDescription.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Checklist do Evento */}
            {questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Checklist de Avaliação</h3>
                {/* Descrição do checklist removida por não estar disponível na API */}

                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <Label className="text-sm font-medium flex items-start">
                      {question.description}
                      {question.isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {renderQuestion(question, index)}

                    {errors.responses?.[index] && (
                      <p className="text-sm text-red-600">
                        Esta pergunta é obrigatória
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Finalizando..." : "Finalizar avaliação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
