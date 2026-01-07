"use client";

interface User {
    id: string;
    username: string;
    lastSeen: Date;
}

interface UserPresenceListProps {
    users: User[];
    currentUserId: string;
}

export function UserPresenceList({ users, currentUserId }: UserPresenceListProps) {
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

    return (
        <div className="rounded-lg bg-surface border border-outline p-4">
            <h3 className="mb-3 font-inter text-sm font-semibold text-onSurface">
                Participants ({users.length})
            </h3>
            <div className="space-y-2">
                {sortedUsers.map((user) => {
                    const online = isOnline(user.lastSeen);
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <div
                            key={user.id}
                            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surfaceVariant transition-colors"
                        >
                            {/* Status indicator */}
                            <div
                                className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-gray-400"
                                    } ${online ? "animate-pulse" : ""}`}
                                title={online ? "Online" : "Offline"}
                            />

                            {/* User avatar */}
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isCurrentUser
                                    ? "bg-primary text-onPrimary"
                                    : "bg-secondaryContainer text-onSecondaryContainer"
                                    }`}
                            >
                                {user.username.charAt(0).toUpperCase()}
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
    );
}
