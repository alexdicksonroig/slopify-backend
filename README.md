# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)

This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## R2 Product Thumbnail storage

Provide your bucket credentials in the gitignored `.env` file. The application validates all R2 settings at startup. `R2_PUBLIC_BASE_URL` is the public bucket or custom-domain URL used in Product API responses.

## Database and migrations

Start the local PostgreSQL database with Docker Compose:

```sh
pnpm db:up
```

The database health check may take a few seconds. Apply the existing migrations with:

```sh
pnpm db:migrate
```

After changing `src/verticals/example/infrastructure/persistence/schema.ts`, generate and apply a new migration:

```sh
pnpm db:generate
pnpm db:migrate
```

View the PostgreSQL logs or stop the database with:

```sh
pnpm db:logs
pnpm db:down
```

Open Drizzle Studio with:

```sh
pnpm db:studio
```

Generated SQL and migration metadata are stored in `drizzle/` and should be committed.
The database is available in routes as `fastify.db`.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).
