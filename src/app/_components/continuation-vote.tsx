"use client";

import { useState } from "react";

interface ContinuationVoteProps {
    ticketId: string;
    userId: string;
    onVote: (vote: "continue" | "archive") => void;
    votes?: Array<{ userId: string; vote: string; user: { username: string } }>;
    totalUsers: number;
}

export function ContinuationVote({
    ticketId,
    userId,
    onVote,
    votes = [],
    totalUsers,
}: ContinuationVoteProps) {
    const [hasVoted, setHasVoted] = useState(false);
    const userVote = votes.find((v) => v.userId === userId);
    const continueVotes = votes.filter((v) => v.vote === "continue").length;
    const archiveVotes = votes.filter((v) => v.vote === "archive").length;

    const handleVote = (vote: "continue" | "archive") => {
        onVote(vote);
        setHasVoted(true);
    };

    // Check if everyone has voted
    const allVoted = votes.length === totalUsers;

    return (
        <div className="rounded-lg bg-surface p-4 border border-outline">
            <h3 className="font-inter text-lg font-semibold text-onSurface mb-3">
                Continue Discussion?
            </h3>
            <p className="text-sm text-onSurfaceVariant mb-4">
                Time's up! Vote to continue for another 9 minutes or archive this ticket.
            </p>

            {/* Vote Status */}
            <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded bg-primaryContainer p-3 text-center">
                    <div className="text-2xl font-bold text-onPrimaryContainer">
                        {continueVotes}
                    </div>
                    <div className="text-xs text-onPrimaryContainer">
                        👍 Continue
                    </div>
                </div>
                <div className="rounded bg-surfaceVariant p-3 text-center">
                    <div className="text-2xl font-bold text-onSurfaceVariant">
                        {archiveVotes}
                    </div>
                    <div className="text-xs text-onSurfaceVariant">
                        👎 Archive
                    </div>
                </div>
            </div>

            <p className="text-xs text-onSurfaceVariant mb-4 text-center">
                Votes: {votes.length} / {totalUsers}
            </p>

            {/* Voting Buttons */}
            {!userVote ? (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleVote("continue")}
                        disabled={hasVoted}
                        className="rounded bg-primary px-4 py-3 text-sm font-medium text-onPrimary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        👍 Continue
                    </button>
                    <button
                        onClick={() => handleVote("archive")}
                        disabled={hasVoted}
                        className="rounded bg-secondary px-4 py-3 text-sm font-medium text-onSecondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        👎 Archive
                    </button>
                </div>
            ) : (
                <div className="rounded bg-primaryContainer p-3 text-center">
                    <p className="text-sm font-medium text-onPrimaryContainer">
                        You voted: {userVote.vote === "continue" ? "👍 Continue" : "👎 Archive"}
                    </p>
                </div>
            )}

            {allVoted && (
                <p className="text-sm text-primary font-medium text-center mt-3">
                    {continueVotes > archiveVotes
                        ? "Discussion continues! Starting new 9-minute session..."
                        : "Moving to archive..."}
                </p>
            )}
        </div>
    );
}
