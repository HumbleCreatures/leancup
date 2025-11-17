# GitHub Copilot Instructions

## Project Overview
Leancup is a real-time Lean Coffee session management app built on the **T3 Stack** (Next.js App Router, tRPC, Prisma, Tailwind CSS). It enables collaborative discussion sessions with voting and time-boxed discussions—no login required, just short session IDs and unique usernames.

## Tech Stack (T3 Stack + Better Auth)
- **Framework**: Next.js 15 with App Router, TypeScript (strict mode), React 19
- **API Layer**: tRPC v11 with batched HTTP streaming (subscriptions planned for real-time sync)
- **Database**: PostgreSQL with Prisma ORM (client output: `generated/prisma`)
- **Auth**: Better Auth v1.3 with GitHub OAuth and email/password
- **Real-time**: Redis pub/sub for live session synchronization (planned)
- **Styling**: Tailwind CSS v4, Material Design 3 principles
- **Validation**: Zod schemas (via `@t3-oss/env-nextjs` for env vars)
- **State**: React Query (TanStack Query v5) integrated with tRPC
- **Package Manager**: pnpm 10.0.0

## Architecture & File Structure

### Path Aliases
- `~/*` maps to `src/*` (configured in `tsconfig.json`)
- Example: `~/server/db` → `src/server/db.ts`

### Key Directories
- `src/server/api/` - tRPC router definitions and procedures
  - `root.ts` - Main `appRouter` aggregating all routers
  - `trpc.ts` - tRPC context, middleware, `publicProcedure`, `protectedProcedure`
  - `routers/` - Feature-specific routers (e.g., `post.ts`)
- `src/server/better-auth/` - Better Auth configuration and client
- `src/app/` - Next.js App Router pages and API routes
  - `api/trpc/[trpc]/route.ts` - tRPC HTTP handler
  - `api/auth/[...all]/route.ts` - Better Auth handler
- `src/trpc/` - Client-side tRPC setup (`react.tsx`, `server.ts`)
- `prisma/schema.prisma` - Database schema (generates to `generated/prisma`)
- `.github/design-system.md` - Material Design 3 color tokens and component guidelines

### Database Schema (Current)
The schema includes **Better Auth models** (User, Session, Account, Verification, Post) plus **initial Lean Coffee models**:
- `LeanSession` - Session management with shortId (Google Meet style: "evx-asdp-hzo")
- `SessionUser` - Username tracking per session with unique constraints
- **Not yet implemented**: Ticket, SessionState, voting, timer models (see `FEATURES.md`)

### tRPC Context & Procedures
- Context (`createTRPCContext`) provides `db`, `session` (Better Auth), and `headers`
- `publicProcedure` - Artificial dev delay (100-500ms) for waterfall detection
- `protectedProcedure` - Requires authenticated user (`ctx.session.user` guaranteed)
- All procedures log execution time: `[TRPC] <path> took <ms>ms to execute`

### Environment Variables
Managed by `@t3-oss/env-nextjs` in `src/env.js`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Required in production
- `BETTER_AUTH_GITHUB_CLIENT_ID` / `BETTER_AUTH_GITHUB_CLIENT_SECRET`
- `SKIP_ENV_VALIDATION` - Skip validation for Docker builds
- Empty strings treated as undefined

## Development Workflows

### Local Setup
```bash
pnpm install                  # Install dependencies (runs prisma generate)
pnpm dev                      # Start Next.js with Turbopack
./start-database.sh           # Start local Postgres via Docker (WSL on Windows)
pnpm db:push                  # Push schema changes without migrations
pnpm db:generate              # Create migration (prisma migrate dev)
pnpm db:studio                # Open Prisma Studio
```

### Code Quality
```bash
pnpm check                    # Run lint + typecheck
pnpm lint                     # ESLint (use lint:fix for auto-fix)
pnpm typecheck                # TypeScript with noEmit
pnpm format:check             # Prettier (use format:write to apply)
```

### Production
```bash
pnpm build                    # Build for production
pnpm start                    # Start production server
pnpm preview                  # Build + start locally
```

## Design System (Material Design 3)
**CRITICAL**: Always reference `.github/design-system.md` for color tokens, typography, spacing, and component patterns.

### Color Usage Rules
1. **Never use hardcoded hex values** - always use semantic tokens
2. Use `primary`, `secondary`, `surface`, `background`, etc. (defined in design system)
3. Test in **both light and dark modes** (tokens switch automatically)
4. Inter font family for all text

### Key Tokens (Light Mode)
- Primary: `#8C4A2F` (warm espresso), Container: `#FFDAD0`
- Secondary: `#546067` (blue-gray), Container: `#D0E0EA`
- Surface: `#FAFAFA`, onSurface: `#1A1A1A`
- See design-system.md for full palette and Tailwind config

