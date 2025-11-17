import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/**
 * Ticket spaces in Lean Coffee sessions
 */
export const TicketSpace = z.enum(["PERSONAL", "TODO", "DOING", "ARCHIVE"]);

export const ticketRouter = createTRPCRouter({
    /**
     * Create a new ticket (starts in PERSONAL space)
     */
    create: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
                userId: z.string(),
                description: z.string().min(1).max(1000),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const ticket = await ctx.db.ticket.create({
                data: {
                    description: input.description,
                    space: "PERSONAL",
                    sessionId: input.sessionId,
                    userId: input.userId,
                },
                include: {
                    user: true,
                },
            });

            return ticket;
        }),

    /**
     * Get all tickets for a session (filtered by visibility rules)
     */
    getBySession: publicProcedure
        .input(
            z.object({
                sessionId: z.string(),
                userId: z.string(), // Current user to filter PERSONAL tickets
            })
        )
        .query(async ({ ctx, input }) => {
            const tickets = await ctx.db.ticket.findMany({
                where: {
                    sessionId: input.sessionId,
                    OR: [
                        // User's own PERSONAL tickets
                        {
                            space: "PERSONAL",
                            userId: input.userId,
                        },
                        // All shared spaces (visible to everyone)
                        {
                            space: {
                                in: ["TODO", "DOING", "ARCHIVE"],
                            },
                        },
                    ],
                },
                include: {
                    user: true,
                },
                orderBy: [
                    // First order by voteCount descending (highest votes first)
                    { voteCount: "desc" },
                    // Then by creation date
                    { createdAt: "desc" },
                ],
            });

            return tickets;
        }),

    /**
     * Move a ticket to a different space
     */
    moveToSpace: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
                space: TicketSpace,
                userId: z.string(), // To verify ownership for PERSONAL tickets
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get the ticket first to check ownership and current space
            const ticket = await ctx.db.ticket.findUnique({
                where: { id: input.ticketId },
            });

            if (!ticket) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Ticket not found",
                });
            }

            // Only the creator can move their PERSONAL tickets
            if (ticket.space === "PERSONAL" && ticket.userId !== input.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only move your own personal tickets",
                });
            }

            // Check if moving to DOING space
            if (input.space === "DOING") {
                // Ensure only one ticket can be in DOING
                const existingDoingTicket = await ctx.db.ticket.findFirst({
                    where: {
                        sessionId: ticket.sessionId,
                        space: "DOING",
                        id: { not: input.ticketId },
                    },
                });

                if (existingDoingTicket) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Only one ticket can be in DOING at a time",
                    });
                }
            }

            const updatedTicket = await ctx.db.ticket.update({
                where: { id: input.ticketId },
                data: { space: input.space },
                include: {
                    user: true,
                },
            });

            return updatedTicket;
        }),

    /**
     * Delete a ticket (only creator can delete)
     */
    delete: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
                userId: z.string(),
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

            if (ticket.userId !== input.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only delete your own tickets",
                });
            }

            await ctx.db.ticket.delete({
                where: { id: input.ticketId },
            });

            return { success: true };
        }),

    /**
     * Update ticket description
     */
    update: publicProcedure
        .input(
            z.object({
                ticketId: z.string(),
                userId: z.string(),
                description: z.string().min(1).max(1000),
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

            if (ticket.userId !== input.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only edit your own tickets",
                });
            }

            const updatedTicket = await ctx.db.ticket.update({
                where: { id: input.ticketId },
                data: { description: input.description },
                include: {
                    user: true,
                },
            });

            return updatedTicket;
        }),
});
