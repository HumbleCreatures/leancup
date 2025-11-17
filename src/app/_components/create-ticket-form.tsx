"use client";

import { useState } from "react";

interface CreateTicketFormProps {
    onSubmit: (description: string) => void;
    isLoading?: boolean;
}

export function CreateTicketForm({ onSubmit, isLoading }: CreateTicketFormProps) {
    const [description, setDescription] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmit(description.trim());
            setDescription("");
            setIsExpanded(false);
        }
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full rounded-lg border-2 border-dashed border-outline bg-surface p-4 text-left text-sm text-onSurfaceVariant hover:border-primary hover:bg-surfaceVariant transition-colors"
            >
                + Add a new ticket
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg bg-surface p-4 shadow-sm border border-outline">
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your discussion topic..."
                className="w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-onSurface placeholder:text-onSurfaceVariant focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                autoFocus
                disabled={isLoading}
            />
            <div className="mt-3 flex gap-2">
                <button
                    type="submit"
                    disabled={!description.trim() || isLoading}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-onPrimary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Adding..." : "Add Ticket"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setIsExpanded(false);
                        setDescription("");
                    }}
                    disabled={isLoading}
                    className="rounded bg-surfaceVariant px-4 py-2 text-sm font-medium text-onSurfaceVariant hover:opacity-90"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
