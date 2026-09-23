# Repository Guidelines

## Project Structure & Module Organization

- `src/server.ts` starts the server; `src/app.ts` configures Express and mounts routes under `/api/v1`.
- Feature code lives in `src/app/module/<feature>/`. Keep each feature's route, controller, service, validation, and interfaces together; `auth/`, `user/`, and `orgnization/` are the current modules.
- Shared middleware lives in `src/app/middleware/`, utilities in `src/app/utils/`, configuration in `src/app/config/`, and integrations in `src/app/lib/`.
- Email markup is in `src/app/templates/*.ejs`. Pass only the variables each template needs when rendering it.
- Prisma schema fragments are in `prisma/schema/`; migrations are under `prisma/migrations/`. Generated Prisma client code is in `generated/` and must not be edited manually.

## Build, Test, and Development Commands

- `npm run dev` — run the API with `tsx` watch mode.
- `npm run build` — type-check and compile TypeScript into `dist/`.
- `npm start` — run the compiled server.
- `npm run format:check` / `npm run format:fix` — check or apply Biome formatting for `src/`.
- `npm run lint:check` / `npm run lint:fix` — check or fix Biome lint findings for `src/`.

Run `npm run build`, formatting, and lint checks **in that order** before opening a pull request. The `test` script is currently a placeholder (`echo "Error: no test specified"`); add focused tests when introducing behavior that needs regression coverage.

## Environment Variables

- `.env` is loaded by both `src/app/config/index.ts` (via `dotenv.config()`) and `src/app/lib/prisma.ts` (via `import "dotenv/config"`). Do not remove either — they together populate all required env vars (`DATABASE_URL`, `PORT`, JWT secrets, Redis, SMTP, Cloudinary, etc.).
- Copy `.env.example` and fill values for local development; never commit `.env`.

## Coding Style & Naming Conventions

- TypeScript with strict types; avoid `any` and validate external input with Zod.
- Biome is authoritative: uses tabs, double quotes.
- `camelCase` for variables/functions, `PascalCase` for types/classes, lowercase hyphenated filenames (e.g., `global-error-handler.ts`).
- Keep controllers thin; put business/database work in services; return errors through `AppError` and shared middleware.

## Database & Configuration

- Prisma for PostgreSQL access. Update the appropriate schema fragment under `prisma/schema/`, create a migration under `prisma/migrations/`, then regenerate the Prisma client (`npx prisma generate`).
- Keep credentials in `.env` (e.g. `DATABASE_URL`, Redis, JWT, SMTP, Cloudinary); never commit secrets.
- The `generated/prisma/enums.ts` file reflects enum definitions from `prisma/schema/enum.prisma` — do not manually edit generated enums.

## Commit & Pull Request Guidelines

- Use short imperative commits consistent with history: `feat: add user authentication`, `complete forget password feature`, or `add biome`.
- Keep commits focused. PRs should explain the change, note schema or environment changes, link the related issue when available, and include API examples for externally visible changes.
