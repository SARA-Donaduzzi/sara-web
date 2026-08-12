"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import {
  UserPlus,
  Search,
  UserX,
  GraduationCap,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Mail,
  UserLock,
} from "lucide-react";
import { USER_ROLES, formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsers } from "@/hooks/useUsers";

// Schema de validação
const createEvaluatorSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  isFromBpk: z.boolean().optional(),
});

type CreateEvaluatorForm = z.infer<typeof createEvaluatorSchema>;

export default function UsersPage() {
  // Usar o hook customizado
  const {
    activeTab,
    searchTerm,
    currentPage,
    selectedUser,
    isCreateDialogOpen,
    isDeleteDialogOpen,
    studentsData,
    evaluatorsData,
    studentsLoading,
    evaluatorsLoading,
    handleCreateEvaluator,
    handleDeleteUser,
    handleToggleUserStatus,
    handleSearch,
    handlePageChange,
    handleTabChange,
    setSelectedUser,
    setIsCreateDialogOpen,
    setIsDeleteDialogOpen,
  } = useUsers();

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateEvaluatorForm>({
    resolver: zodResolver(createEvaluatorSchema),
  });

  // Handler para criar avaliador
  const onCreateEvaluator = async (data: CreateEvaluatorForm) => {
    const success = await handleCreateEvaluator(data);
    if (success) {
      reset();
    }
  };

  // Handler para deletar usuário
  const onDeleteUser = async () => {
    await handleDeleteUser();
  };

  // Colunas para estudantes
  const studentsColumns = [
    {
      key: "name",
      title: "Estudante",
      render: (value: string, user: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "articlesCount",
      title: "Artigos",
      render: (value: number) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{value || 0}</div>
          <div className="text-xs text-gray-500">artigos</div>
        </div>
      ),
    },
    {
      key: "isFromBpk",
      title: "Instituição",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Biopark" : "Externa"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Criado em",
      render: (value: string) => formatDate(value),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, user: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleUserStatus(user)}
          title={user.isActive ? "Desativar" : "Ativar"}
        >
          {user.isActive ? (
            <UserX className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
        </Button>
      ),
    },
  ];

  // Colunas para avaliadores
  const evaluatorsColumns = [
    {
      key: "name",
      title: "Avaliador",
      render: (value: string, user: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "evaluationsCount",
      title: "Avaliações",
      render: (value: number) => (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{value || 0}</div>
          <div className="text-xs text-gray-500">avaliações</div>
        </div>
      ),
    },
    {
      key: "isFromBpk",
      title: "Instituição",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Biopark" : "Externa"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Criado em",
      render: (value: string) => formatDate(value),
    },
    {
      key: "actions",
      title: "Ações",
      render: (_: any, user: any) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleUserStatus(user)}
            title={user.isActive ? "Desativar" : "Ativar"}
          >
            {user.isActive ? (
              <UserLock className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
            title="Excluir"
          >
            <UserX className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const breadcrumbs = [{ label: "Usuários" }];

  // Função para obter total de estudantes de forma segura
  const getStudentsTotal = () => {
    return studentsData?.pagination?.total ?? 0;
  };

  // Função para obter total de avaliadores de forma segura
  const getEvaluatorsTotal = () => {
    return evaluatorsData?.pagination?.total ?? 0;
  };

  // Função para obter dados dos estudantes de forma segura
  const getStudentsData = () => {
    return studentsData?.data ?? [];
  };

  // Função para obter dados dos avaliadores de forma segura
  const getEvaluatorsData = () => {
    return evaluatorsData?.data ?? [];
  };

  // Função para verificar se há estudantes
  const hasStudents = () => {
    return getStudentsData().length > 0;
  };

  // Função para verificar se há avaliadores
  const hasEvaluators = () => {
    return getEvaluatorsData().length > 0;
  };

  return (
    <AuthGuard requiredRoles={[USER_ROLES.COORDINATOR]}>
      <PageLayout
        title="Gestão de Usuários"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex space-x-2">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="btn-gradient-accent">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Avaliador
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Criar Novo Avaliador</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onCreateEvaluator)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Dr. João Silva"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="avaliador@exemplo.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha temporária</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Senha temporária"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFromBpk"
                      {...register("isFromBpk")}
                    />
                    <Label htmlFor="isFromBpk">É do Biopark?</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="btn-gradient-accent">
                      Criar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Busca */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                type="text"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">
                <GraduationCap className="h-4 w-4 mr-2" />
                Estudantes
              </TabsTrigger>
              <TabsTrigger value="evaluators">
                <ClipboardList className="h-4 w-4 mr-2" />
                Avaliadores
              </TabsTrigger>
            </TabsList>

            {/* Estudantes */}
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <GraduationCap className="h-5 w-5 mr-2 inline" />
                    Estudantes
                    {getStudentsTotal() > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {getStudentsTotal()} total
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text="Carregando..." />
                    </div>
                  ) : hasStudents() ? (
                    <div className="space-y-4">
                      <DataTable
                        data={getStudentsData()}
                        columns={studentsColumns}
                      />
                      {(studentsData?.pagination?.totalPages ?? 0) > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={studentsData?.pagination?.totalPages ?? 1}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Nenhum estudante encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avaliadores */}
            <TabsContent value="evaluators">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <ClipboardList className="h-5 w-5 mr-2 inline" />
                    Avaliadores
                    {getEvaluatorsTotal() > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {getEvaluatorsTotal()} total
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {evaluatorsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner text="Carregando..." />
                    </div>
                  ) : hasEvaluators() ? (
                    <div className="space-y-4">
                      <DataTable
                        data={getEvaluatorsData()}
                        columns={evaluatorsColumns}
                      />
                      {(evaluatorsData?.pagination?.totalPages ?? 0) > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={
                            evaluatorsData?.pagination?.totalPages ?? 1
                          }
                          onPageChange={handlePageChange}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Nenhum avaliador encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialog de exclusão */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <AlertCircle className="h-5 w-5 mr-2 inline text-red-600" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Deseja excluir o usuário <strong>{selectedUser?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteUser}
                className="btn-gradient-accent"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageLayout>
    </AuthGuard>
  );
}
