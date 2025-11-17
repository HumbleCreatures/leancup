import { continuationRouter } from "~/server/api/routers/continuation";
import { postRouter } from "~/server/api/routers/post";
import { sessionRouter } from "~/server/api/routers/session";
import { ticketRouter } from "~/server/api/routers/ticket";
import { votingRouter } from "~/server/api/routers/voting";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  session: sessionRouter,
  ticket: ticketRouter,
  voting: votingRouter,
  continuation: continuationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
