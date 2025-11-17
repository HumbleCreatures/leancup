import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Calculate quadratic voting cost
 * Formula: voteCount^2
 * 1 vote = 1 point, 2 votes = 4 points, 3 votes = 9 points, etc.
 */
function calculateQuadraticCost(voteCount: number): number {
    return voteCount * voteCount;
}

/**
 * Calculate total voting points for a session
 * Formula: (n-1)^2 where n is the number of tickets in TODO
 */
function calculateTotalPoints(todoTicketCount: number): number {
    return Math.pow(todoTicketCount - 1, 2);
}

export const votingRouter = createTRPCRouter({
    /**
     * Start a new voting session
     * Requires at least 2 tickets in TODO space
     */
    startVote: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if there's already an active voting session
            const existingVote = await ctx.db.votingSession.findFirst({
                where: {
                    sessionId: input.sessionId,
                    isActive: true,
                },
            });

            if (existingVote) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "A voting session is already active",
                });
            }

            // Count tickets in TODO
            const todoTickets = await ctx.db.ticket.count({
                where: {
                    sessionId: input.sessionId,
                    space: "TODO",
                },
            });

            if (todoTickets <= 1) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Need at least 2 tickets in TODO to start voting",
                });
            }

            // Create voting session
            const votingSession = await ctx.db.votingSession.create({
                data: {
                    sessionId: input.sessionId,
                },
            });

            // Create voter status for all users in the session
            const users = await ctx.db.sessionUser.findMany({
                where: { sessionId: input.sessionId },
            });

            await ctx.db.voterStatus.createMany({
                data: users.map((user) => ({
                    votingSessionId: votingSession.id,
                    userId: user.id,
                })),
            });

            return votingSession;
        }),

    /**
     * Get current active voting session for a session
     */
    getActiveVote: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const votingSession = await ctx.db.votingSession.findFirst({
                where: {
                    sessionId: input.sessionId,
                    isActive: true,
                },
                include: {
                    voterStatuses: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (!votingSession) {
                return null;
            }

            // Get TODO ticket count for points calculation
            const todoTickets = await ctx.db.ticket.count({
                where: {
                    sessionId: input.sessionId,
                    space: "TODO",
                },
            });

            const totalPoints = calculateTotalPoints(todoTickets);

            return {
                ...votingSession,
                totalPoints,
            };
        }),

    /**
     * Cast or update votes for a ticket
     */
    castVote: publicProcedure
        .input(
            z.object({
                votingSessionId: z.string(),
                ticketId: z.string(),
                userId: z.string(),
                voteCount: z.number().min(0).max(20), // Reasonable max
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verify voting session is active
            const votingSession = await ctx.db.votingSession.findUnique({
                where: { id: input.votingSessionId },
            });

            if (!votingSession?.isActive) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Voting session is not active",
                });
            }

            // Get all current votes for this user in this session
            const userVotes = await ctx.db.vote.findMany({
                where: {
                    votingSessionId: input.votingSessionId,
                    userId: input.userId,
                },
            });

            // Calculate total points spent (excluding the vote being updated)
            const existingVote = userVotes.find((v) => v.ticketId === input.ticketId);
            const otherVotes = userVotes.filter((v) => v.ticketId !== input.ticketId);
            const pointsSpentOnOthers = otherVotes.reduce(
                (sum, v) => sum + v.pointsCost,
                0
            );

            // Calculate cost of new vote
            const newCost =
                input.voteCount === 0 ? 0 : calculateQuadraticCost(input.voteCount);

            // Get total available points
            const todoTickets = await ctx.db.ticket.count({
                where: {
                    sessionId: votingSession.sessionId,
                    space: "TODO",
                },
            });
            const totalPoints = calculateTotalPoints(todoTickets);

            // Check if user has enough points
            if (pointsSpentOnOthers + newCost > totalPoints) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Not enough points available",
                });
            }

            // If voteCount is 0, delete the vote
            if (input.voteCount === 0) {
                if (existingVote) {
                    await ctx.db.vote.delete({
                        where: { id: existingVote.id },
                    });
                }
                return { success: true, deleted: true };
            }

            // Otherwise upsert the vote
            const vote = await ctx.db.vote.upsert({
                where: {
                    votingSessionId_ticketId_userId: {
                        votingSessionId: input.votingSessionId,
                        ticketId: input.ticketId,
                        userId: input.userId,
                    },
                },
                create: {
                    votingSessionId: input.votingSessionId,
                    ticketId: input.ticketId,
                    userId: input.userId,
                    voteCount: input.voteCount,
                    pointsCost: newCost,
                },
                update: {
                    voteCount: input.voteCount,
                    pointsCost: newCost,
                },
            });

            return vote;
        }),

    /**
     * Get all votes for the current voting session
     */
    getVotes: publicProcedure
        .input(
            z.object({
                votingSessionId: z.string(),
                userId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const votes = await ctx.db.vote.findMany({
                where: {
                    votingSessionId: input.votingSessionId,
                    userId: input.userId,
                },
                include: {
                    ticket: true,
                },
            });

            return votes;
        }),

    /**
     * Mark user as done voting
     */
    markDone: publicProcedure
        .input(
            z.object({
                votingSessionId: z.string(),
                userId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const voterStatus = await ctx.db.voterStatus.update({
                where: {
                    votingSessionId_userId: {
                        votingSessionId: input.votingSessionId,
                        userId: input.userId,
                    },
                },
                data: {
                    isDone: true,
                },
            });

            // Check if all users are done
            const allStatuses = await ctx.db.voterStatus.findMany({
                where: {
                    votingSessionId: input.votingSessionId,
                },
            });

            const allDone = allStatuses.every((status) => status.isDone);

            if (allDone) {
                // Close the voting session and tally results
                await ctx.db.votingSession.update({
                    where: { id: input.votingSessionId },
                    data: {
                        isActive: false,
                        endedAt: new Date(),
                    },
                });

                // Update ticket vote counts
                const votingSession = await ctx.db.votingSession.findUnique({
                    where: { id: input.votingSessionId },
                });

                if (votingSession) {
                    // Get all votes for this session grouped by ticket
                    const allVotes = await ctx.db.vote.findMany({
                        where: {
                            votingSessionId: input.votingSessionId,
                        },
                    });

                    // Sum up votes per ticket
                    const ticketVoteCounts = new Map<string, number>();
                    for (const vote of allVotes) {
                        const current = ticketVoteCounts.get(vote.ticketId) ?? 0;
                        ticketVoteCounts.set(vote.ticketId, current + vote.voteCount);
                    }

                    // Update each ticket's voteCount
                    for (const [ticketId, voteCount] of ticketVoteCounts.entries()) {
                        await ctx.db.ticket.update({
                            where: { id: ticketId },
                            data: { voteCount },
                        });
                    }
                }
            }

            return voterStatus;
        }),

    /**
     * Force close the voting session
     */
    forceClose: publicProcedure
        .input(
            z.object({
                votingSessionId: z.string(),
                userId: z.string(),
                username: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verify voting session is active
            const votingSession = await ctx.db.votingSession.findUnique({
                where: { id: input.votingSessionId },
            });

            if (!votingSession?.isActive) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Voting session is not active",
                });
            }

            // Close the voting session
            await ctx.db.votingSession.update({
                where: { id: input.votingSessionId },
                data: {
                    isActive: false,
                    endedAt: new Date(),
                    forceClosedBy: input.username,
                },
            });

            // Tally votes and update ticket counts
            const allVotes = await ctx.db.vote.findMany({
                where: {
                    votingSessionId: input.votingSessionId,
                },
            });

            // Sum up votes per ticket
            const ticketVoteCounts = new Map<string, number>();
            for (const vote of allVotes) {
                const current = ticketVoteCounts.get(vote.ticketId) ?? 0;
                ticketVoteCounts.set(vote.ticketId, current + vote.voteCount);
            }

            // Update each ticket's voteCount
            for (const [ticketId, voteCount] of ticketVoteCounts.entries()) {
                await ctx.db.ticket.update({
                    where: { id: ticketId },
                    data: { voteCount },
                });
            }

            return {
                success: true,
                forceClosedBy: input.username,
            };
        }),
});
