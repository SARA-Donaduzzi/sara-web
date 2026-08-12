"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { eventService } from "@/lib/service/eventService";
import { toast } from "react-hot-toast";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Mail,
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
} from "lucide-react";

// Constants
import { ARTICLE_STATUS, getStatusLabel } from "@/lib/constants";

interface EmailResult {
  totalRecipients: number;
  sent: number;
  failed: number;
  errors: string[];
}

export default function BulkEmailPage() {
  const { id: eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);

  const [formData, setFormData] = useState({
    filters: {
      roles: [] as ("STUDENT" | "EVALUATOR")[],
      articleStatus: "",
    },
    subject: "",
    body: "",
  });

  const handleRoleToggle = (role: "STUDENT" | "EVALUATOR") => {
    setFormData((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        roles: prev.filters.roles.includes(role)
          ? prev.filters.roles.filter((r) => r !== role)
          : [...prev.filters.roles, role],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.filters.roles.length === 0) {
      toast.error("Selecione pelo menos um tipo de destinatário");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Digite o assunto do email");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Digite o corpo do email");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await eventService.sendBulkEmail(eventId as string, {
        filters: {
          roles: formData.filters.roles,
          articleStatus: formData.filters.articleStatus || undefined,
        },
        subject: formData.subject,
        body: formData.body,
      });

      setResult(response.data);
      toast.success(
        `Emails enviados: ${response.data.sent} de ${response.data.totalRecipients}`
      );
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao enviar emails";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Contar destinatários estimados (simplificado)
  const getEstimatedRecipients = () => {
    const roles = formData.filters.roles;
    if (roles.length === 0) return "0";
    if (roles.length === 2) return "Todos os participantes";
    return roles.includes("STUDENT") ? "Autores" : "Avaliadores";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Email em Massa
        </h1>
        <p className="text-muted-foreground">
          Envie comunicados para autores e avaliadores do evento
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Destinatários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Destinatários
            </CardTitle>
            <CardDescription>Selecione quem receberá o email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Roles */}
            <div className="space-y-2">
              <Label>Tipo de Participantes</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-student"
                    checked={formData.filters.roles.includes("STUDENT")}
                    onCheckedChange={() => handleRoleToggle("STUDENT")}
                  />
                  <Label htmlFor="role-student" className="cursor-pointer">
                    Autores (STUDENT)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="role-evaluator"
                    checked={formData.filters.roles.includes("EVALUATOR")}
                    onCheckedChange={() => handleRoleToggle("EVALUATOR")}
                  />
                  <Label htmlFor="role-evaluator" className="cursor-pointer">
                    Avaliadores (EVALUATOR)
                  </Label>
                </div>
              </div>
            </div>

            {/* Filtro por status (apenas para STUDENT) */}
            {formData.filters.roles.includes("STUDENT") && (
              <div className="space-y-2">
                <Label htmlFor="article-status">Status dos Artigos (opcional)</Label>
                <Select
                  value={formData.filters.articleStatus}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, articleStatus: value },
                    }))
                  }
                >
                  <SelectTrigger id="article-status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {Object.entries(ARTICLE_STATUS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {getStatusLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Se selecionado, apenas autores com artigos neste status
                  receberão o email.
                </p>
              </div>
            )}

            {/* Preview de destinatários */}
            {formData.filters.roles.length > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Destinatários estimados:</p>
                <Badge variant="secondary">{getEstimatedRecipients()}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção: Conteúdo do Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Conteúdo do Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Ex: Prazo de avaliação se aproxima"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="body">Mensagem</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? "Ocultar" : "Ver"} Preview
                </Button>
              </div>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    body: e.target.value,
                  }))
                }
                placeholder="Digite a mensagem do email. Você pode usar HTML básico (<p>, <strong>, <em>, etc.)"
                rows={8}
              />
              <p className="text-sm text-muted-foreground">
                Você pode usar tags HTML básicas para formatar o texto.
              </p>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.body }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Enviar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || formData.filters.roles.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar Email em Massa
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Resultado */}
      {result && (
        <Alert
          className={
            result.failed === 0 ? "border-green-500 mt-6" : "border-yellow-500 mt-6"
          }
        >
          {result.failed === 0 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <AlertTitle>
            {result.failed === 0
              ? "Emails enviados com sucesso!"
              : "Emails enviados com algumas falhas"}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              <strong>Total de destinatários:</strong> {result.totalRecipients}
            </p>
            <p>
              <strong>Enviados com sucesso:</strong> {result.sent}
            </p>
            <p>
              <strong>Falhas:</strong> {result.failed}
            </p>

            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Erros:</p>
                <ul className="list-disc list-inside text-sm">
                  {result.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
