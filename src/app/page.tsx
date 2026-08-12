"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { decodeToken, isTokenExpired } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUserStatus = () => {
      // Buscar o token correto usado no projeto
      const token = Cookies.get("sara_token");

      if (!token || isTokenExpired(token)) {
        setIsLoggedIn(false);
        setUserType(null);
        return;
      }

      // Decodificar o token para pegar o role
      const decoded = decodeToken(token);

      if (decoded && decoded.role) {
        setIsLoggedIn(true);
        // Mapear os roles do backend para o frontend
        const roleMap = {
          STUDENT: "aluno",
          EVALUATOR: "avaliador",
          COORDINATOR: "coordenador",
        };
        setUserType(roleMap[decoded.role as keyof typeof roleMap] || "aluno");
      }
    };

    checkUserStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  return null;
}
