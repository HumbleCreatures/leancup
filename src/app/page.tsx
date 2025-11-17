import { CreateSessionButton } from "~/app/_components/create-session-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-inter text-5xl font-bold tracking-tight text-onBackground sm:text-6xl">
            Leancup
          </h1>
          <p className="max-w-2xl font-inter text-xl text-onBackground/80">
            Real-time Lean Coffee sessions with voting and time-boxed discussions.
            No login required, just create a session and share the link.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <CreateSessionButton />

          <div className="text-center">
            <p className="font-inter text-sm text-onBackground/60">
              Sessions auto-delete after 48 hours of inactivity
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          <h2 className="mb-4 font-inter text-2xl font-semibold text-onBackground">
            What is Lean Coffee?
          </h2>
          <p className="font-inter leading-relaxed text-onBackground/80">
            Lean Coffee is a structured, agenda-less meeting format. Participants create topics,
            vote on what to discuss, and use time-boxing to keep conversations focused and
            productive. Perfect for team retrospectives, planning sessions, or collaborative discussions.
          </p>
        </div>
      </div>
    </main>
  );
}
