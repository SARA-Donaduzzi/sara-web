import { useState, useCallback, useEffect, useMemo } from "react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { userService } from "@/lib/service/userService";
import toast from "react-hot-toast";

export function useUsers() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const limit = 10;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Criar parâmetros memoizados para evitar recriação constante
  const studentsParams = useMemo(
    () => ({
      search: debouncedSearchTerm,
      page: currentPage,
      limit,
      isActive: showActiveOnly,
    }),
    [debouncedSearchTerm, currentPage, limit, showActiveOnly]
  );

  const evaluatorsParams = useMemo(
    () => ({
      search: debouncedSearchTerm,
      page: currentPage,
      limit,
      isActive: showActiveOnly,
    }),
    [debouncedSearchTerm, currentPage, limit, showActiveOnly]
  );

  // Buscar estudantes
  const {
    data: studentsData,
    loading: studentsLoading,
    execute: executeStudents,
    error: studentsError,
  } = useApi(() => userService.getStudents(studentsParams));

  // Buscar avaliadores
  const {
    data: evaluatorsData,
    loading: evaluatorsLoading,
    execute: executeEvaluators,
    error: evaluatorsError,
  } = useApi(() => userService.getEvaluators(evaluatorsParams));

  // Executar busca quando os parâmetros mudarem
  useEffect(() => {
    if (activeTab === "students") {
      executeStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, studentsParams]);

  useEffect(() => {
    if (activeTab === "evaluators") {
      executeEvaluators();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, evaluatorsParams]);

  // Log para debug
  useEffect(() => {}, [
    studentsData,
    evaluatorsData,
    studentsLoading,
    evaluatorsLoading,
  ]);

  const isLoading = studentsLoading || evaluatorsLoading;
  const currentData = activeTab === "students" ? studentsData : evaluatorsData;

  const handleCreateEvaluator = useCallback(
    async (data: any) => {
      try {
        await userService.createEvaluator(data);
        toast.success("Avaliador criado com sucesso!");
        setIsCreateDialogOpen(false);
        executeEvaluators();
        return true;
      } catch (error: any) {
        toast.error(error.message || "Erro ao criar avaliador");
        return false;
      }
    },
    [executeEvaluators]
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      toast.success("Usuário removido com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);

      // Refetch baseado no tipo de usuário
      if (selectedUser.role === "STUDENT") {
        executeStudents();
      } else {
        executeEvaluators();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover usuário");
    }
  }, [selectedUser, executeStudents, executeEvaluators]);

  const handleToggleUserStatus = useCallback(
    async (user: any) => {
      try {
        await userService.toggleUserStatus(user.id);
        toast.success(
          `Usuário ${user.isActive ? "desativado" : "ativado"} com sucesso!`
        );

        // Refetch baseado no tipo de usuário
        if (user.role === "STUDENT") {
          executeStudents();
        } else {
          executeEvaluators();
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao alterar status do usuário");
      }
    },
    [executeStudents, executeEvaluators]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSearchTerm("");
  }, []);

  const handleFilterToggle = useCallback(() => {
    setShowActiveOnly((prev) => !prev);
    setCurrentPage(1);
  }, []);

  return {
    // State
    activeTab,
    searchTerm,
    currentPage,
    showActiveOnly,
    selectedUser,
    isCreateDialogOpen,
    isDeleteDialogOpen,

    // Data
    studentsData,
    evaluatorsData,
    currentData,
    isLoading,
    studentsLoading,
    evaluatorsLoading,
    studentsError,
    evaluatorsError,

    // Actions
    handleCreateEvaluator,
    handleDeleteUser,
    handleToggleUserStatus,
    handleSearch,
    handlePageChange,
    handleTabChange,
    handleFilterToggle,

    // Setters
    setSelectedUser,
    setIsCreateDialogOpen,
    setIsDeleteDialogOpen,

    // Refetch (para compatibilidade)
    refetchStudents: executeStudents,
    refetchEvaluators: executeEvaluators,
  };
}
