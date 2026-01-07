import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Generate a short unique session ID in Google Meet style format
 * @example "evx-asdp-hzo"
 */
function generateShortId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const part = () =>
        Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    return `${part()}-${part()}-${part()}`;
}

export const sessionRouter = createTRPCRouter({
    /**
     * Create a new Lean Coffee session with a short unique ID
     */
    create: publicProcedure
        .input(z.object({ name: z.string().min(1).max(100) }))
        .mutation(async ({ ctx, input }) => {
            let shortId = generateShortId();
            let attempts = 0;
            const maxAttempts = 10;

            // Ensure unique shortId (handle unlikely collision)
            while (attempts < maxAttempts) {
                const existing = await ctx.db.leanSession.findUnique({
                    where: { shortId },
                });

                if (!existing) break;

                shortId = generateShortId();
                attempts++;
            }

            if (attempts === maxAttempts) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate unique session ID",
                });
            }

            const session = await ctx.db.leanSession.create({
                data: {
                    name: input.name,
                    shortId,
                },
            });

            return {
                id: session.id,
                shortId: session.shortId,
            };
        }),

    /**
     * Get session by short ID
     */
    getByShortId: publicProcedure
        .input(z.object({ shortId: z.string() }))
        .query(async ({ ctx, input }) => {
            const session = await ctx.db.leanSession.findUnique({
                where: { shortId: input.shortId },
                include: {
                    users: {
                        orderBy: { lastSeen: "desc" },
                    },
                },
            });

            if (!session) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Session not found",
                });
            }

            return session;
        }),

    /**
     * Join a session with a username (or update existing user's lastSeen)
     */
    joinSession: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
                username: z.string().min(1).max(50),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verify session exists
            const session = await ctx.db.leanSession.findUnique({
                where: { id: input.sessionId },
            });

            if (!session) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Session not found",
                });
            }

            // Check if username already exists in this session
            const existingUser = await ctx.db.sessionUser.findUnique({
                where: {
                    sessionId_username: {
                        sessionId: input.sessionId,
                        username: input.username,
                    },
                },
            });

            if (existingUser) {
                // Update lastSeen for existing user
                const updatedUser = await ctx.db.sessionUser.update({
                    where: { id: existingUser.id },
                    data: { lastSeen: new Date() },
                });

                return {
                    userId: updatedUser.id,
                    username: updatedUser.username,
                    isNew: false,
                };
            }

            // Create new user
            const newUser = await ctx.db.sessionUser.create({
                data: {
                    username: input.username,
                    sessionId: input.sessionId,
                },
            });

            // Update session's lastInteractionAt
            await ctx.db.leanSession.update({
                where: { id: input.sessionId },
                data: { lastInteractionAt: new Date() },
            });

            return {
                userId: newUser.id,
                username: newUser.username,
                isNew: true,
            };
        }),

    /**
     * Check if username is available in a session
     */
    checkUsername: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
                username: z.string().min(1).max(50),
            })
        )
        .query(async ({ ctx, input }) => {
            const existingUser = await ctx.db.sessionUser.findUnique({
                where: {
                    sessionId_username: {
                        sessionId: input.sessionId,
                        username: input.username,
                    },
                },
            });

            return {
                available: !existingUser,
            };
        }),

    /**
     * Update user presence (heartbeat)
     */
    updatePresence: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.sessionUser.update({
                where: { id: input.userId },
                data: { lastSeen: new Date() },
            });

            return { success: true };
        }),
});
