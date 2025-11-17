# Leancup Features Checklist

## Project Setup
- [ ] Initialize Next.js with TypeScript
- [ ] Configure Tailwind CSS with Material Design 3 theme
- [ ] Set up Inter font
- [ ] Configure Prisma with PostgreSQL
- [ ] Set up Redis connection
- [ ] Configure tRPC with subscriptions
- [ ] Set up Docker and Docker Compose
- [ ] Configure environment variables

## Database Schema
- [ ] Design Session model (id, shortId, createdAt, lastInteractionAt)
- [ ] Design User model (name, sessionId, lastSeen)
- [ ] Design Ticket model (title, description, space, votes, userId, sessionId)
- [ ] Design SessionState model (state, currentTicketId, timerEndTime)
- [ ] Create Prisma migrations
- [ ] Set up database indexes

## Authentication & User Management
- [ ] Cookie-based user name persistence
- [ ] Join session with unique name validation
- [ ] Real-time user presence list
- [ ] Handle user reconnection
- [ ] Session joining flow

## Start Page
- [ ] Create landing page layout
- [ ] Add Lean Coffee description
- [ ] Add links to Lean Coffee resources
- [ ] "New Session" button with session creation
- [ ] Generate short unique session IDs
- [ ] Join existing session input

## Session States Management
- [ ] Neutral/Start/Pause state implementation
- [ ] Voting state implementation
- [ ] Discussion state implementation
- [ ] State transition logic
- [ ] Persist state in database

## Ticket Management
- [ ] Personal space (private tickets)
- [ ] TO DO space (shared tickets)
- [ ] DOING space (active discussion)
- [ ] ARCHIVE space (completed tickets)
- [ ] Create ticket functionality
- [ ] Move tickets between spaces
- [ ] Delete tickets
- [ ] Edit ticket details

## Voting System
- [ ] Quadratic voting implementation
- [ ] Dot vote distribution logic
- [ ] Vote count display
- [ ] Real-time vote updates
- [ ] Sort tickets by votes

## Timer System
- [ ] Discussion timer (default 9 minutes)
- [ ] Timer configuration setting
- [ ] Timer display with countdown
- [ ] Timer completion handling
- [ ] Thumbs up/down voting after timer
- [ ] Majority calculation
- [ ] Auto-move tickets based on vote outcome

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
- [ ] Update lastInteractionAt on actions
- [ ] Session expiry warnings
- [ ] Markdown export functionality
- [ ] Export all tickets with state and time spent
- [ ] End/Pause session button

## UI Components
- [ ] Session lobby component
- [ ] Ticket card component
- [ ] Personal space component
- [ ] TO DO space component
- [ ] DOING space component
- [ ] ARCHIVE space component
- [ ] User list component
- [ ] Timer component
- [ ] Voting interface component
- [ ] Thumbs up/down component
- [ ] State indicator component

## Material Design 3
- [ ] Configure Material Design 3 color system
- [ ] Implement elevation system
- [ ] Use Material Design 3 components
- [ ] Responsive layout patterns
- [ ] Proper touch targets
- [ ] Accessibility compliance

## Docker & Deployment
- [ ] Create Dockerfile for Next.js app
- [ ] Create docker-compose.yml
- [ ] Configure PostgreSQL container
- [ ] Configure Redis container
- [ ] Set up volume persistence
- [ ] Configure networking
- [ ] Set up Coolify deployment
- [ ] Environment variable management
- [ ] Health checks

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
- [ ] README with setup instructions
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Architecture documentation

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
