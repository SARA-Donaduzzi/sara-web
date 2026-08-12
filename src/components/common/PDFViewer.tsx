"use client";

import React, { useState } from "react";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./LoadingSpinner";

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  showControls?: boolean;
}

export function PDFViewer({
  fileUrl,
  fileName,
  className,
  showControls = true,
}: PDFViewerProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // URL de teste mockada - TROCAR DEPOIS pela URL real do MinIO
  const actualFileUrl = fileUrl;

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = actualFileUrl;
    link.download = fileName || "documento.pdf";
    link.target = "_blank";
    link.click();
  };

  const openInNewTab = () => {
    window.open(actualFileUrl, "_blank");
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    // Força reload do iframe
    const iframe = document.getElementById("pdf-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  if (error) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center min-h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300`}
      >
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Erro ao carregar PDF
          </h3>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar o arquivo. Tente novamente ou abra em nova
            aba.
          </p>
          <div className="flex space-x-2">
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button onClick={openInNewTab} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir em nova aba
            </Button>
            <Button onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controles */}
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-gray-100 rounded-t-lg border-b">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF via iframe */}
      <div className="relative min-h-[800px] bg-gray-50">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <LoadingSpinner text="Carregando PDF..." />
          </div>
        )}

        <iframe
          id="pdf-iframe"
          src={actualFileUrl}
          width="100%"
          height="800"
          className="border-0 rounded-b-lg"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}
