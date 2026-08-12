"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onUpload: (file: File) => void;
  onFileRemove?: () => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  uploadProgress?: number;
  uploadedFile?: {
    name: string;
    size: number;
  } | null;
  error?: string;
}

export function FileUpload({
  accept,
  maxSize,
  onUpload,
  onFileRemove,
  multiple = false,
  disabled = false,
  className,
  uploadProgress,
  uploadedFile,
  error,
}: FileUploadProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
    disabled,
  });

  const isUploading =
    uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100;
  const isUploaded = uploadedFile !== null;

  return (
    <div className={cn("w-full", className)}>
      {/* Área de Drop */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive || dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300  hover:border-gray-400 ",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50 ",
          isUploaded && "border-green-300 bg-green-50 "
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-primary animate-pulse" />
            <p className="text-sm text-gray-600">Enviando arquivo...</p>
            <Progress
              value={uploadProgress}
              className="w-full max-w-xs mx-auto"
            />
            <p className="text-xs text-gray-500">{uploadProgress}%</p>
          </div>
        ) : isUploaded ? (
          <div className="space-y-2">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm text-green-600 font-medium">
              Arquivo enviado com sucesso!
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <File className="h-3 w-3" />
              <span>{uploadedFile?.name}</span>
              <span>
                ({uploadedFile?.size ? formatFileSize(uploadedFile.size) : ""})
              </span>
            </div>
            {onFileRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                className="mt-2"
              >
                <X className="mr-1 h-3 w-3" />
                Remover
              </Button>
            )}
          </div>
        ) : error ? (
          <div className="space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="text-sm text-red-600 font-medium">Erro no upload</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? "Solte o arquivo aqui..."
                  : "Clique ou arraste arquivos aqui"}
              </p>
              <p className="text-xs text-gray-500">
                Tipos aceitos: {accept} • Tamanho máximo:{" "}
                {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
