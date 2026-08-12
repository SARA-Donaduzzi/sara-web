"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/common/FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { articleService } from "@/lib/service/articleService";
import { FILE_CONFIG } from "@/lib/constants";
import { AlertTriangle, Upload } from "lucide-react";
import toast from "react-hot-toast";

const newVersionSchema = z.object({
  pdfFile: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Deve ser um arquivo válido",
    }),
});

type NewVersionFormData = {
  pdfFile?: File;
};

interface SubmitNewVersionModalProps {
  articleId: string;
  currentVersion: number;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function SubmitNewVersionModal({
  articleId,
  currentVersion,
  onSuccess,
  children,
}: SubmitNewVersionModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadedFile, uploadProgress, isUploading, uploadPdf, resetUpload } =
    useFileUpload();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<NewVersionFormData>({
    resolver: zodResolver(newVersionSchema),
  });

  const pdfFile = watch("pdfFile");
  const nextVersion = currentVersion + 1;

  const handlePDFUpload = async (file: File) => {
    try {
      // Definir o arquivo no formulário
      setValue("pdfFile", file);

      // Fazer upload do arquivo
      await uploadPdf(file);
    } catch (error: any) {
      setError(error.message || "Erro ao fazer upload do arquivo");
    }
  };

  const onSubmit = async (data: NewVersionFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      // Verificar se temos um arquivo (do formulário ou do upload)
      const fileToSubmit =
        data.pdfFile ||
        (uploadedFile ? new File([], uploadedFile.fileName) : null);

      if (!fileToSubmit && !uploadedFile) {
        throw new Error("Nenhum arquivo PDF foi selecionado");
      }

      // Usar o arquivo do upload se disponível, senão usar o do formulário
      const finalFile = data.pdfFile || fileToSubmit;

      if (!finalFile) {
        throw new Error("Erro ao processar o arquivo PDF");
      }

      // Criar nova versão do artigo
      await articleService.createNewVersion(articleId, finalFile);

      toast.success(`Versão ${nextVersion} submetida com sucesso!`);

      // Reset e fechar modal
      reset();
      resetUpload();
      setOpen(false);

      // Callback de sucesso
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao submeter nova versão";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
      resetUpload();
      setError("");
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="sm:max-w-md !bg-white"
        style={{ backgroundColor: "white" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5 text-blue-600" />
            Submeter Versão {nextVersion}
          </DialogTitle>
          <DialogDescription>
            Submeta uma nova versão do seu artigo com as correções solicitadas.
          </DialogDescription>
        </DialogHeader>

        {/* Alert de Informações */}
        <Alert className="border-blue-200 bg-blue-50 [&_svg]:text-blue-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>Importante:</strong> Certifique-se de que implementou todas
            as correções sugeridas pelos avaliadores antes de submeter a nova
            versão.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Upload do PDF */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Arquivo PDF da Versão {nextVersion} *
            </label>
            <FileUpload
              accept={FILE_CONFIG.allowedPdfTypes.join(", ")}
              maxSize={FILE_CONFIG.maxSize}
              onUpload={handlePDFUpload}
              uploadProgress={isUploading ? uploadProgress : undefined}
              uploadedFile={
                uploadedFile
                  ? { name: uploadedFile.fileName, size: uploadedFile.fileSize }
                  : pdfFile
                  ? { name: pdfFile.name, size: pdfFile.size }
                  : null
              }
              error={error}
            />
            {errors.pdfFile && (
              <p className="text-sm text-red-600">{errors.pdfFile.message}</p>
            )}
          </div>

          {/* Informações sobre versionamento */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Histórico de Versões
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Versão atual:</span>
                <span className="font-medium">v{currentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Nova versão:</span>
                <span className="font-medium text-blue-600">
                  v{nextVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!pdfFile && !uploadedFile)}
              className="btn-gradient-accent"
            >
              {isSubmitting
                ? "Submetendo..."
                : `Submeter Versão ${nextVersion}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
