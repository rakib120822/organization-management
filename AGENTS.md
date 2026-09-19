# Repository Guidelines

## Project Structure & Module Organization

- `src/server.ts` starts the server; `src/app.ts` configures Express and mounts routes under `/api/v1`.
- Feature code lives in `src/app/module/<feature>/`. Keep each feature's route, controller, service, validation, and interfaces together; `auth/` is the current example.
- Shared middleware, utilities, configuration, and integrations belong in `src/app/middleware/`, `utils/`, `config/`, and `lib/` respectively.
- Email markup is in `src/app/templates/*.ejs`. Pass only the variables each template needs when rendering it.
- Prisma schema fragments are in `prisma/schema/`; migrations are committed under `prisma/migrations/`. Generated Prisma client code is in `generated/` and should not be edited manually.

## Build, Test, and Development Commands

- `npm run dev` — run the API with `tsx` watch mode.
- `npm run build` — type-check and compile TypeScript into `dist/`.
- `npm start` — run the compiled server.
- `npm run format:check` / `npm run format:fix` — check or apply Biome formatting for `src/`.
- `npm run lint:check` / `npm run lint:fix` — check or fix Biome lint findings.

Run `npm run build`, formatting, and lint checks before opening a pull request. The `test` script is currently a placeholder; add focused tests when introducing a test framework or behavior that needs regression coverage.

## Coding Style & Naming Conventions

Use TypeScript with strict types; avoid `any` and validate external input with Zod. Biome is authoritative: it uses tabs and double quotes. Use `camelCase` for variables and functions, `PascalCase` for types/classes, and lowercase hyphenated filenames such as `global-error-handler.ts`. Keep controllers thin, put business/database work in services, and return errors through `AppError` and shared middleware.

## Database & Configuration

Use Prisma for PostgreSQL access. Update the appropriate schema fragment, create a migration, and regenerate the client when models change. Keep credentials in `.env` (for example `DATABASE_URL`, Redis, JWT, and SMTP settings); never commit secrets.

## Commit & Pull Request Guidelines

Use short imperative commits consistent with history: `feat: add user authentication`, `complete forget password feature`, or `add biome`. Keep commits focused. Pull requests should explain the change, note schema or environment changes, link the related issue when available, and include API examples or screenshots for externally visible changes.
