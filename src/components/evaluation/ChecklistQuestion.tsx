// components/evaluation/ChecklistQuestion.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Question } from "@/types";

interface ChecklistQuestionProps {
  question: Question;
  value?: {
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  };
  onChange: (response: {
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }) => void;
  error?: string;
  disabled?: boolean;
}

export function ChecklistQuestion({
  question,
  value = {},
  onChange,
  error,
  disabled = false
}: ChecklistQuestionProps) {
  
  const handleBooleanChange = (selectedValue: string) => {
    onChange({
      booleanResponse: selectedValue === "true",
      scaleResponse: undefined,
      textResponse: undefined
    });
  };

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(event.target.value);
    if (numValue >= 1 && numValue <= 5) {
      onChange({
        booleanResponse: undefined,
        scaleResponse: numValue,
        textResponse: undefined
      });
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      booleanResponse: undefined,
      scaleResponse: undefined,
      textResponse: event.target.value
    });
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "YES_NO":
        return (
          <RadioGroup
            value={value.booleanResponse !== undefined ? value.booleanResponse.toString() : ""}
            onValueChange={handleBooleanChange}
            disabled={disabled}
            className="flex flex-row space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="true" 
                id={`${question.id}-yes`}
                disabled={disabled}
              />
              <Label 
                htmlFor={`${question.id}-yes`}
                className={disabled ? "text-gray-400" : "cursor-pointer"}
              >
                Sim
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="false" 
                id={`${question.id}-no`}
                disabled={disabled}
              />
              <Label 
                htmlFor={`${question.id}-no`}
                className={disabled ? "text-gray-400" : "cursor-pointer"}
              >
                Não
              </Label>
            </div>
          </RadioGroup>
        );

      case "SCALE":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="1"
                max="5"
                value={value.scaleResponse || ""}
                onChange={handleScaleChange}
                disabled={disabled}
                placeholder="1-5"
                className="w-16"
              />
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => !disabled && onChange({
                      booleanResponse: undefined,
                      scaleResponse: num,
                      textResponse: undefined
                    })}
                    disabled={disabled}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      value.scaleResponse === num
                        ? "bg-primary text-white"
                        : disabled
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Escala de 1 (inadequado) a 5 (excelente)
            </p>
            {value.scaleResponse && (
              <div className="text-xs">
                <Badge variant="outline" className="text-xs">
                  {value.scaleResponse === 1 && "Inadequado"}
                  {value.scaleResponse === 2 && "Abaixo da média"}
                  {value.scaleResponse === 3 && "Adequado"}
                  {value.scaleResponse === 4 && "Bom"}
                  {value.scaleResponse === 5 && "Excelente"}
                </Badge>
              </div>
            )}
          </div>
        );

      case "TEXT":
        return (
          <div className="space-y-2">
            <Textarea
              value={value.textResponse || ""}
              onChange={handleTextChange}
              disabled={disabled}
              placeholder="Digite sua resposta detalhada..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Máximo 1000 caracteres</span>
              <span className={
                (value.textResponse?.length || 0) > 900 ? "text-orange-600" : ""
              }>
                {value.textResponse?.length || 0}/1000
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <HelpCircle className="mx-auto h-6 w-6 mb-2" />
            <p className="text-sm">Tipo de questão não suportado</p>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 p-4 rounded-lg border ${
      error ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
    }`}>
      {/* Cabeçalho da questão */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-900 leading-relaxed">
            {question.description}
            {question.isRequired && (
              <span className="text-red-500 ml-1" title="Campo obrigatório">*</span>
            )}
          </Label>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Badge variant="outline" className="text-xs">
            {question.type === "YES_NO" && "Sim/Não"}
            {question.type === "SCALE" && "Escala"}
            {question.type === "TEXT" && "Texto"}
          </Badge>
          {question.isRequired && (
            <Badge variant="destructive" className="text-xs">
              Obrigatório
            </Badge>
          )}
        </div>
      </div>

      {/* Campo de entrada */}
      <div className="mt-3">
        {renderQuestionInput()}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-start space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Indicador de preenchimento */}
      <div className="flex justify-end">
        {(value.booleanResponse !== undefined || 
          value.scaleResponse !== undefined || 
          (value.textResponse && value.textResponse.trim() !== "")) && (
          <Badge variant="secondary" className="text-xs">
            ✓ Respondido
          </Badge>
        )}
      </div>
    </div>
  );
}

// Componente para lista de questões
interface ChecklistQuestionsListProps {
  questions: Question[];
  responses: Array<{
    questionId: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }>;
  onResponseChange: (questionIndex: number, response: {
    questionId: string;
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  }) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function ChecklistQuestionsList({
  questions,
  responses,
  onResponseChange,
  errors = {},
  disabled = false
}: ChecklistQuestionsListProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <HelpCircle className="mx-auto h-8 w-8 mb-3" />
        <p className="text-sm">Nenhuma questão de checklist configurada para este evento</p>
      </div>
    );
  }

  const getResponseForQuestion = (questionId: string): {
    booleanResponse?: boolean;
    scaleResponse?: number;
    textResponse?: string;
  } => {
    return responses.find(r => r.questionId === questionId) || {};
  };

  const getCompletionStats = () => {
    const required = questions.filter(q => q.isRequired).length;
    const completed = questions.filter(q => {
      const response = getResponseForQuestion(q.id);
      return response.booleanResponse !== undefined || 
             response.scaleResponse !== undefined || 
             (response.textResponse && response.textResponse.trim() !== "");
    }).length;
    
    return { required, completed, total: questions.length };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-sm font-medium">Progresso do Checklist</h3>
          <p className="text-xs text-gray-600 mt-1">
            {stats.completed} de {stats.total} questões respondidas
            {stats.required > 0 && ` • ${stats.required} obrigatórias`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {Math.round((stats.completed / stats.total) * 100)}%
          </div>
          <div className="text-xs text-gray-500">completo</div>
        </div>
      </div>

      {/* Lista de questões */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <ChecklistQuestion
            key={question.id}
            question={question}
            value={getResponseForQuestion(question.id)}
            onChange={(response) => onResponseChange(index, {
              questionId: question.id,
              ...response
            })}
            error={errors[`checklist_${question.id}`]}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
