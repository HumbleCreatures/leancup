"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface VotingPanelProps {
    sessionId: string;
    userId: string;
    username: string;
    todoTicketCount: number;
    isTimerRunning?: boolean;
}

export function VotingPanel({
    sessionId,
    userId,
    username,
    todoTicketCount,
    isTimerRunning = false,
}: VotingPanelProps) {
    const utils = api.useUtils();
    const [showForceCloseConfirm, setShowForceCloseConfirm] = useState(false);

    // Query active voting session
    const { data: activeVote } = api.voting.getActiveVote.useQuery(
        { sessionId },
        { refetchInterval: 3000 }
    );

    // Query user's votes
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

    // Mutations
    const startVote = api.voting.startVote.useMutation({
        onSuccess: () => {
            void utils.voting.getActiveVote.invalidate();
        },
    });

    const markDone = api.voting.markDone.useMutation({
        onSuccess: () => {
            void utils.voting.getActiveVote.invalidate();
            void utils.ticket.getBySession.invalidate();
        },
    });

    const forceClose = api.voting.forceClose.useMutation({
        onSuccess: () => {
            void utils.voting.getActiveVote.invalidate();
            void utils.ticket.getBySession.invalidate();
            setShowForceCloseConfirm(false);
        },
    });

    const handleStartVote = () => {
        if (todoTicketCount <= 1) {
            alert("Need at least 2 tickets in TODO to start voting");
            return;
        }
        startVote.mutate({ sessionId });
    };

    const handleMarkDone = () => {
        if (!activeVote) return;
        markDone.mutate({
            votingSessionId: activeVote.id,
            userId,
        });
    };

    const handleForceClose = () => {
        if (!activeVote) return;
        forceClose.mutate({
            votingSessionId: activeVote.id,
            userId,
            username,
        });
    };

    // Calculate points spent
    const pointsSpent = userVotes.reduce((sum, vote) => sum + vote.pointsCost, 0);
    const totalPoints = activeVote?.totalPoints ?? 0;
    const pointsRemaining = totalPoints - pointsSpent;

    // Check if current user is done
    const currentUserStatus = activeVote?.voterStatuses.find(
        (status) => status.userId === userId
    );
    const isDone = currentUserStatus?.isDone ?? false;

    // Check how many users are done
    const doneCount = activeVote?.voterStatuses.filter((s) => s.isDone).length ?? 0;
    const totalUsers = activeVote?.voterStatuses.length ?? 0;

    if (!activeVote) {
        return (
            <div className="rounded-lg bg-surface p-4 border border-outline">
                <h3 className="font-inter text-lg font-semibold text-onSurface mb-3">
                    Voting
                </h3>
                <p className="text-sm text-onSurfaceVariant mb-4">
                    No active vote. Need at least 2 tickets in TODO to start voting.
                    {isTimerRunning && " Cannot start voting while discussion is in progress."}
                </p>
                <button
                    onClick={handleStartVote}
                    disabled={todoTicketCount <= 1 || startVote.isPending || isTimerRunning}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {startVote.isPending ? "Starting..." : "Start Vote"}
                </button>
            </div>
        );
    }

    // Show message if vote was force closed
    if (activeVote.forceClosedBy) {
        return (
            <div className="rounded-lg bg-surface p-4 border border-outline">
                <h3 className="font-inter text-lg font-semibold text-onSurface mb-3">
                    Vote Closed
                </h3>
                <p className="text-sm text-error font-medium">
                    The vote was force closed by {activeVote.forceClosedBy}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-surface p-4 border border-outline">
            <h3 className="font-inter text-lg font-semibold text-onSurface mb-3">
                Voting in Progress
            </h3>

            {/* Points Display */}
            <div className="mb-4 rounded bg-primaryContainer p-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-onPrimaryContainer">
                        Your Points
                    </span>
                    <span className="text-lg font-bold text-onPrimaryContainer">
                        {pointsRemaining} / {totalPoints}
                    </span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all"
                        style={{
                            width: `${(pointsSpent / totalPoints) * 100}%`,
                        }}
                    />
                </div>
                <p className="text-xs text-onPrimaryContainer mt-2">
                    {pointsSpent} points spent • Quadratic voting: 1²=1, 2²=4, 3²=9...
                </p>
            </div>

            {/* Voter Status */}
            <div className="mb-4">
                <p className="text-sm text-onSurfaceVariant mb-2">
                    Voters ready: {doneCount} / {totalUsers}
                </p>
                <div className="flex flex-wrap gap-2">
                    {activeVote.voterStatuses.map((status) => (
                        <div
                            key={status.userId}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${status.isDone
                                ? "bg-primary text-white"
                                : "bg-surfaceVariant text-onSurfaceVariant"
                                }`}
                        >
                            {status.user.username}
                            {status.isDone && " ✓"}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {!isDone ? (
                    <button
                        onClick={handleMarkDone}
                        disabled={markDone.isPending}
                        className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                        {markDone.isPending ? "Submitting..." : "Done Voting"}
                    </button>
                ) : (
                    <div className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-center text-white">
                        ✓ You&apos;re done voting
                    </div>
                )}

                {isDone && !showForceCloseConfirm && (
                    <button
                        onClick={() => setShowForceCloseConfirm(true)}
                        className="rounded bg-error px-4 py-2 text-sm font-medium text-onError hover:opacity-90"
                    >
                        Force Close
                    </button>
                )}

                {showForceCloseConfirm && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleForceClose}
                            disabled={forceClose.isPending}
                            className="rounded bg-error px-3 py-2 text-sm font-medium text-onError hover:opacity-90"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowForceCloseConfirm(false)}
                            className="rounded bg-surfaceVariant px-3 py-2 text-sm font-medium text-onSurfaceVariant hover:opacity-90"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
