import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Faça login na sua conta",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Formulário de Login */}
        <LoginForm />

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
              Cliick
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
