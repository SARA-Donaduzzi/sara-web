"use client";

import React from "react";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>© {currentYear} Cliick. Feito com</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>para a comunidade acadêmica.</span>
            <p>
              Desenvolvido por{" "}
              <a
                href="https://github.com/SARA-Donaduzzi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Alunos da Faculdade Donaduzzi
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