### Component Patterns
- **Cards**: Use `surface` color with subtle elevation
- **Buttons**: Primary action = `primary` bg, Secondary = `secondary` bg
- **Spaces**: Personal = `primaryContainer`, DOING = `primary` accent, ARCHIVE = `surfaceVariant`
- **Timer**: `primary` for active state, `outline` for progress ring

## tRPC Patterns

### Adding a New Router
1. Create `src/server/api/routers/yourFeature.ts`
2. Export a router using `createTRPCRouter` from `~/server/api/trpc`
3. Add to `src/server/api/root.ts` in `appRouter`

### Client Usage
```tsx
import { api } from "~/trpc/react"; // Client components
const { data } = api.post.getLatest.useQuery();
```

### Server Usage
```tsx
import { api } from "~/trpc/server"; // Server components
const posts = await api.post.getAll();
```

### Type Inference
```tsx
import { type RouterInputs, type RouterOutputs } from "~/trpc/react";
type PostInput = RouterInputs["post"]["create"];
type PostOutput = RouterOutputs["post"]["getById"];
```

## Prisma Conventions
- Client is generated to `generated/prisma` (excluded from git)
- `pnpm postinstall` runs `prisma generate` automatically
- Use `db:push` for rapid prototyping, `db:generate` for versioned migrations
- Import db singleton: `import { db } from "~/server/db";`
- Better Auth uses Prisma adapter (`prismaAdapter(db, { provider: "postgresql" })`)

## Security & Validation
- **All inputs validated with Zod** - tRPC procedures enforce schemas at runtime
- Environment variables validated on build (see `src/env.js`)
- Better Auth handles session cookies and CSRF protection
- XSS prevention: Sanitize markdown exports and user-generated content
- GitHub OAuth redirect: `http://localhost:3000/api/auth/callback/github`

## Real-Time Synchronization Strategy
**Critical requirement**: All session participants must see live updates when any user:
- Creates, moves, edits, or deletes tickets
- Casts or changes votes
- Starts/stops timers or changes session state
- Joins or leaves the session

**Planned Implementation**:
1. **tRPC Subscriptions** - WebSocket-based subscriptions for client-server communication
2. **Redis Pub/Sub** - Message broker for broadcasting changes across server instances
3. **Optimistic Updates** - Immediate UI feedback before server confirmation
4. **Event-driven Architecture** - Mutations publish events, subscriptions consume them

**Current State**: Using HTTP batched streaming; subscriptions not yet configured.

## Implementation Status
**Completed**: Basic session management, user joining, short ID generation, cookie-based persistence, Material Design 3 theming

**In Progress**: Session room UI, user presence tracking (polling every 5s)

**Not Yet Implemented** (see `FEATURES.md` for full checklist):
- Ticket CRUD operations and spaces (Personal, TO DO, DOING, ARCHIVE) 
- Voting system and quadratic voting logic
- Timer system with majority voting for discussions
- Session state management (Neutral/Voting/Discussion states)
- tRPC subscriptions + Redis pub/sub for real-time sync
- Markdown export functionality
- Docker Compose setup for deployment

## Project-Specific Gotchas
1. **Prisma output location**: Client is in `generated/prisma`, not `node_modules`
2. **Dev timing middleware**: Adds 100-500ms delay to all tRPC calls in development
3. **Better Auth vs NextAuth**: This project uses Better Auth (v1.3), not NextAuth
4. **Real-time not yet implemented**: tRPC subscriptions and Redis pub/sub are planned for live session synchronization
5. **Database script**: `start-database.sh` requires WSL on Windows (or native bash on Mac/Linux)
6. **HTTP streaming**: Current batched HTTP streaming does NOT provide real-time updates to multiple clients
7. **Session cookies**: Username persistence uses session-specific cookies (`leancup_user_${sessionId}`)
8. **Tailwind CSS v4**: Uses `@theme` directive in globals.css, not traditional tailwind.config.js
9. **Short ID format**: Session IDs follow Google Meet pattern "abc-def-ghi" (3 char segments)

## Common Tasks

### Add a Protected Route
Use `protectedProcedure` in your router:
```ts
export const myRouter = createTRPCRouter({
  privateData: protectedProcedure.query(({ ctx }) => {
    // ctx.session.user is guaranteed non-null
    return ctx.db.post.findMany({ where: { userId: ctx.session.user.id } });
  }),
});
```

### Update Database Schema
1. Edit `prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:generate --name migration_name` (prod)
3. Restart dev server (Prisma client regenerated)

### Add Environment Variable
1. Add to `server` schema in `src/env.js`
2. Add to `runtimeEnv` object
3. Set in `.env` file
4. Restart server

## Documentation & Communication
- Inline comments for complex business logic (e.g., voting algorithms)
- JSDoc for tRPC procedures and complex types
- Update `FEATURES.md` when completing checklist items
- Commit messages: Use conventional format (feat:, fix:, docs:, etc.)
- Commit messages: Use conventional format (feat:, fix:, docs:, etc.)
