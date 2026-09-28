# Alpine 3.21 ships postgresql17-client, matching the postgres:17.4 server
FROM node:20-alpine3.21

RUN apk add --no-cache postgresql17-client

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY docker/backup/crontab /etc/crontabs/root

ENTRYPOINT ["crond", "-f"]
