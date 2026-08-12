# Como contribuir

Obrigado pelo interesse no SARA. Este é um projeto acadêmico de código aberto e
contribuições são bem-vindas, desde correções de digitação na documentação até
novos componentes.

Ao participar, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md).

Este repositório contém apenas o frontend. A API vive em
[`sara-api`](https://github.com/SARA-Donaduzzi/sara-api) e é necessária para
rodar a aplicação por completo.

## Antes de começar

Se a sua ideia for grande, abra uma issue descrevendo o problema antes de
escrever código. Para correções pequenas e óbvias, pode ir direto ao pull
request.

Vulnerabilidades de segurança **não** devem ser reportadas em issues públicas.
Siga o procedimento descrito em [SECURITY.md](SECURITY.md).

## Preparando o ambiente

Pré-requisitos: [Bun](https://bun.sh) 1.1 ou superior e uma instância da API
rodando (veja o `CONTRIBUTING.md` do `sara-api`).

```bash
git clone https://github.com/SARA-Donaduzzi/sara-web.git
cd sara-web

bun install

# Aponte NEXT_PUBLIC_API_URL para a sua API local
cp .env.example .env

# Aplicação em http://localhost:3000
bun run dev
```

## Verificações antes do pull request

```bash
bun run lint        # ESLint
bun run type-check  # tsc --noEmit
bun run build       # build de produção
```

Os três precisam passar.

## Organização do código

```
src/
├── app/          # Rotas do App Router do Next.js
├── components/   # ui/ (primitivos), common/, forms/, layout/, guards/
├── hooks/        # Hooks de dados e de estado
├── lib/          # service/ (chamadas à API), utilitários, constantes
├── providers/    # Context providers
└── types/        # Tipos compartilhados
```

Convenções que mantemos:

- componentes em `components/ui` são primitivos sem regra de negócio e sem
  chamada de rede;
- toda chamada à API passa por `lib/service`, nunca por `fetch` solto dentro de
  um componente;
- estilização com Tailwind. Evite CSS solto e valores mágicos, prefira os
  tokens definidos no `tailwind.config.ts`.

## Estilo

- TypeScript com `strict` ligado. Não use `any` para silenciar o compilador.
- Nomes de domínio em inglês no código, textos de interface em português.
- Não deixe `console.log` de depuração no código enviado.
- Nada de segredos. Lembre-se de que qualquer variável `NEXT_PUBLIC_*` vai
  parar no bundle enviado ao navegador e é pública por definição.

## Acessibilidade

Componentes novos devem ser navegáveis por teclado e ter rótulo acessível.
Use os primitivos do Radix quando houver um equivalente, em vez de reimplementar
comportamento de menu, diálogo ou combobox do zero.

## Commits e pull requests

Usamos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
feat(forms): validar prazo de submissão
fix(guards): redirecionar avaliador sem evento
docs(readme): corrigir comando de instalação
```

Prefixos usados: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`.

No pull request, descreva o que muda e por quê. Para mudanças visuais, anexe
uma captura de tela do antes e do depois. Vincule a issue com `Closes #123`.

## Licença das contribuições

Ao enviar um pull request, você concorda que sua contribuição será
distribuída sob a [Licença MIT](LICENSE), a mesma do projeto.
