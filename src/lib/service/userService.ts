import { api } from "@/lib/api";
import { User } from "@/types";

interface UserSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

interface StudentUser extends User {
  articlesCount: number;
}

interface EvaluatorUser extends User {
  evaluationsCount: number;
}

interface UserPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userService = {
  // Buscar estudantes
  async getStudents(
    params?: UserSearchParams
  ): Promise<UserPaginatedResponse<StudentUser>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());

    const response = await api.get(
      `/students/users?${searchParams.toString()}`
    );

    // Verificar se a resposta tem a estrutura esperada
    if (response && typeof response === "object") {
      // Se a resposta já tem data e pagination no primeiro nível
      if (response.data && response.pagination) {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
      }

      // Se a resposta é direta (array)
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1,
          },
        };
      }
    }

    // Fallback
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  },

  // Buscar avaliadores
  async getEvaluators(
    params?: UserSearchParams
  ): Promise<UserPaginatedResponse<EvaluatorUser>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());

    const response = await api.get(
      `/evaluators/users?${searchParams.toString()}`
    );

    // Verificar se a resposta tem a estrutura esperada
    if (response && typeof response === "object") {
      // Se a resposta já tem data e pagination no primeiro nível
      if (response.data && response.pagination) {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
      }

      // Se a resposta é direta (array)
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1,
          },
        };
      }
    }

    // Fallback
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  },

  // Criar avaliador
  async createEvaluator(data: {
    name: string;
    email: string;
    password: string;
    isFromBpk?: boolean;
  }): Promise<User> {
    const response = await api.post("/auth/register-evaluator", data);

    // Se a resposta tem a estrutura { success, data }
    if (response && typeof response === "object" && response.data) {
      return response.data;
    }

    // Se a resposta é direta
    return response;
  },

  // Atualizar usuário
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);

    // Se a resposta tem a estrutura { success, data }
    if (response && typeof response === "object" && response.data) {
      return response.data;
    }

    // Se a resposta é direta
    return response;
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Alternar status ativo/inativo
  async toggleUserStatus(id: string): Promise<User> {
    const response = await api.patch(`/users/${id}/toggle-status`);

    // Se a resposta tem a estrutura { success, data }
    if (response && typeof response === "object" && response.data) {
      return response.data;
    }

    // Se a resposta é direta
    return response;
  },
};
