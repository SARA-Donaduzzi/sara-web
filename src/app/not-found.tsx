"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/biopark.png"
            alt="Logo SARA - Donaduzzi"
            width={250}
            height={100}
            className={`object-contain`}
            priority
          />
        </div>

        {/* 404 */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            Página não encontrada
          </h2>
          <p className="text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button asChild>
            <Link href="/dashboard" className="btn-gradient-primary text-white">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
