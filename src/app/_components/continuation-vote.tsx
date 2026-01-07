"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ContinuationVoteProps {
    ticketId: string;
    userId: string;
    onVote: (vote: "continue" | "archive") => void;
    onForceEnd?: () => void;
    votes?: Array<{ userId: string; vote: string; user: { username: string } }>;
    totalUsers: number;
}

export function ContinuationVote({
    ticketId,
    userId,
    onVote,
    onForceEnd,
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
        <div className="p-4">
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
                    <div className="text-xs text-onPrimaryContainer flex items-center justify-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> Continue
                    </div>
                </div>
                <div className="rounded bg-surfaceVariant p-3 text-center">
                    <div className="text-2xl font-bold text-onSurfaceVariant">
                        {archiveVotes}
                    </div>
                    <div className="text-xs text-onSurfaceVariant flex items-center justify-center gap-1">
                        <ThumbsDown className="h-3 w-3" /> Archive
                    </div>
                </div>
            </div>

            <p className="text-xs text-onSurfaceVariant mb-4 text-center">
                Votes: {votes.length} / {totalUsers}
            </p>

            {/* Voting Buttons */}
            {!userVote ? (
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                        onClick={() => handleVote("continue")}
                        disabled={hasVoted}
                        className="rounded bg-primary px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ThumbsUp className="h-4 w-4" /> Continue
                    </button>
                    <button
                        onClick={() => handleVote("archive")}
                        disabled={hasVoted}
                        className="rounded bg-secondary px-4 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ThumbsDown className="h-4 w-4" /> Archive
                    </button>
                </div>
            ) : (
                <div className="rounded bg-primaryContainer p-3 text-center mb-3">
                    <p className="text-sm font-medium text-onPrimaryContainer flex items-center justify-center gap-2">
                        You voted: {userVote.vote === "continue" ? (
                            <><ThumbsUp className="h-4 w-4" /> Continue</>
                        ) : (
                            <><ThumbsDown className="h-4 w-4" /> Archive</>
                        )}
                    </p>
                </div>
            )}

            {/* Force End Button - Always visible */}
            {onForceEnd && (
                <button
                    onClick={onForceEnd}
                    className="w-full rounded bg-gray-700 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                >
                    Force End Vote
                </button>
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
