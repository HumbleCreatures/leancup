"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export function CreateSessionButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [sessionName, setSessionName] = useState("");
    const [error, setError] = useState("");

    const createSession = api.session.create.useMutation({
        onSuccess: (data) => {
            router.push(`/session/${data.shortId}`);
        },
        onError: (error) => {
            console.error("Failed to create session:", error);
            setError(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const trimmedName = sessionName.trim();

        if (!trimmedName) {
            setError("Session name cannot be empty");
            return;
        }

        if (trimmedName.length > 100) {
            setError("Session name must be 100 characters or less");
            return;
        }

        createSession.mutate({ name: trimmedName });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded-lg bg-primary px-8 py-4 font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
            >
                Create New Session
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
                        <h2 className="mb-4 text-2xl font-bold text-onSurface">
                            Create Session
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="sessionName"
                                    className="mb-2 block text-sm font-medium text-onSurface"
                                >
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    id="sessionName"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="e.g., Team Retrospective, Planning Session"
                                    className="w-full rounded-md border border-outline bg-white px-4 py-2 text-onSurface focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={createSession.isPending}
                                    maxLength={100}
                                    autoFocus
                                />
                                {error && (
                                    <p className="mt-2 text-sm text-red-600">{error}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSessionName("");
                                        setError("");
                                    }}
                                    disabled={createSession.isPending}
                                    className="flex-1 rounded-md border border-outline bg-surface px-4 py-2 font-semibold text-onSurface transition-colors hover:opacity-80 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSession.isPending || !sessionName.trim()}
                                    className="flex-1 rounded-md bg-primary px-4 py-2 font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                                >
                                    {createSession.isPending ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
