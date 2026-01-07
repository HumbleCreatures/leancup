"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { api } from "~/trpc/react";

interface DiscussionTimerProps {
    ticketId: string;
    onTimerComplete?: () => void;
}

const DISCUSSION_DURATION_MS = 9 * 60 * 1000; // 9 minutes

export function DiscussionTimer({
    ticketId,
    onTimerComplete,
}: DiscussionTimerProps) {
    const utils = api.useUtils();
    const [localElapsed, setLocalElapsed] = useState(0);

    // Query timer state
    const { data: timerState } = api.ticket.getTimerState.useQuery(
        { ticketId },
        { refetchInterval: 1000 }
    );

    // Mutations
    const startTimer = api.ticket.startTimer.useMutation({
        onSuccess: () => {
            void utils.ticket.getTimerState.invalidate();
        },
    });

    const pauseTimer = api.ticket.pauseTimer.useMutation({
        onSuccess: () => {
            void utils.ticket.getTimerState.invalidate();
        },
    });

    const resetTimer = api.ticket.resetTimer.useMutation({
        onSuccess: () => {
            void utils.ticket.getTimerState.invalidate();
            setLocalElapsed(0);
        },
    });

    // Update local elapsed time
    useEffect(() => {
        if (timerState && typeof timerState.elapsedMs === 'number') {
            setLocalElapsed(timerState.elapsedMs);
        }
    }, [timerState]);

    // Local timer for smooth countdown
    useEffect(() => {
        if (!timerState?.isRunning) return;

        const interval = setInterval(() => {
            setLocalElapsed((prev) => {
                const newElapsed = prev + 100;
                if (newElapsed >= DISCUSSION_DURATION_MS && onTimerComplete) {
                    onTimerComplete();
                }
                return newElapsed;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [timerState?.isRunning, onTimerComplete]);

    if (!timerState) {
        return null;
    }

    // Ensure we have valid numbers
    const elapsedMs = typeof localElapsed === 'number' && !isNaN(localElapsed) ? localElapsed : 0;
    const remainingMs = Math.max(0, DISCUSSION_DURATION_MS - elapsedMs);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const isComplete = remainingMs === 0;

    const progress = (elapsedMs / DISCUSSION_DURATION_MS) * 100;

    const handleStart = () => {
        startTimer.mutate({ ticketId });
    };

    const handlePause = () => {
        pauseTimer.mutate({ ticketId });
    };

    const handleReset = () => {
        resetTimer.mutate({ ticketId });
    };

    return (
        <div className="rounded-lg bg-primaryContainer p-4">
            {/* Timer Display */}
            <div className="flex items-center justify-center mb-4">
                <div
                    className={`text-5xl font-bold font-mono ${isComplete
                        ? "text-error"
                        : "text-onPrimaryContainer"
                        }`}
                >
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="h-2 bg-gray-400 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${isComplete ? "bg-error" : "bg-black"
                            }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                {!timerState.isRunning ? (
                    <>
                        <button
                            onClick={handleStart}
                            disabled={startTimer.isPending || isComplete}
                            className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Play className="h-4 w-4" />
                            {localElapsed === 0 ? "Start" : "Resume"}
                        </button>
                        {localElapsed > 0 && !isComplete && (
                            <button
                                onClick={handleReset}
                                disabled={resetTimer.isPending}
                                className="rounded bg-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        onClick={handlePause}
                        disabled={pauseTimer.isPending}
                        className="flex-1 rounded bg-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Pause className="h-4 w-4" />
                        Pause
                    </button>
                )}
            </div>

            {isComplete && (
                <p className="text-sm text-error font-medium text-center mt-3">
                    Time's up! Vote to continue or archive.
                </p>
            )}
        </div>
    );
}
