"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export function ErrorMessage({
  title = "Oops! Algo deu errado",
  message,
  onRetry,
  retryText = "Tentar novamente",
  className,
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            {retryText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
