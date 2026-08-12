import { api } from "@/lib/api";
import { FileUploadResponse, FileMetadata } from "@/types";

export const fileService = {
  // Upload de PDF
  async uploadPDF(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return api.uploadFile("/files/upload", file, onProgress);
  },

  // Upload de imagem
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return api.uploadFile("/files/upload/image", file, onProgress);
  },

  // Buscar arquivo
  async getFile(bucket: string, fileName: string): Promise<Blob> {
    return api.downloadFile(`/files/file/${bucket}?fileName=${fileName}`);
  },

  // Buscar metadados do arquivo
  async getFileMetadata(
    bucket: string,
    fileName: string
  ): Promise<FileMetadata> {
    return api.get<FileMetadata>(
      `/files/metadata/${bucket}?fileName=${fileName}`
    );
  },
};
