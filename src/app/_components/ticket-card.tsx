"use client";

import { useState } from "react";

interface TicketCardProps {
    id: string;
    description: string;
    username: string;
    space: string;
    isOwner: boolean;
    voteCount?: number;
    archivedBy?: string | null;
    archivedAt?: Date | null;
    totalDiscussionMs?: number;
    onMove?: (ticketId: string, newSpace: string) => void;
    onDelete?: (ticketId: string) => void;
    onEdit?: (ticketId: string, newDescription: string) => void;
}

export function TicketCard({
    id,
    description,
    username,
    space,
    isOwner,
    voteCount,
    archivedBy,
    archivedAt,
    totalDiscussionMs,
    onMove,
    onDelete,
    onEdit,
}: TicketCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(description);

    // Format discussion time
    const formatDiscussionTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    const handleSaveEdit = () => {
        if (editedDescription.trim() && onEdit) {
            onEdit(id, editedDescription.trim());
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedDescription(description);
        setIsEditing(false);
    };

    return (
        <div className="rounded-lg bg-surface p-4 shadow-sm border border-outline">
            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-onSurface focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveEdit}
                            className="rounded bg-primary px-3 py-1 text-sm font-medium text-onPrimary hover:opacity-90"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="rounded bg-surfaceVariant px-3 py-1 text-sm font-medium text-onSurfaceVariant hover:opacity-90"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-sm text-onSurface whitespace-pre-wrap">{description}</p>

                    {/* Vote count display */}
                    {voteCount !== undefined && voteCount > 0 && (
                        <div className="mt-2 rounded bg-primaryContainer px-2 py-1 inline-block">
                            <span className="text-xs font-semibold text-onPrimaryContainer">
                                🗳️ {voteCount} {voteCount === 1 ? "vote" : "votes"}
                            </span>
                        </div>
                    )}

                    {/* Archive metadata */}
                    {space === "ARCHIVE" && (
                        <div className="mt-3 rounded bg-surfaceVariant p-2 border-l-4 border-outline">
                            {archivedBy && (
                                <p className="text-xs text-onSurfaceVariant">
                                    📦 Archived by <span className="font-semibold">{archivedBy}</span>
                                </p>
                            )}
                            {totalDiscussionMs !== undefined && totalDiscussionMs > 0 && (
                                <p className="text-xs text-onSurfaceVariant mt-1">
                                    ⏱️ Discussed for {formatDiscussionTime(totalDiscussionMs)}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-onSurfaceVariant">by {username}</span>

                        {isOwner && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Edit
                                </button>
                                {space === "PERSONAL" && onMove && (
                                    <button
                                        onClick={() => onMove(id, "TODO")}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Move to TODO
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(id)}
                                        className="text-xs text-error hover:underline"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Move buttons for shared spaces */}
                    {space !== "PERSONAL" && (
                        <div className="mt-3 flex gap-2 border-t border-outline pt-2">
                            {space !== "TODO" && onMove && (
                                <button
                                    onClick={() => onMove(id, "TODO")}
                                    className="rounded bg-secondaryContainer px-2 py-1 text-xs font-medium text-onSecondaryContainer hover:opacity-90"
                                >
                                    → TO DO
                                </button>
                            )}
                            {space !== "DOING" && onMove && (
                                <button
                                    onClick={() => onMove(id, "DOING")}
                                    className="rounded bg-primaryContainer px-2 py-1 text-xs font-medium text-onPrimaryContainer hover:opacity-90"
                                >
                                    → DOING
                                </button>
                            )}
                            {space !== "ARCHIVE" && onMove && (
                                <button
                                    onClick={() => onMove(id, "ARCHIVE")}
                                    className="rounded bg-surfaceVariant px-2 py-1 text-xs font-medium text-onSurfaceVariant hover:opacity-90"
                                >
                                    → ARCHIVE
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
