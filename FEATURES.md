# Leancup Features Checklist

## Project Setup
- [x] Initialize Next.js with TypeScript
- [x] Configure Tailwind CSS with Material Design 3 theme
- [x] Set up Inter font
- [x] Configure Prisma with PostgreSQL
- [ ] Set up Redis connection
- [ ] Configure tRPC with subscriptions
- [x] Set up Docker and Docker Compose
- [x] Configure environment variables

## Database Schema
- [x] Design Session model (id, shortId, createdAt, lastInteractionAt)
- [x] Design User model (name, sessionId, lastSeen)
- [x] Design Ticket model (title, description, space, votes, userId, sessionId)
- [x] Design SessionState model (state, currentTicketId, timerEndTime)
- [x] Create Prisma migrations
- [x] Set up database indexes

## Authentication & User Management
- [x] Cookie-based user name persistence
- [x] Join session with unique name validation
- [x] Real-time user presence list
- [x] Handle user reconnection
- [x] Session joining flow

### Enhanced User Presence
- [x] Track users actively viewing the session page
- [x] Display online/offline status indicators
- [x] Show "last seen" timestamp for inactive users
- [x] Update presence status on page visibility change
- [x] Heartbeat system to detect disconnected users

## Start Page
- [x] Create landing page layout
- [x] Add Lean Coffee description
- [ ] Add links to Lean Coffee resources
- [x] "New Session" button with session creation
- [x] Generate short unique session IDs
- [ ] Join existing session input

## Session States Management
- [ ] Neutral/Start/Pause state implementation
- [ ] Voting state implementation
- [ ] Discussion state implementation
- [ ] State transition logic
- [ ] Persist state in database

## Ticket Management
- [x] Personal space (private tickets)
- [x] TO DO space (shared tickets)
- [x] DOING space (active discussion)
- [x] ARCHIVE space (completed tickets)
- [x] Create ticket functionality
- [x] Move tickets between spaces
- [x] Delete tickets
- [x] Edit ticket details

### Drag and Drop
- [x] Drag tickets from PERSONAL to TODO
- [x] Drag tickets from TODO to DOING (only if DOING is empty)
- [x] Drag tickets to ARCHIVE from any space
- [x] Prevent dragging DOING ticket when timer is active
- [x] Visual drag feedback and drop zones
- [x] Touch device support for drag and drop

## Voting System
- [x] Quadratic voting implementation
- [x] Dot vote distribution logic
- [x] Vote count display
- [ ] Real-time vote updates
- [x] Sort tickets by votes

## Timer System
- [x] Discussion timer (default 9 minutes)
- [ ] Timer configuration setting
- [x] Timer display with countdown
- [x] Timer completion handling
- [x] Thumbs up/down voting after timer
- [x] Majority calculation
- [x] Auto-move tickets based on vote outcome

## Real-time Features
- [ ] tRPC subscriptions setup
- [ ] Real-time ticket updates
- [ ] Real-time user presence
- [ ] Real-time voting updates
- [ ] Real-time state changes
- [ ] Real-time timer sync
- [ ] Optimistic UI updates

## Session Management
- [ ] Auto-cleanup job (48h after last interaction)
- [x] Update lastInteractionAt on actions
- [ ] Session expiry warnings
- [ ] Markdown export functionality
- [ ] Export all tickets with state and time spent
- [ ] End/Pause session button

## UI Components
- [x] Session lobby component
- [x] Ticket card component
- [x] Personal space component
- [x] TO DO space component
- [x] DOING space component
- [x] ARCHIVE space component
- [x] User list component
- [x] Timer component
- [x] Voting interface component
- [x] Thumbs up/down component
- [ ] State indicator component

### Layout Redesign
- [ ] Redesign session room layout with DOING at top (centered)
- [ ] Position TODO space below DOING
- [ ] Position PERSONAL (My Tickets) below TODO
- [ ] Position ARCHIVE at the bottom
- [ ] Ensure responsive layout on mobile devices

## Material Design 3
- [x] Configure Material Design 3 color system
- [ ] Implement elevation system
- [x] Use Material Design 3 components
- [x] Responsive layout patterns
- [ ] Proper touch targets
- [ ] Accessibility compliance

## Docker & Deployment
- [ ] Create Dockerfile for Next.js app
- [x] Create docker-compose.yml
- [x] Configure PostgreSQL container
- [ ] Configure Redis container
- [x] Set up volume persistence
- [x] Configure networking
- [ ] Set up Coolify deployment
- [x] Environment variable management
- [x] Health checks

## Testing
- [ ] Unit tests for voting logic
- [ ] Unit tests for timer logic
- [ ] Unit tests for state transitions
- [ ] Integration tests for tRPC procedures
- [ ] E2E tests for session flow
- [ ] Real-time subscription tests

## Performance & Optimization
- [ ] Database query optimization
- [ ] Redis caching strategy
- [ ] Connection pooling
- [ ] Lazy loading components
- [ ] Image optimization
- [ ] Bundle size optimization

## Error Handling
- [ ] Connection error handling
- [ ] Session not found handling
- [ ] Duplicate name handling
- [ ] Network error recovery
- [ ] Graceful degradation

## Documentation
- [x] README with setup instructions
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [x] Architecture documentation

## Nice to Have / Future Enhancements
- [ ] Session history
- [ ] User avatars
- [ ] Custom timer durations per session
- [ ] Session templates
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Multiple language support
- [ ] Session password protection
