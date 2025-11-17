import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const continuationRouter = createTRPCRouter({
    /**
     * Cast a continuation vote (continue or archive)
     */
    castVote: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
                userId: z.string(),
                vote: z.enum(["continue", "archive"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const ticket = await ctx.db.ticket.findUnique({
                where: { id: input.ticketId },
            });

            if (!ticket) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Ticket not found",
                });
            }

            if (ticket.space !== "DOING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Can only vote on tickets in DOING",
                });
            }

            // Upsert vote
            const vote = await ctx.db.continuationVote.upsert({
                where: {
                    ticketId_userId: {
                        ticketId: input.ticketId,
                        userId: input.userId,
                    },
                },
                create: {
                    ticketId: input.ticketId,
                    userId: input.userId,
                    vote: input.vote,
                },
                update: {
                    vote: input.vote,
                },
            });

            // Check if all users have voted
            const sessionUsers = await ctx.db.sessionUser.findMany({
                where: { sessionId: ticket.sessionId },
            });

            const allVotes = await ctx.db.continuationVote.findMany({
                where: { ticketId: input.ticketId },
            });

            if (allVotes.length === sessionUsers.length) {
                // Count votes
                const continueVotes = allVotes.filter((v) => v.vote === "continue").length;
                const archiveVotes = allVotes.filter((v) => v.vote === "archive").length;

                if (archiveVotes >= continueVotes) {
                    // Archive the ticket
                    await ctx.db.ticket.update({
                        where: { id: input.ticketId },
                        data: {
                            space: "ARCHIVE",
                            archivedBy: "Majority Vote",
                            archivedAt: new Date(),
                            timerStartedAt: null,
                            timerPausedAt: null,
                        },
                    });
                } else {
                    // Continue discussion - restart timer
                    await ctx.db.ticket.update({
                        where: { id: input.ticketId },
                        data: {
                            timerStartedAt: new Date(),
                            timerPausedAt: null,
                        },
                    });
                }

                // Delete all continuation votes
                await ctx.db.continuationVote.deleteMany({
                    where: { ticketId: input.ticketId },
                });
            }

            return vote;
        }),

    /**
     * Get all continuation votes for a ticket
     */
    getVotes: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const votes = await ctx.db.continuationVote.findMany({
                where: { ticketId: input.ticketId },
                include: {
                    user: true,
                },
            });

            return votes;
        }),

    /**
     * Clear all continuation votes for a ticket
     */
    clearVotes: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.continuationVote.deleteMany({
                where: { ticketId: input.ticketId },
            });

            return { success: true };
        }),
});
