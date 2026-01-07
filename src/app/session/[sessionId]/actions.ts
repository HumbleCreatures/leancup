"use server";

import { cookies } from "next/headers";

export async function setUsernameCookie(sessionShortId: string, username: string) {
    const cookieStore = await cookies();
    cookieStore.set(`leancup_user_${sessionShortId}`, username, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false, // Allow client-side access for compatibility
        sameSite: "lax",
    });
}
