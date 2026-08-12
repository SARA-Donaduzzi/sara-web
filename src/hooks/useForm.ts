"use client";

import { useState, useCallback } from "react";
import { ZodSchema } from "zod";

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  validateField: (name: keyof T) => boolean;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));

      // Limpa erro do campo quando valor é alterado
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const validateField = useCallback(
    (name: keyof T): boolean => {
      if (!validationSchema) return true;

      try {
        validationSchema.parse(values);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        return true;
      } catch (error: any) {
        if (error.errors) {
          const fieldError = error.errors.find((err: any) =>
            err.path.includes(name)
          );
          if (fieldError) {
            setErrors((prev) => ({ ...prev, [name]: fieldError.message }));
            return false;
          }
        }
        return true;
      }
    },
    [values, validationSchema]
  );

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as keyof T] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        setIsSubmitting(true);
        await onSubmit(values);
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setValues,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
}
