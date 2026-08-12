"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/lib/validations";
import Image from "next/image";

interface ChangePasswordFormProps {
  isFirstLogin?: boolean;
}

export function ChangePasswordForm({
  isFirstLogin = false,
}: ChangePasswordFormProps) {
  const { changePassword } = useAuthContext();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setError("");
      await changePassword(data);
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/faculdade-donaduzzi-removebg.png"
            alt="Logo SARA - Donaduzzi"
            width={230}
            height={100}
            className={`object-contain`} // Adiciona 'hidden' se 'user' existir
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold">
          {isFirstLogin ? "Redefinir Senha" : "Alterar Senha"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isFirstLogin
            ? "Para continuar, você deve redefinir sua senha temporária"
            : "Altere sua senha atual para uma nova"}
        </p>
      </CardHeader>

      <CardContent>
        {isFirstLogin && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta é sua primeira vez no sistema. Por segurança, você deve criar
              uma nova senha.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {isFirstLogin ? "Senha temporária" : "Senha atual"}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder={
                  isFirstLogin ? "Digite a senha temporária" : "Sua senha atual"
                }
                className="pl-10 pr-10"
                {...register("currentPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 px-0"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Crie uma senha forte"
                className="pl-10 pr-10"
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 px-0"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
                className="pl-10 pr-10"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 px-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Requisitos da Senha */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">A senha deve conter:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Pelo menos 8 caracteres</li>
              <li>Uma letra minúscula</li>
              <li>Uma letra maiúscula</li>
              <li>Um número</li>
            </ul>
          </div>

          {/* Botão */}
          <Button
            type="submit"
            className="w-full btn-gradient-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
