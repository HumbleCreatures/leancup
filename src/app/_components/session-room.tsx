"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { CreateTicketForm } from "./create-ticket-form";
import { TicketCard } from "./ticket-card";
import { VotingPanel } from "./voting-panel";
import { VotingTicketCard } from "./voting-ticket-card";
import { DiscussionTimer } from "./discussion-timer";
import { ContinuationVote } from "./continuation-vote";

interface SessionRoomProps {
    sessionId: string;
    sessionShortId: string;
    username: string;
    userId: string;
}

export function SessionRoom({
    sessionId,
    sessionShortId,
    username,
    userId,
}: SessionRoomProps) {
    const utils = api.useUtils();
    const [copySuccess, setCopySuccess] = useState(false);

    // Query session data
    const { data: session } = api.session.getByShortId.useQuery(
        { shortId: sessionShortId },
        { refetchInterval: 5000 } // Poll every 5 seconds for now (will be replaced with subscriptions)
    );

    // Copy session link to clipboard
    const handleCopyLink = async () => {
        const url = `${window.location.origin}/session/${sessionShortId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Query tickets
    const { data: tickets = [] } = api.ticket.getBySession.useQuery(
        { sessionId, userId },
        { refetchInterval: 5000 }
    );

    // Mutations
    const createTicket = api.ticket.create.useMutation({
        onSuccess: () => {
            void utils.ticket.getBySession.invalidate();
        },
    });

    const moveTicket = api.ticket.moveToSpace.useMutation({
        onSuccess: () => {
            void utils.ticket.getBySession.invalidate();
        },
    });

    const deleteTicket = api.ticket.delete.useMutation({
        onSuccess: () => {
            void utils.ticket.getBySession.invalidate();
        },
    });

    const updateTicket = api.ticket.update.useMutation({
        onSuccess: () => {
            void utils.ticket.getBySession.invalidate();
        },
    });

    // Filter tickets by space
    const personalTickets = tickets.filter((t) => t.space === "PERSONAL");
    const todoTickets = tickets.filter((t) => t.space === "TODO");
    const doingTickets = tickets.filter((t) => t.space === "DOING");
    const archiveTickets = tickets.filter((t) => t.space === "ARCHIVE");

    const handleCreateTicket = (description: string) => {
        createTicket.mutate({
            sessionId,
            userId,
            description,
        });
    };

    const handleMoveTicket = (ticketId: string, newSpace: string) => {
        moveTicket.mutate({
            ticketId,
            space: newSpace as "PERSONAL" | "TODO" | "DOING" | "ARCHIVE",
            userId,
            username,
        });
    };

    const handleDeleteTicket = (ticketId: string) => {
        if (confirm("Are you sure you want to delete this ticket?")) {
            deleteTicket.mutate({ ticketId, userId });
        }
    };

    const handleEditTicket = (ticketId: string, newDescription: string) => {
        updateTicket.mutate({
            ticketId,
            userId,
            description: newDescription,
        });
    };

    // Voting
    const { data: activeVote } = api.voting.getActiveVote.useQuery(
        { sessionId },
        { refetchInterval: 3000 }
    );

    const { data: userVotes = [] } = api.voting.getVotes.useQuery(
        {
            votingSessionId: activeVote?.id ?? "",
            userId,
        },
        {
            enabled: !!activeVote,
            refetchInterval: 3000,
        }
    );

    const castVote = api.voting.castVote.useMutation({
        onSuccess: () => {
            void utils.voting.getVotes.invalidate();
            void utils.voting.getActiveVote.invalidate();
        },
    });

    const handleVote = (ticketId: string, voteCount: number) => {
        if (!activeVote) return;
        castVote.mutate({
            votingSessionId: activeVote.id,
            ticketId,
            userId,
            voteCount,
        });
    };

    // Get user's votes as a map for easy lookup
    const voteMap = new Map(userVotes.map((v) => [v.ticketId, v.voteCount]));

    // Calculate points for voting
    const pointsSpent = userVotes.reduce((sum, vote) => sum + vote.pointsCost, 0);
    const totalPoints = activeVote?.totalPoints ?? 0;
    const pointsRemaining = totalPoints - pointsSpent;

    // Get timer state for DOING ticket
    const doingTicket = doingTickets[0];
    const { data: timerState } = api.ticket.getTimerState.useQuery(
        { ticketId: doingTicket?.id ?? "" },
        {
            enabled: !!doingTicket,
            refetchInterval: 1000,
        }
    );

    // Continuation voting
    const { data: continuationVotes = [] } = api.continuation.getVotes.useQuery(
        { ticketId: doingTicket?.id ?? "" },
        {
            enabled: !!doingTicket,
            refetchInterval: 2000,
        }
    );

    const castContinuationVote = api.continuation.castVote.useMutation({
        onSuccess: () => {
            void utils.continuation.getVotes.invalidate();
            void utils.ticket.getBySession.invalidate();
        },
    });

    const handleContinuationVote = (vote: "continue" | "archive") => {
        if (!doingTicket) return;
        castContinuationVote.mutate({
            ticketId: doingTicket.id,
            userId,
            vote,
        });
    };

    // Check if timer is complete (9 minutes elapsed)
    const DISCUSSION_DURATION_MS = 9 * 60 * 1000;
    const isTimerComplete = timerState && timerState.elapsedMs >= DISCUSSION_DURATION_MS;

    // Get total users for continuation voting
    const totalUsers = session?.users.length ?? 0;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header with session info and user avatar */}
            <header className="border-b border-outline bg-surface">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-inter text-2xl font-bold text-onSurface">
                            {session?.name ?? "Loading..."}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-onSurfaceVariant">
                                {sessionShortId}
                            </span>
                            <button
                                onClick={handleCopyLink}
                                className="rounded bg-secondaryContainer px-3 py-1 text-xs font-medium text-onSecondaryContainer hover:opacity-90 transition-opacity"
                            >
                                {copySuccess ? "✓ Copied!" : "📋 Copy Link"}
                            </button>
                        </div>
                    </div>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-onPrimary">
                            <span className="font-inter text-sm font-semibold">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="font-inter text-sm font-medium text-onSurface">
                            {username}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content - Ticket Board */}
            <main className="container mx-auto flex-1 px-4 py-8">
                {/* Voting Panel */}
                <div className="mb-6">
                    <VotingPanel
                        sessionId={sessionId}
                        userId={userId}
                        username={username}
                        todoTicketCount={todoTickets.length}
                        isTimerRunning={timerState?.isRunning ?? false}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* DOING Space - Always first/on top */}
                    <div className="rounded-lg bg-primary p-4">
                        <h2 className="mb-4 font-inter text-lg font-semibold text-onPrimary">
                            DOING
                        </h2>
                        <div className="space-y-3">
                            {doingTickets.map((ticket) => (
                                <div key={ticket.id} className="space-y-3">
                                    <TicketCard
                                        id={ticket.id}
                                        description={ticket.description}
                                        username={ticket.user.username}
                                        space={ticket.space}
                                        isOwner={ticket.userId === userId}
                                        voteCount={ticket.voteCount}
                                        onMove={handleMoveTicket}
                                        onDelete={handleDeleteTicket}
                                        onEdit={handleEditTicket}
                                    />

                                    {/* Show timer or continuation vote */}
                                    {isTimerComplete ? (
                                        <ContinuationVote
                                            ticketId={ticket.id}
                                            userId={userId}
                                            onVote={handleContinuationVote}
                                            votes={continuationVotes}
                                            totalUsers={totalUsers}
                                        />
                                    ) : (
                                        <DiscussionTimer
                                            ticketId={ticket.id}
                                            onTimerComplete={() => {
                                                // Timer complete, continuation voting starts
                                                void utils.ticket.getTimerState.invalidate();
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                            {doingTickets.length === 0 && (
                                <p className="text-center text-sm text-onPrimary opacity-60">
                                    No ticket in DOING
                                </p>
                            )}
                        </div>
                    </div>

                    {/* My Tickets (Personal Space) */}
                    <div className="rounded-lg bg-primaryContainer p-4">
                        <h2 className="mb-4 font-inter text-lg font-semibold text-onPrimaryContainer">
                            My Tickets
                        </h2>
                        <div className="space-y-3">
                            <CreateTicketForm
                                onSubmit={handleCreateTicket}
                                isLoading={createTicket.isPending}
                            />
                            {personalTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    id={ticket.id}
                                    description={ticket.description}
                                    username={ticket.user.username}
                                    space={ticket.space}
                                    isOwner={ticket.userId === userId}
                                    voteCount={ticket.voteCount}
                                    onMove={handleMoveTicket}
                                    onDelete={handleDeleteTicket}
                                    onEdit={handleEditTicket}
                                />
                            ))}
                            {personalTickets.length === 0 && (
                                <p className="text-center text-sm text-onPrimaryContainer opacity-60">
                                    No personal tickets yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TO DO Space - Shows voting cards when voting is active */}
                    <div className="rounded-lg bg-secondaryContainer p-4">
                        <h2 className="mb-4 font-inter text-lg font-semibold text-onSecondaryContainer">
                            TO DO {activeVote?.isActive && "(Voting)"}
                        </h2>
                        <div className="space-y-3">
                            {activeVote?.isActive ? (
                                // Show voting cards during voting
                                todoTickets.map((ticket) => (
                                    <VotingTicketCard
                                        key={ticket.id}
                                        id={ticket.id}
                                        description={ticket.description}
                                        username={ticket.user.username}
                                        currentVotes={voteMap.get(ticket.id) ?? 0}
                                        totalVotes={ticket.voteCount > 0 ? ticket.voteCount : undefined}
                                        pointsRemaining={pointsRemaining}
                                        onVote={handleVote}
                                    />
                                ))
                            ) : (
                                // Show normal ticket cards when not voting
                                todoTickets.map((ticket) => (
                                    <TicketCard
                                        key={ticket.id}
                                        id={ticket.id}
                                        description={ticket.description}
                                        username={ticket.user.username}
                                        space={ticket.space}
                                        isOwner={ticket.userId === userId}
                                        voteCount={ticket.voteCount}
                                        onMove={handleMoveTicket}
                                        onDelete={handleDeleteTicket}
                                        onEdit={handleEditTicket}
                                    />
                                ))
                            )}
                            {todoTickets.length === 0 && (
                                <p className="text-center text-sm text-onSecondaryContainer opacity-60">
                                    No tickets in TO DO
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ARCHIVE Space */}
                    <div className="rounded-lg bg-surfaceVariant p-4">
                        <h2 className="mb-4 font-inter text-lg font-semibold text-onSurfaceVariant">
                            ARCHIVE
                        </h2>
                        <div className="space-y-3">
                            {archiveTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    id={ticket.id}
                                    description={ticket.description}
                                    username={ticket.user.username}
                                    space={ticket.space}
                                    isOwner={ticket.userId === userId}
                                    voteCount={ticket.voteCount}
                                    archivedBy={ticket.archivedBy}
                                    archivedAt={ticket.archivedAt}
                                    totalDiscussionMs={ticket.totalDiscussionMs}
                                    onMove={handleMoveTicket}
                                    onDelete={handleDeleteTicket}
                                    onEdit={handleEditTicket}
                                />
                            ))}
                            {archiveTickets.length === 0 && (
                                <p className="text-center text-sm text-onSurfaceVariant opacity-60">
                                    No archived tickets
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
