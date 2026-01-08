# Leancup

A real-time Lean Coffee session management app built on the T3 Stack.

## Database Setup & Migrations

This project uses Prisma with PostgreSQL. Migrations are automatically run before the server starts.

### Local Development

```bash
# Start the PostgreSQL database
pnpm deps:start

# Create a new migration after schema changes
pnpm db:generate --name your_migration_name

# Apply pending migrations (runs automatically on dev/build/start)
pnpm db:migrate

# Open Prisma Studio to view/edit data
pnpm db:studio
```

**Important**: Migrations are automatically applied when you run:
- `pnpm dev` (development server)
- `pnpm build` (production build)
- `pnpm start` (production server)
- `pnpm preview` (local preview)

### Production Deployment

Ensure your `DATABASE_URL` environment variable is set, then:
```bash
pnpm db:migrate  # Apply all pending migrations
pnpm build       # Build the application
pnpm start       # Start the server
```

The build and start scripts automatically run migrations, so you typically don't need to run `db:migrate` manually.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
