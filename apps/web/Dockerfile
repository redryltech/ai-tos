# AI-TOS Web (Next.js) — multi-stage. Build context: repository root.
FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install
RUN pnpm --filter @ai-tos/web build

FROM node:20-alpine AS runtime
WORKDIR /repo/apps/web
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /repo /repo
EXPOSE 3000
CMD ["pnpm", "start"]
