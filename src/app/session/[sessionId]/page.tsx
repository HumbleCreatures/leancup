import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SessionRoom } from "~/app/_components/session-room";
import { UsernamePrompt } from "~/app/_components/username-prompt";
import { api } from "~/trpc/server";

interface SessionPageProps {
    params: Promise<{
        sessionId: string;
    }>;
}

export default async function SessionPage(props: SessionPageProps) {
    const params = await props.params;
    const sessionId = params.sessionId;

    // Validate session exists
    let session;
    try {
        session = await api.session.getByShortId({ shortId: sessionId });
    } catch {
        notFound();
    }

    // Check if user has a username cookie for this session
    const cookieStore = await cookies();
    const usernameCookie = cookieStore.get(`leancup_user_${sessionId}`);
    const storedUsername = usernameCookie?.value;

    // If username exists in cookie, verify it's still valid in the session
    if (storedUsername) {
        const existingUser = session.users.find((u: { username: string }) => u.username === storedUsername);

        if (existingUser) {
            // User exists, show the session room
            return (
                <SessionRoom
                    sessionId={session.id}
                    sessionShortId={session.shortId}
                    username={storedUsername}
                    userId={existingUser.id}
                />
            );
        }
    }

    // No valid username found, show username prompt
    return (
        <UsernamePrompt
            sessionId={session.id}
            sessionShortId={sessionId}
            existingUsernames={session.users.map((u: { username: string }) => u.username)}
        />
    );
}
