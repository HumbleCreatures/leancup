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
                style={{ backgroundColor: '#8C4A2F', color: '#FFFFFF' }}
                className="rounded-lg px-8 py-4 font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
            >
                Create New Session
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="w-full max-w-md rounded-lg p-6 shadow-xl" style={{ backgroundColor: '#FAFAFA' }}>
                        <h2 className="mb-4 text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                            Create Session
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="sessionName"
                                    className="mb-2 block text-sm font-medium"
                                    style={{ color: '#1A1A1A' }}
                                >
                                    Session Name
                                </label>
                                <input
                                    type="text"
                                    id="sessionName"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="e.g., Team Retrospective, Planning Session"
                                    className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderColor: '#767676',
                                        color: '#1A1A1A'
                                    }}
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
                                    className="flex-1 rounded-md border px-4 py-2 font-semibold transition-colors hover:opacity-80 disabled:opacity-50"
                                    style={{
                                        backgroundColor: '#FAFAFA',
                                        borderColor: '#767676',
                                        color: '#1A1A1A'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSession.isPending || !sessionName.trim()}
                                    className="flex-1 rounded-md px-4 py-2 font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                                    style={{
                                        backgroundColor: '#8C4A2F',
                                        color: '#FFFFFF'
                                    }}
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
