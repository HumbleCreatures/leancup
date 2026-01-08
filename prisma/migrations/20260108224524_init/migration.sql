-- CreateTable
CREATE TABLE "leancup_post" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "leancup_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leancup_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leancup_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leancup_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "leancup_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leancup_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leancup_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leancup_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leancup_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lean_session" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lean_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "space" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timerStartedAt" TIMESTAMP(3),
    "timerPausedAt" TIMESTAMP(3),
    "totalDiscussionMs" INTEGER NOT NULL DEFAULT 0,
    "archivedBy" TEXT,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_session" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "forceClosedBy" TEXT,

    CONSTRAINT "voting_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voter_status" (
    "id" TEXT NOT NULL,
    "votingSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voter_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" TEXT NOT NULL,
    "votingSessionId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_session" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "discussion_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "continuation_vote" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "continuation_vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leancup_post_name_idx" ON "leancup_post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "leancup_user_email_key" ON "leancup_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "leancup_session_token_key" ON "leancup_session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "lean_session_shortId_key" ON "lean_session"("shortId");

-- CreateIndex
CREATE INDEX "lean_session_shortId_idx" ON "lean_session"("shortId");

-- CreateIndex
CREATE INDEX "session_user_sessionId_idx" ON "session_user"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_user_sessionId_username_key" ON "session_user"("sessionId", "username");

-- CreateIndex
CREATE INDEX "ticket_sessionId_space_idx" ON "ticket"("sessionId", "space");

-- CreateIndex
CREATE INDEX "ticket_userId_idx" ON "ticket"("userId");

-- CreateIndex
CREATE INDEX "voting_session_sessionId_idx" ON "voting_session"("sessionId");

-- CreateIndex
CREATE INDEX "voter_status_votingSessionId_idx" ON "voter_status"("votingSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "voter_status_votingSessionId_userId_key" ON "voter_status"("votingSessionId", "userId");

-- CreateIndex
CREATE INDEX "vote_votingSessionId_idx" ON "vote"("votingSessionId");

-- CreateIndex
CREATE INDEX "vote_ticketId_idx" ON "vote"("ticketId");

-- CreateIndex
CREATE INDEX "vote_userId_idx" ON "vote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_votingSessionId_ticketId_userId_key" ON "vote"("votingSessionId", "ticketId", "userId");

-- CreateIndex
CREATE INDEX "discussion_session_ticketId_idx" ON "discussion_session"("ticketId");

-- CreateIndex
CREATE INDEX "continuation_vote_ticketId_idx" ON "continuation_vote"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "continuation_vote_ticketId_userId_key" ON "continuation_vote"("ticketId", "userId");

-- AddForeignKey
ALTER TABLE "leancup_post" ADD CONSTRAINT "leancup_post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "leancup_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leancup_session" ADD CONSTRAINT "leancup_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "leancup_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leancup_account" ADD CONSTRAINT "leancup_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "leancup_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_user" ADD CONSTRAINT "session_user_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "lean_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "lean_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "session_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_session" ADD CONSTRAINT "voting_session_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "lean_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voter_status" ADD CONSTRAINT "voter_status_votingSessionId_fkey" FOREIGN KEY ("votingSessionId") REFERENCES "voting_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voter_status" ADD CONSTRAINT "voter_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "session_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "session_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_session" ADD CONSTRAINT "discussion_session_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "continuation_vote" ADD CONSTRAINT "continuation_vote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "continuation_vote" ADD CONSTRAINT "continuation_vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "session_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
