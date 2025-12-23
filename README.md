# UTI MVP — Expo + Node + Prisma

## Stack
- Expo (managed), TypeScript, Expo Router, Zustand, axios
- Node.js + Express, zod, JWT, Prisma
- PostgreSQL (Supabase) com pgBouncer
- Deploy backend em Vercel

## Estrutura
- `backend/` API REST e Prisma
- `app/` App Expo

## Backend
- Variáveis: `DATABASE_URL`, `JWT_SECRET`
- Scripts: `npm run dev`, `npm run typecheck`, `npm run prisma:generate`, `npm run prisma:migrate`, `npm run test`
- Endpoints:
  - `POST /auth/login`
  - `GET /hospitals`
  - `GET /patients`, `POST /patients`, `GET /patients/:id`
  - `GET /patients/:id/days`, `POST /patients/:id/days`
  - `POST /patients/:id/days/:dayId/copy-conduta`
  - `PUT /patients/:id/days/:dayId?override=true`

## App Expo
- Telas: Login, Seleção de Hospital, Lista de Pacientes, Novo Paciente (Dia 1), Diário Evolutivo, Calculadora SAPS 3
- Estado: token e hospital com `expo-secure-store` + `Zustand`
- Config: `app/app.json` (`extra.apiBaseUrl`)

## Deploy
- Supabase: criar DB e habilitar pooling
- Vercel: importar projeto, configurar variáveis, função `backend/api/index.ts`

## Testes
- `vitest` com teste para duplicação de evolução diária

