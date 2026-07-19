# syntax=docker/dockerfile:1
# Pet Shop admin dashboard (Next.js 16, standalone output). pnpm (pnpm-lock.yaml موجود است).
# NEXT_PUBLIC_API_BASE_URL هنگام build bake می‌شود → باید URL عمومی https باشد.

FROM docker.arvancloud.ir/node:22-slim AS deps
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM docker.arvancloud.ir/node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM docker.arvancloud.ir/node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
