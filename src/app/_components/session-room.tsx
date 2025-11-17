"use client";

import { api } from "~/trpc/react";

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
    // Query session data
    const { data: session } = api.session.getByShortId.useQuery(
        { shortId: sessionShortId },
        { refetchInterval: 5000 } // Poll every 5 seconds for now (will be replaced with subscriptions)
    );

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header with user avatar */}
            <header className="border-b border-outline bg-surface">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <h1 className="font-inter text-xl font-semibold text-onSurface">
                            Session: <span className="font-mono">{sessionShortId}</span>
                        </h1>
                    </div>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-onPrimary">
                            <span className="font-inter text-sm font-semibold">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="font-inter text-sm font-medium text-onSurface">
                            {username}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto flex-1 px-4 py-8">
                <div className="rounded-lg bg-surface p-8 text-center">
                    <h2 className="mb-4 font-inter text-2xl font-semibold text-onSurface">
                        Welcome to the Session!
                    </h2>
                    <p className="font-inter text-onSurfaceVariant">
                        You are logged in as <span className="font-semibold">{username}</span>
                    </p>

                    {/* Participants list */}
                    {session?.users && session.users.length > 0 && (
                        <div className="mt-8">
                            <h3 className="mb-4 font-inter text-lg font-medium text-onSurface">
                                Participants ({session.users.length})
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {session.users.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-2 rounded-full px-4 py-2 ${user.id === userId
                                                ? "bg-primaryContainer text-onPrimaryContainer"
                                                : "bg-secondaryContainer text-onSecondaryContainer"
                                            }`}
                                    >
                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full ${user.id === userId
                                                    ? "bg-primary text-onPrimary"
                                                    : "bg-secondary text-onSecondary"
                                                }`}
                                        >
                                            <span className="font-inter text-xs font-semibold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-inter text-sm font-medium">
                                            {user.username}
                                            {user.id === userId && " (you)"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="mt-8 font-inter text-sm text-onSurfaceVariant">
                        Session features (tickets, voting, timer) coming soon!
                    </p>
                </div>
            </main>
        </div>
    );
}
