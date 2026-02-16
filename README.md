# MATZON.gg

Competitive Gaming Ecosystem — Platform + Social Network + Tournaments

## Stack

- **Frontend:** Next.js / React / TypeScript / Tailwind
- **Backend:** NestJS / Prisma
- **Database:** MongoDB Atlas + PostgreSQL (hybrid)
- **Auth:** JWT custom RS256 / JWKS / RBAC
- **Infra:** Docker / Kubernetes / Vercel

## Structure
apps/
api/          # NestJS backend
web/          # Next.js frontend
packages/
shared-types/ # Shared TypeScript types
config/       # Shared configs
utils/        # Shared utilities
## Getting Started

```bash
pnpm install
pnpm dev
