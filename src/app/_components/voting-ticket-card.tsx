"use client";

interface VotingTicketCardProps {
    id: string;
    description: string;
    username: string;
    currentVotes: number;
    totalVotes?: number;
    pointsRemaining: number;
    onVote?: (ticketId: string, voteCount: number) => void;
}

export function VotingTicketCard({
    id,
    description,
    username,
    currentVotes,
    totalVotes,
    pointsRemaining,
    onVote,
}: VotingTicketCardProps) {
    // Calculate cost of current vote count
    const calculateCost = (count: number) => count * count;

    // Calculate cost of adding one more vote
    const currentCost = calculateCost(currentVotes);
    const nextCost = calculateCost(currentVotes + 1);
    const costToAddOne = nextCost - currentCost;

    const canAffordOne = pointsRemaining >= costToAddOne;

    const handleIncrement = () => {
        if (onVote && canAffordOne) {
            onVote(id, currentVotes + 1);
        }
    };

    const handleDecrement = () => {
        if (currentVotes > 0 && onVote) {
            onVote(id, currentVotes - 1);
        }
    };

    return (
        <div className="rounded-lg bg-surface p-4 shadow-sm border border-outline">
            <p className="text-sm text-onSurface whitespace-pre-wrap mb-2">
                {description}
            </p>
            <p className="text-xs text-onSurfaceVariant mb-3">by {username}</p>

            {totalVotes !== undefined && totalVotes > 0 && (
                <div className="mb-3 rounded bg-primaryContainer p-2">
                    <p className="text-xs font-medium text-onPrimaryContainer">
                        🗳️ Total votes: {totalVotes}
                    </p>
                </div>
            )}

            {onVote && (
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDecrement}
                        disabled={currentVotes === 0}
                        className="flex h-10 w-10 items-center justify-center rounded bg-error text-lg font-bold text-onError hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-onSurface">
                            {currentVotes}
                        </div>
                        <div className="text-xs text-onSurfaceVariant mt-1">
                            {currentVotes === 0 ? "No votes" : `costs ${calculateCost(currentVotes)} pts`}
                        </div>
                    </div>
                    <button
                        onClick={handleIncrement}
                        disabled={!canAffordOne}
                        className="flex h-10 w-10 items-center justify-center rounded bg-primary text-lg font-bold text-onPrimary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        +
                    </button>
                </div>
            )}

            {onVote && !canAffordOne && currentVotes === 0 && (
                <p className="text-xs text-error text-center mt-2">
                    Not enough points (need {costToAddOne} pts)
                </p>
            )}
        </div>
    );
}
