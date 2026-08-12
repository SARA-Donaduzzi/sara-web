// src/types/file.ts

// Tipo para resposta da API de upload (baseado no exemplo fornecido)
export interface FileUploadApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    id: string;
    bucket: string;
    fileName: string;
    mimeType: string;
    originalName: string;
    size: number;
    uploadDate: string;
    url: string;
  };
}

// Tipo simplificado para uso no frontend
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  pdfPath: string;
  fileSize: number;
  mimeType: string;
  originalName?: string;
  message?: string;
  uploadDate?: string;
  bucket?: string;
  url?: string;
}

// Tipo para metadados do arquivo
export interface FileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  bucket: string;
  originalName?: string;
}

// Tipo para configuração de upload
export interface FileUploadConfig {
  maxSize: number;
  allowedImageTypes: string[];
  allowedPdfTypes: string[];
  allowedTypes: string[];
}

// Tipo para progresso de upload
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Tipo para erros de upload
export interface FileUploadError {
  code: string;
  message: string;
  details?: any;
}

// Tipo para upload de arquivo genérico
export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  uploadProgress?: number;
  uploadedFile?: {
    name: string;
    size: number;
  } | null;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Função auxiliar para mapear resposta da API para o tipo do frontend
export function mapApiResponseToFileUpload(
  apiResponse: FileUploadApiResponse
): FileUploadResponse {
  return {
    success: apiResponse.success,
    fileId: apiResponse.data.id,
    fileName: apiResponse.data.fileName,
    pdfPath: apiResponse.data.fileName, // Usar fileName como pdfPath
    fileSize: apiResponse.data.size,
    mimeType: apiResponse.data.mimeType,
    originalName: apiResponse.data.originalName,
    message: apiResponse.message,
    uploadDate: apiResponse.data.uploadDate,
    bucket: apiResponse.data.bucket,
    url: apiResponse.data.url,
  };
}

// Validações para tipos de arquivo
export const FILE_VALIDATORS = {
  isValidPdf: (file: File): boolean => {
    return file.type === "application/pdf";
  },

  isValidImage: (file: File): boolean => {
    return file.type.startsWith("image/");
  },

  isValidSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  getFileExtension: (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};
