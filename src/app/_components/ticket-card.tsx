"use client";

import { useState } from "react";
import { User, Vote, Clock, Archive } from "lucide-react";

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
    timerStartedAt?: Date | null;
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
    archivedAt: _archivedAt,
    totalDiscussionMs,
    timerStartedAt,
    onMove,
    onDelete,
    onEdit,
}: TicketCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(description);
    const [touchClone, setTouchClone] = useState<HTMLElement | null>(null);

    // Determine if this ticket can be dragged
    const isTimerActive = space === "DOING" && timerStartedAt;
    const isDraggable = !isTimerActive && !isEditing;

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

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDraggable) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/json", JSON.stringify({
            ticketId: id,
            sourceSpace: space,
        }));
    };

    const handleDragEnd = () => {
        // Drag ended
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDraggable) return;

        const touch = e.touches[0];
        if (!touch) return;

        // Create a clone for visual feedback
        const target = e.currentTarget;
        const clone = target.cloneNode(true) as HTMLElement;
        clone.style.position = "fixed";
        clone.style.pointerEvents = "none";
        clone.style.zIndex = "1000";
        clone.style.opacity = "1";
        clone.style.width = `${target.offsetWidth}px`;
        clone.style.left = `${touch.clientX - target.offsetWidth / 2}px`;
        clone.style.top = `${touch.clientY - target.offsetHeight / 2}px`;
        clone.style.transform = "rotate(2deg)";
        document.body.appendChild(clone);
        setTouchClone(clone);

        // Store drag data on the element
        target.dataset.ticketId = id;
        target.dataset.sourceSpace = space;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchClone) return;

        const touch = e.touches[0];
        if (!touch) return;

        // Update clone position
        touchClone.style.left = `${touch.clientX - touchClone.offsetWidth / 2}px`;
        touchClone.style.top = `${touch.clientY - touchClone.offsetHeight / 2}px`;
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchClone) {
            touchClone.remove();
            setTouchClone(null);
        }

        const touch = e.changedTouches[0];
        if (!touch) return;

        // Find the element under the touch point
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!elementUnderTouch) return;

        // Find the drop zone (look for data-drop-zone attribute)
        const dropZone = elementUnderTouch.closest("[data-drop-zone]");
        if (!dropZone) return;

        const targetSpace = (dropZone as HTMLElement).dataset.dropZone;
        if (!targetSpace || targetSpace === space) return;

        // Trigger the drop event
        const dropEvent = new CustomEvent("ticketdrop", {
            detail: {
                ticketId: id,
                sourceSpace: space,
                targetSpace,
            },
        });
        dropZone.dispatchEvent(dropEvent);
    };

    return (
        <div
            draggable={isDraggable && space !== "ARCHIVE"}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
                rounded bg-white p-4 min-h-[180px] flex flex-col
                ${isDraggable && space !== "ARCHIVE" ? "cursor-grab active:cursor-grabbing" : ""}
                ${isTimerActive ? "cursor-not-allowed" : ""}
            `}
        >
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
                            className="rounded bg-primary px-3 py-1 text-sm font-medium text-white hover:opacity-90"
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
                    <div className="grow">
                        <p className="text-sm text-onSurface whitespace-pre-wrap mb-3">{description}</p>

                        {/* Author name with icon */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-300">
                                <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <span className="text-xs text-gray-600">by {username}</span>
                        </div>

                        {/* Metadata section with left border */}
                        {(voteCount !== undefined && voteCount > 0) || (space === "ARCHIVE" && (archivedBy || (totalDiscussionMs !== undefined && totalDiscussionMs > 0))) ? (
                            <div className="mb-3 rounded bg-surfaceVariant p-2 border-l-4 border-outline space-y-1">
                                {voteCount !== undefined && voteCount > 0 && (
                                    <p className="text-xs text-onSurfaceVariant flex items-center gap-1">
                                        <Vote className="h-3 w-3" />
                                        {voteCount} {voteCount === 1 ? "vote" : "votes"}
                                    </p>
                                )}
                                {space === "ARCHIVE" && archivedBy && (
                                    <p className="text-xs text-onSurfaceVariant flex items-center gap-1">
                                        <Archive className="h-3 w-3" />
                                        Archived by <span className="font-semibold">{archivedBy}</span>
                                    </p>
                                )}
                                {space === "ARCHIVE" && totalDiscussionMs !== undefined && totalDiscussionMs > 0 && (
                                    <p className="text-xs text-onSurfaceVariant flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Discussed for {formatDiscussionTime(totalDiscussionMs)}
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Action buttons section with top border - only for non-archived tickets */}
                    {space !== "ARCHIVE" && isOwner && space === "PERSONAL" && (
                        <div className="flex gap-2 border-t border-outline pt-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                            >
                                Edit
                            </button>
                            {onMove && (
                                <button
                                    onClick={() => onMove(id, "TODO")}
                                    className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                >
                                    TO DO
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(id)}
                                    className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}

                    {/* Move buttons for shared spaces - excluding ARCHIVE */}
                    {space !== "PERSONAL" && space !== "ARCHIVE" && (
                        <div className="flex gap-2 border-t border-outline pt-2">
                            {space !== "TODO" && onMove && (
                                <button
                                    onClick={() => onMove(id, "TODO")}
                                    className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                >
                                    TO DO
                                </button>
                            )}
                            {space !== "DOING" && onMove && (
                                <button
                                    onClick={() => onMove(id, "DOING")}
                                    className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                >
                                    DOING
                                </button>
                            )}
                            {space !== "ARCHIVE" && onMove && (
                                <button
                                    onClick={() => onMove(id, "ARCHIVE")}
                                    className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                >
                                    ARCHIVE
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
