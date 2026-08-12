# SARA - Donaduzzi | Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema de Avaliação e Revisão de Artigos - Interface web para gerenciamento de eventos científicos e submissão de artigos acadêmicos.

Este repositório contém apenas a interface. A API está em
[`sara-api`](https://github.com/SARA-Donaduzzi/sara-api) e precisa estar rodando
para que a aplicação funcione. A documentação detalhada fica em
[`sara-docs`](https://github.com/SARA-Donaduzzi/sara-docs).

## 📋 Tecnologias

| Tecnologia      | Versão | Uso             |
| --------------- | ------ | --------------- |
| Next.js         | 15+    | Framework React |
| React           | 19+    | Biblioteca UI   |
| TypeScript      | 5.x    | Linguagem       |
| Tailwind CSS    | 3.x    | Estilização     |
| Shadcn/ui       | Latest | Componentes     |
| React Hook Form | -      | Formulários     |
| Zod             | -      | Validação       |
| Axios           | -      | Cliente HTTP    |
| js-cookie       | -      | Cookies         |
| React Hot Toast | -      | Notificações    |

## 🏗️ Estrutura

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/             # Login, Register
│   ├── artigos/            # Gestão de artigos
│   ├── avaliar/            # Avaliação de artigos
│   ├── checklists/         # Templates de avaliação
│   ├── dashboard/          # Painel principal
│   ├── eventos/            # Gestão de eventos
│   ├── perfil/             # Perfil do usuário
│   └── usuarios/           # Gestão de usuários
├── components/             # Componentes React
│   ├── forms/              # Formulários
│   ├── layout/             # Header, Sidebar, Footer
│   ├── tables/             # Tabelas de dados
│   └── ui/                 # Shadcn/ui components
├── lib/                    # Utilitários
│   ├── service/            # Services de API
│   ├── auth.ts             # Funções de autenticação
│   ├── utils.ts            # Helpers
│   └── validations.ts      # Schemas Zod
├── types/                  # TypeScript types
└── constants/              # Constantes da aplicação
```

## ⚡ Início Rápido

### Pré-requisitos

- Node.js 18+
- Backend SARA rodando

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
```

## 📦 Scripts

```bash
npm run dev      # Desenvolvimento (porta 3000)
npm run build    # Build de produção
npm start        # Servidor produção
npm run lint     # ESLint
```

## 📱 Páginas

### Públicas

| Rota               | Descrição            |
| ------------------ | -------------------- |
| `/login`           | Login de usuários    |
| `/register`        | Cadastro de usuários |
| `/forgot-password` | Recuperar senha      |

### Protegidas

| Rota                     | Roles       | Descrição            |
| ------------------------ | ----------- | -------------------- |
| `/dashboard`             | Todos       | Painel principal     |
| `/perfil`                | Todos       | Perfil do usuário    |
| `/eventos`               | Todos       | Lista de eventos     |
| `/eventos/[id]`          | Todos       | Detalhes do evento   |
| `/eventos/[id]/submeter` | STUDENT     | Submeter artigo      |
| `/artigos`               | Todos       | Meus artigos         |
| `/artigos/[id]`          | Todos       | Detalhes do artigo   |
| `/avaliar/[id]`          | EVALUATOR   | Avaliar artigo       |
| `/usuarios`              | COORDINATOR | Gestão de usuários   |
| `/checklists`            | COORDINATOR | Gestão de checklists |
| `/eventos/novo`          | COORDINATOR | Criar evento         |

## 👥 Roles e Funcionalidades

### STUDENT (Aluno)

- Visualizar eventos disponíveis
- Submeter artigos
- Acompanhar status de submissões
- Visualizar feedbacks de avaliação
- Enviar correções

### EVALUATOR (Avaliador)

- Visualizar artigos atribuídos
- Avaliar artigos com checklist
- Aprovar, rejeitar ou solicitar correção

### COORDINATOR (Coordenador)

- Criar e gerenciar eventos
- Gerenciar usuários
- Criar checklists de avaliação
- Atribuir avaliadores a artigos
- Visualizar todas as avaliações
- Enviar e-mails em lote

## 🎨 Componentes Principais

### Layout

- `Header`: Navegação superior
- `Sidebar`: Menu lateral
- `Footer`: Rodapé

### Forms

- `ArticleForm`: Submissão de artigos
- `EvaluationForm`: Formulário de avaliação
- `EventForm`: Criar/editar eventos
- `ChecklistForm`: Criar/editar checklists

### Tables

- `ArticlesTable`: Lista de artigos
- `EvaluationsTable`: Lista de avaliações
- `UsersTable`: Lista de usuários

## 🔐 Autenticação

O sistema utiliza JWT armazenado em cookies:

```typescript
// Cookie de autenticação
Cookies.get("sara_token");

// Decodificar token
const decoded = decodeToken(token);
// { userId, email, role, exp }
```

### Middleware de Proteção

Rotas protegidas verificam:

1. Token válido
2. Token não expirado
3. Role permitida para a rota

## 📡 Services

### Estrutura de Services

```typescript
// lib/service/articleService.ts
export const articleService = {
  getAll: () => api.get("/articles"),
  getById: (id: string) => api.get(`/articles/${id}`),
  create: (data: ArticleData) => api.post("/articles", data),
  // ...
};
```

### Services Disponíveis

- `authService`: Login, registro, recuperação de senha
- `userService`: CRUD de usuários
- `eventService`: CRUD de eventos
- `articleService`: CRUD de artigos
- `evaluationService`: CRUD de avaliações
- `checklistService`: CRUD de checklists

## 🎯 Validações

Schemas Zod para validação de formulários:

```typescript
// lib/validations.ts
export const articleSchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  // ...
});
```

## 🔔 Notificações

Sistema de toast com React Hot Toast:

```typescript
import toast from "react-hot-toast";

toast.success("Artigo submetido!");
toast.error("Erro ao submeter");
toast.loading("Enviando...");
```

## 📊 Status de Artigos

| Status        | Descrição     | Cor      |
| ------------- | ------------- | -------- |
| SUBMITTED     | Submetido     | Azul     |
| IN_EVALUATION | Em avaliação  | Amarelo  |
| APPROVED      | Aprovado      | Verde    |
| REJECTED      | Rejeitado     | Vermelho |
| TO_CORRECTION | Para correção | Laranja  |

## 🛠️ Troubleshooting

### Erro de CORS

- Verificar `NEXT_PUBLIC_API_URL` no .env.local
- Verificar configuração CORS no backend

### Token expirado

- Usuário é redirecionado para `/login`
- Cookies são limpos automaticamente

### Erro ao carregar dados

- Verificar se backend está rodando
- Verificar console do navegador
- Verificar Network tab no DevTools

## 📱 Responsividade

O sistema é responsivo e funciona em:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎨 Tema

Tailwind CSS com variáveis customizadas:

- Primary: Azul institucional
- Secondary: Tons de cinza
- Success: Verde
- Error: Vermelho
- Warning: Amarelo/Laranja

---

## 🤝 Contribuindo

Contribuições são bem-vindas. Leia o [CONTRIBUTING.md](CONTRIBUTING.md) para o
passo a passo do ambiente, as convenções de componentes e o que verificamos em
um pull request. Ao participar, você concorda com o
[Código de Conduta](CODE_OF_CONDUCT.md).

Encontrou uma vulnerabilidade? **Não abra uma issue pública.** Siga o
[SECURITY.md](SECURITY.md).

## 📚 Citação

Se este software for útil em trabalho acadêmico, os metadados de citação estão
em [CITATION.cff](CITATION.cff).

## 📄 Licença

Distribuído sob a **Licença MIT**. Veja [LICENSE](LICENSE) para o texto completo.
