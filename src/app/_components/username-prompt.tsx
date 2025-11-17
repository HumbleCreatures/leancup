"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface UsernamePromptProps {
    sessionId: string;
    sessionShortId: string;
    existingUsernames: string[];
}

export function UsernamePrompt({
    sessionId,
    sessionShortId,
    existingUsernames,
}: UsernamePromptProps) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const joinSession = api.session.joinSession.useMutation({
        onSuccess: () => {
            // Set cookie on client side
            document.cookie = `leancup_user_${sessionShortId}=${encodeURIComponent(username)}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days

            // Refresh the page to show the session room
            router.refresh();
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setError("Username cannot be empty");
            return;
        }

        if (trimmedUsername.length > 50) {
            setError("Username must be 50 characters or less");
            return;
        }

        if (existingUsernames.includes(trimmedUsername)) {
            setError("This username is already taken in this session");
            return;
        }

        joinSession.mutate({
            sessionId,
            username: trimmedUsername,
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-lg">
                <h1 className="mb-2 font-inter text-3xl font-bold text-onSurface">
                    Join Session
                </h1>
                <p className="mb-6 font-inter text-sm text-onSurfaceVariant">
                    Session ID: <span className="font-mono font-semibold">{sessionShortId}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block font-inter text-sm font-medium text-onSurface"
                        >
                            Choose your username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full rounded-md border border-outline bg-surface px-4 py-2 font-inter text-onSurface placeholder-onSurfaceVariant focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={joinSession.isPending}
                            maxLength={50}
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 font-inter text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={joinSession.isPending || !username.trim()}
                        className="w-full rounded-md bg-primary px-4 py-3 font-inter font-semibold text-onPrimary transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        {joinSession.isPending ? "Joining..." : "Join Session"}
                    </button>
                </form>

                {existingUsernames.length > 0 && (
                    <div className="mt-6">
                        <p className="mb-2 font-inter text-xs text-onSurfaceVariant">
                            {existingUsernames.length} {existingUsernames.length === 1 ? "participant" : "participants"} in session
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
