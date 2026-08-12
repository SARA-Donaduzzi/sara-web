# =============================================================================
# STAGE 1 — deps: instala APENAS dependências de produção
# =============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# =============================================================================
# STAGE 2 — builder: compila Next.js
# NEXT_PUBLIC_* precisam ser passadas como build args porque são embedadas
# no bundle estático durante o build (não são lidas em runtime)
# =============================================================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_MAX_FILE_SIZE
ARG NEXT_PUBLIC_ALLOWED_IMAGE_TYPES
ARG NEXT_PUBLIC_ALLOWED_PDF_TYPES
ARG NEXT_PUBLIC_ENABLE_NOTIFICATIONS
ARG NEXT_PUBLIC_ENABLE_PWA

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_DESCRIPTION=$NEXT_PUBLIC_APP_DESCRIPTION
ENV NEXT_PUBLIC_MAX_FILE_SIZE=$NEXT_PUBLIC_MAX_FILE_SIZE
ENV NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=$NEXT_PUBLIC_ALLOWED_IMAGE_TYPES
ENV NEXT_PUBLIC_ALLOWED_PDF_TYPES=$NEXT_PUBLIC_ALLOWED_PDF_TYPES
ENV NEXT_PUBLIC_ENABLE_NOTIFICATIONS=$NEXT_PUBLIC_ENABLE_NOTIFICATIONS
ENV NEXT_PUBLIC_ENABLE_PWA=$NEXT_PUBLIC_ENABLE_PWA
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =============================================================================
# STAGE 3 — runner: imagem final mínima
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
