FROM node:20-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src
COPY admin ./admin

RUN pnpm build:ts

CMD ["sh", "-c", "pnpm db:migrate && exec pnpm exec tsx src/main.ts"]
