// FUNÇÃO CORRIGIDA: Verificar se artigo pode receber nova versão
export const canSubmitNewVersion = (articleStatus: string) => {
  return articleStatus === "TO_CORRECTION";
};

// MAPEAMENTO CORRETO: Article Status -> Label para UI
export const getArticleStatusMapping = () => ({
  SUBMITTED: "Submetido",
  IN_EVALUATION: "Em Avaliação",
  APPROVED: "Aprovado",
  TO_CORRECTION: "Necessita Correção",
  REJECTED: "Rejeitado",
});

// Função para calcular cor do status - ATUALIZADA
export const getStatusColorClass = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "text-green-600";
    case "TO_CORRECTION":
      return "text-orange-600";
    case "REJECTED":
      return "text-red-600";
    case "SUBMITTED":
      return "text-blue-600";
    case "IN_EVALUATION":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};
