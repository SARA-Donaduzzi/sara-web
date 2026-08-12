"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  // FIX: Usar ref para manter a função atual sem causar re-renders
  const apiFunctionRef = useRef(apiFunction);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Atualiza as refs sempre que as funções mudarem
  useEffect(() => {
    apiFunctionRef.current = apiFunction;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunctionRef.current(...args);

        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        // Melhor tratamento de erro
        let errorMessage = "Erro na requisição";
        if (err.message) {
          errorMessage = err.message;
        } else if (err.status) {
          errorMessage = `Erro ${err.status}: ${
            err.message || "Erro interno do servidor"
          }`;
        }

        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        // NÃO fazer throw se immediate=true para não quebrar o render
        if (!immediate) {
          throw err;
        }

        return Promise.reject(err);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, immediate]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // FIX: Usar ref para controlar se já foi executado
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (immediate && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [immediate, execute]);

  // FIX: Reset do flag quando immediate muda
  useEffect(() => {
    if (!immediate) {
      hasExecutedRef.current = false;
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
