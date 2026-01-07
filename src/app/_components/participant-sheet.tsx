"use client";

import { X, User } from "lucide-react";

interface User {
    id: string;
    username: string;
    lastSeen: Date;
}

interface ParticipantSheetProps {
    users: User[];
    currentUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ParticipantSheet({ users, currentUserId, isOpen, onClose }: ParticipantSheetProps) {
    // Determine if a user is online (last seen within 30 seconds)
    const isOnline = (lastSeen: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(lastSeen).getTime();
        return diffMs < 30000; // 30 seconds
    };

    // Format last seen time
    const formatLastSeen = (lastSeen: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(lastSeen).getTime();
        const diffSeconds = Math.floor(diffMs / 1000);

        if (diffSeconds < 30) return "online";

        // Show time in HH:MM format
        const date = new Date(lastSeen);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `Last seen ${hours}:${minutes}`;
    };

    // Sort users: current user first, then by online status, then alphabetically
    const sortedUsers = [...users].sort((a, b) => {
        // Current user always first
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;

        // Then by online status
        const aOnline = isOnline(a.lastSeen);
        const bOnline = isOnline(b.lastSeen);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;

        // Then alphabetically
        return a.username.localeCompare(b.username);
    });

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <h2 className="font-inter text-lg font-semibold text-onSurface">
                        Participants ({users.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-surfaceVariant transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-onSurface" />
                    </button>
                </div>

                {/* Participant list */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {sortedUsers.map((user) => {
                            const online = isOnline(user.lastSeen);
                            const isCurrentUser = user.id === currentUserId;

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 rounded px-3 py-2 hover:bg-surfaceVariant transition-colors"
                                >
                                    {/* Status indicator */}
                                    <div
                                        className={`h-2 w-2 rounded-full shrink-0 ${online ? "bg-green-500" : "bg-gray-400"
                                            } ${online ? "animate-pulse" : ""}`}
                                        title={online ? "Online" : "Offline"}
                                    />

                                    {/* User avatar */}
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCurrentUser
                                                ? "bg-gray-600"
                                                : "bg-gray-300"
                                            }`}
                                    >
                                        <User className={`h-5 w-5 ${isCurrentUser ? "text-white" : "text-gray-600"}`} />
                                    </div>

                                    {/* Username and status */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-medium text-onSurface truncate">
                                                {user.username}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="text-xs text-onSurfaceVariant">(you)</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-onSurfaceVariant">
                                            {formatLastSeen(user.lastSeen)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
