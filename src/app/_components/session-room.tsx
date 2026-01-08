"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { User, Users, Copy, Check } from "lucide-react";
import { api } from "~/trpc/react";
import { CreateTicketForm } from "./create-ticket-form";
import { TicketCard } from "./ticket-card";
import { VotingTicketCard } from "./voting-ticket-card";
import { DiscussionTimer } from "./discussion-timer";
import { ContinuationVote } from "./continuation-vote";
import { ParticipantSheet } from "./participant-sheet";

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
    const [dragOverSpace, setDragOverSpace] = useState<string | null>(null);
    const [isParticipantSheetOpen, setIsParticipantSheetOpen] = useState(false);

    // Refs for drop zones to attach touch event listeners
    const doingZoneRef = useRef<HTMLDivElement>(null);
    const personalZoneRef = useRef<HTMLDivElement>(null);
    const todoZoneRef = useRef<HTMLDivElement>(null);
    const archiveZoneRef = useRef<HTMLDivElement>(null);

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

    // Presence heartbeat
    const updatePresence = api.session.updatePresence.useMutation();

    // Heartbeat system: Update presence every 10 seconds when page is visible
    useEffect(() => {
        const sendHeartbeat = () => {
            if (document.visibilityState === "visible") {
                updatePresence.mutate({ userId });
            }
        };

        // Send initial heartbeat
        sendHeartbeat();

        // Set up interval
        const intervalId = setInterval(sendHeartbeat, 10000); // Every 10 seconds

        // Handle visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                sendHeartbeat();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userId, updatePresence]);

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

    const handleMoveTicket = useCallback((ticketId: string, newSpace: string) => {
        moveTicket.mutate({
            ticketId,
            space: newSpace as "PERSONAL" | "TODO" | "DOING" | "ARCHIVE",
            userId,
            username,
        });
    }, [moveTicket, userId, username]);

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

    const startVote = api.voting.startVote.useMutation({
        onSuccess: () => {
            void utils.voting.getActiveVote.invalidate();
        },
    });

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

    const forceEndContinuationVote = api.continuation.forceEnd.useMutation({
        onSuccess: () => {
            void utils.continuation.getVotes.invalidate();
            void utils.ticket.getBySession.invalidate();
            void utils.ticket.getTimerState.invalidate();
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

    const handleForceEndContinuationVote = () => {
        if (!doingTicket) return;
        forceEndContinuationVote.mutate({
            ticketId: doingTicket.id,
        });
    };

    // Check if timer is complete (9 minutes elapsed)
    const DISCUSSION_DURATION_MS = 9 * 60 * 1000;
    const isTimerComplete = timerState && timerState.elapsedMs >= DISCUSSION_DURATION_MS;

    // Get total users for continuation voting
    const totalUsers = session?.users.length ?? 0;

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetSpace: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverSpace(targetSpace);
    };

    const handleDragLeave = () => {
        setDragOverSpace(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSpace: string) => {
        e.preventDefault();
        setDragOverSpace(null);

        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json")) as { ticketId: string; sourceSpace: string };
            const { ticketId, sourceSpace } = data;

            // Don't move if dropping in same space
            if (sourceSpace === targetSpace) {
                return;
            }

            // Validate move based on rules:
            // 1. Can only move to DOING if it's empty
            if (targetSpace === "DOING" && doingTickets.length > 0) {
                alert("Only one ticket can be in DOING at a time");
                return;
            }

            // 2. Can only move from PERSONAL to TODO, or from TODO to DOING/ARCHIVE
            if (sourceSpace === "PERSONAL" && targetSpace !== "TODO" && targetSpace !== "ARCHIVE") {
                return;
            }

            // Perform the move
            handleMoveTicket(ticketId, targetSpace);
        } catch (error) {
            console.error("Error handling drop:", error);
        }
    };

    // Attach touch drop event listeners
    useEffect(() => {
        const doingZone = doingZoneRef.current;
        const personalZone = personalZoneRef.current;
        const todoZone = todoZoneRef.current;
        const archiveZone = archiveZoneRef.current;

        // Touch drop handler
        const handleTouchDrop = (targetSpace: string) => (e: Event) => {
            const customEvent = e as CustomEvent;
            const { ticketId, sourceSpace } = customEvent.detail as {
                ticketId: string;
                sourceSpace: string;
                targetSpace: string;
            };

            // Don't move if dropping in same space
            if (sourceSpace === targetSpace) {
                return;
            }

            // Validate move based on rules
            if (targetSpace === "DOING" && doingTickets.length > 0) {
                alert("Only one ticket can be in DOING at a time");
                return;
            }

            if (sourceSpace === "PERSONAL" && targetSpace !== "TODO" && targetSpace !== "ARCHIVE") {
                return;
            }

            // Perform the move
            handleMoveTicket(ticketId, targetSpace);
        };

        const doingHandler = handleTouchDrop("DOING");
        const personalHandler = handleTouchDrop("PERSONAL");
        const todoHandler = handleTouchDrop("TODO");
        const archiveHandler = handleTouchDrop("ARCHIVE");

        if (doingZone) doingZone.addEventListener("ticketdrop", doingHandler);
        if (personalZone) personalZone.addEventListener("ticketdrop", personalHandler);
        if (todoZone) todoZone.addEventListener("ticketdrop", todoHandler);
        if (archiveZone) archiveZone.addEventListener("ticketdrop", archiveHandler);

        return () => {
            if (doingZone) doingZone.removeEventListener("ticketdrop", doingHandler);
            if (personalZone) personalZone.removeEventListener("ticketdrop", personalHandler);
            if (todoZone) todoZone.removeEventListener("ticketdrop", todoHandler);
            if (archiveZone) archiveZone.removeEventListener("ticketdrop", archiveHandler);
        };
    }, [doingTickets.length, handleMoveTicket]); // Re-attach when doingTickets changes for validation

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header with session info and user avatar */}
            <header className="bg-surface">
                <div className="container mx-auto flex items-center justify-between px-4 py-4" style={{ maxWidth: '748px' }}>
                    <div className="flex items-center gap-4">
                        <Image
                            src="/lean-cup-logo.png"
                            alt="Leancup"
                            width={40}
                            height={40}
                            className="shrink-0"
                        />
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
                                    className="rounded bg-secondaryContainer px-3 py-1 text-xs font-medium text-onSecondaryContainer hover:opacity-90 transition-opacity flex items-center gap-1"
                                >
                                    {copySuccess ? (
                                        <><Check className="h-3 w-3" /> Copied!</>
                                    ) : (
                                        <><Copy className="h-3 w-3" /> Copy Link</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* User Info Section */}
                    <div className="flex flex-col gap-2">
                        {/* Avatar and Username */}
                        <div className="flex items-center gap-3 px-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-600">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-inter text-sm font-medium text-onSurface">
                                {username}
                            </span>
                        </div>

                        {/* Participants Button */}
                        <button
                            onClick={() => setIsParticipantSheetOpen(true)}
                            className="rounded-lg bg-gray-200 px-3 py-2 hover:bg-gray-300 transition-colors"
                        >
                            <span className="font-inter text-xs text-gray-700 flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                {session?.users.length ?? 0} {session?.users.length === 1 ? "participant" : "participants"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Participant Sheet */}
            <ParticipantSheet
                users={session?.users ?? []}
                currentUserId={userId}
                isOpen={isParticipantSheetOpen}
                onClose={() => setIsParticipantSheetOpen(false)}
            />

            {/* Main content - Ticket Board */}
            <main className="container mx-auto flex-1 px-4 py-8" style={{ maxWidth: '748px' }}>
                <div className="flex flex-col gap-6">
                    {/* DOING Space - Always first/on top */}
                    <div
                        ref={doingZoneRef}
                        data-drop-zone="DOING"
                        className={`
                            rounded-lg bg-gray-200 p-4 transition-all
                            ${dragOverSpace === "DOING" ? "ring-4 ring-gray-400 scale-105" : ""}
                        `}
                        onDragOver={(e) => handleDragOver(e, "DOING")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "DOING")}
                    >
                        <h2 className="mb-4 font-inter text-lg font-semibold text-gray-800">
                            DOING
                        </h2>
                        <div className="flex flex-col items-center">
                            {doingTickets.map((ticket) => (
                                <div key={ticket.id} className="w-full space-y-3">
                                    <div className="flex justify-center pb-3 border-b border-gray-400">
                                        <div className="w-full max-w-sm">
                                            <TicketCard
                                                id={ticket.id}
                                                description={ticket.description}
                                                username={ticket.user.username}
                                                space={ticket.space}
                                                isOwner={ticket.userId === userId}
                                                voteCount={ticket.voteCount}
                                                timerStartedAt={ticket.timerStartedAt}
                                                onMove={handleMoveTicket}
                                                onDelete={handleDeleteTicket}
                                                onEdit={handleEditTicket}
                                            />
                                        </div>
                                    </div>

                                    {/* Show timer or continuation vote */}
                                    {isTimerComplete ? (
                                        <ContinuationVote
                                            ticketId={ticket.id}
                                            userId={userId}
                                            onVote={handleContinuationVote}
                                            onForceEnd={handleForceEndContinuationVote}
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
                                <p className="text-center text-sm text-gray-600">
                                    No ticket in DOING
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TO DO Space - Shows voting cards when voting is active */}
                    <div
                        ref={todoZoneRef}
                        data-drop-zone="TODO"
                        className={`
                            rounded-lg bg-gray-200 p-4 transition-all
                            ${dragOverSpace === "TODO" ? "ring-4 ring-gray-400 scale-105" : ""}
                        `}
                        onDragOver={(e) => handleDragOver(e, "TODO")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "TODO")}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-inter text-lg font-semibold text-gray-800">
                                TO DO {activeVote?.isActive && "(Voting)"}
                            </h2>
                            {!activeVote?.isActive && (
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600">
                                        {timerState?.isRunning
                                            ? "Timer is running"
                                            : todoTickets.length <= 1
                                                ? "Need at least 2 tickets"
                                                : ""}
                                    </span>
                                    <button
                                        onClick={() => startVote.mutate({ sessionId })}
                                        disabled={todoTickets.length <= 1 || startVote.isPending || (timerState?.isRunning ?? false)}
                                        className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {startVote.isPending ? "Starting..." : "Start Vote"}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <p className="text-center text-sm text-gray-600">
                                    No tickets in TO DO
                                </p>
                            )}
                        </div>
                    </div>

                    {/* My Tickets (Personal Space) */}
                    <div
                        ref={personalZoneRef}
                        data-drop-zone="PERSONAL"
                        className={`
                            rounded-lg bg-gray-200 p-4 transition-all
                            ${dragOverSpace === "PERSONAL" ? "ring-4 ring-gray-400 scale-105" : ""}
                        `}
                        onDragOver={(e) => handleDragOver(e, "PERSONAL")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "PERSONAL")}
                    >
                        <h2 className="mb-4 font-inter text-lg font-semibold text-gray-800">
                            My Tickets
                        </h2>
                        <div className="mb-3">
                            <CreateTicketForm
                                onSubmit={handleCreateTicket}
                                isLoading={createTicket.isPending}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <p className="text-center text-sm text-gray-600">
                                    No personal tickets yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ARCHIVE Space */}
                    <div
                        ref={archiveZoneRef}
                        data-drop-zone="ARCHIVE"
                        className={`
                            rounded-lg bg-gray-200 p-4 transition-all
                            ${dragOverSpace === "ARCHIVE" ? "ring-4 ring-gray-400 scale-105" : ""}
                        `}
                        onDragOver={(e) => handleDragOver(e, "ARCHIVE")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "ARCHIVE")}
                    >
                        <h2 className="mb-4 font-inter text-lg font-semibold text-gray-800">
                            ARCHIVE
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <p className="text-center text-sm text-gray-600">
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
