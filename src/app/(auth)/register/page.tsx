import React from "react";
import { Metadata } from "next";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie sua conta no SARA - Sistema de Submissão de Artigos",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Formulário de Registro */}
        <RegisterForm />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Ao criar uma conta, você concorda com nossos{" "}
            <a href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Desenvolvido por{" "}
            <a
              href="https://www.instagram.com/cliick_sistemas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cllick
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
