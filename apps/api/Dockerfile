# AI-TOS API (NestJS) — multi-stage. Build context: repository root.
FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install
RUN pnpm --filter @ai-tos/api build

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
