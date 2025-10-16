<!-- 6242486f-205b-4044-8ba5-09f17284678d 6e6b5a23-c1c2-458e-9040-ec5577faf90a -->
# Build "Comms" - Industry-Standard Communication Platform

## Technical Stack

- **Real-time Messaging**: Socket.io (already installed)
- **Video/Audio Calls**: Jitsi Meet (free, self-hosted, unlimited participants)
- **Screen Sharing**: Jitsi Meet built-in feature
- **Backend**: Express + TypeScript + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS

## Architecture Overview

1. **Socket.io Server** for real-time bidirectional communication (messaging, presence, typing indicators)
2. **Jitsi Meet Integration** for video/audio calls and screen sharing
3. **REST API** for message persistence, conversation management, and file uploads
4. **WebRTC Signaling** through Socket.io for call initiation/management

## Implementation Plan

### Phase 1: Backend Infrastructure

#### 1.1 Socket.io Server Setup

- Configure Socket.io server in `backend/src/server.ts`
- Implement authentication middleware for socket connections
- Create room management (conversations/channels)
- Handle connection/disconnection events
- Implement presence tracking (online/offline/away status)

**Key Files**:

- `backend/src/config/socket.ts` - Socket.io configuration
- `backend/src/services/socketService.ts` - Socket event handlers
- `backend/src/middlewares/socketAuth.ts` - Socket authentication

#### 1.2 Database Models Enhancement

Enhance existing message models to support:

- Message threads and replies
- Reactions/emojis
- Message status (sent, delivered, read)
- File attachments with metadata
- Call history and recordings metadata
- Channel/group chat configuration

**Files to Update**:

- `backend/src/models/Message.ts` - Enhanced message schema
- `backend/src/models/Conversation.ts` - Add channel types, permissions
- New: `backend/src/models/CallHistory.ts` - Video/audio call logs
- New: `backend/src/models/Channel.ts` - Group/channel management

#### 1.3 Real-time Messaging Controllers

- Message sending/receiving via Socket.io
- Typing indicators
- Read receipts
- Message reactions
- File upload handling with progress tracking
- Message search and filtering

**New Files**:

- `backend/src/controllers/socketMessageController.ts`
- `backend/src/controllers/channelController.ts`
- `backend/src/controllers/callController.ts`

#### 1.4 API Routes

Update message routes to support:

- Channel/group creation and management
- Member permissions and roles
- Message threading
- File uploads (images, documents, videos)
- Call initiation and history
- Integration with Jitsi Meet

**Files to Update**:

- `backend/src/routes/messages.ts` - Uncomment and enhance
- New: `backend/src/routes/channels.ts`
- New: `backend/src/routes/calls.ts`

### Phase 2: Jitsi Meet Integration

#### 2.1 Jitsi Meet Setup

- Integrate Jitsi Meet iframe API
- Create meeting room generation logic
- Implement JWT authentication for Jitsi rooms
- Configure recording capabilities (optional)
- Screen sharing permissions

**Implementation**:

- Use Jitsi's free public instance (meet.jit.si) initially
- Option to self-host later for better control
- Generate unique room URLs with authentication tokens
- Track active calls in database

**New Files**:

- `backend/src/services/jitsiService.ts` - Jitsi integration
- `src/components/comms/VideoCall.tsx` - Jitsi iframe wrapper
- `src/components/comms/CallControls.tsx` - Call UI controls

#### 2.2 Call Management Features

- Instant 1-on-1 calls (audio/video)
- Group calls with unlimited participants
- Screen sharing toggle
- Call recording (optional)
- Call history and logs
- Missed call notifications

### Phase 3: Frontend - Comms Interface

#### 3.1 Main Comms Layout

Create a modern, responsive interface similar to Slack/Teams/Chime:

**Layout Structure**:

```
┌─────────────────────────────────────────┐
│ Header (User, Settings, Search)        │
├──────┬──────────────────┬───────────────┤
│ Side │  Conversation    │  Right Panel  │
│ bar  │  List/Channels   │  (Details/    │
│      │                  │   Members)    │
│ DMs  ├──────────────────┤               │
│ Chs  │                  │               │
│ Calls│  Message Area    │               │
│      │                  │               │
│      │                  │               │
│      ├──────────────────┤               │
│      │  Compose Box     │               │
└──────┴──────────────────┴───────────────┘
```

**New Components**:

- `src/pages/Comms.tsx` - Main comms page
- `src/components/comms/CommsLayout.tsx` - Layout wrapper
- `src/components/comms/Sidebar.tsx` - Navigation sidebar
- `src/components/comms/ConversationList.tsx` - List of chats/channels
- `src/components/comms/MessageArea.tsx` - Main message display
- `src/components/comms/ComposeBox.tsx` - Message input
- `src/components/comms/RightPanel.tsx` - Details/members panel

#### 3.2 Message Components

- `src/components/comms/MessageBubble.tsx` - Individual message display
- `src/components/comms/ThreadView.tsx` - Message threads
- `src/components/comms/ReactionPicker.tsx` - Emoji reactions
- `src/components/comms/FilePreview.tsx` - File attachments
- `src/components/comms/TypingIndicator.tsx` - Typing status
- `src/components/comms/MessageSearch.tsx` - Search messages

#### 3.3 Channel/Group Features

- `src/components/comms/CreateChannel.tsx` - New channel modal
- `src/components/comms/ChannelSettings.tsx` - Channel configuration
- `src/components/comms/MemberManagement.tsx` - Add/remove members
- `src/components/comms/ChannelPermissions.tsx` - Role management

#### 3.4 Call Features

- `src/components/comms/CallNotification.tsx` - Incoming call UI
- `src/components/comms/ActiveCallBar.tsx` - Active call indicator
- `src/components/comms/CallHistory.tsx` - Call logs
- `src/components/comms/StartCallButton.tsx` - Quick call actions
- `src/components/comms/ScreenShareControls.tsx` - Screen share UI

#### 3.5 Socket.io Client Integration

- `src/services/socketService.ts` - Socket.io client wrapper
- Real-time message delivery
- Presence updates
- Typing indicators
- Call signaling
- Notification delivery

### Phase 4: Advanced Features

#### 4.1 Rich Text & Media

- Rich text editor for messages (bold, italic, code blocks)
- Image/video previews inline
- File drag-and-drop upload
- GIF picker integration
- Code syntax highlighting
- Markdown support

#### 4.2 Notifications & Status

- Desktop notifications for new messages
- Sound alerts for calls/messages
- Custom status (available, busy, away, do not disturb)
- Custom status messages
- Notification preferences per channel

#### 4.3 Search & Organization

- Global search across all messages
- Filter by channel, user, date, file type
- Starred/pinned messages
- Message bookmarks
- Archive conversations

#### 4.4 Performance Optimizations

- Message pagination and lazy loading
- Virtual scrolling for large message lists
- Message caching with React Query
- Optimistic UI updates
- Image compression before upload
- WebSocket reconnection handling

### Phase 5: Quality & Polish

#### 5.1 UI/UX Enhancements

- Smooth animations and transitions
- Keyboard shortcuts (Ctrl+K for search, etc.)
- Dark mode support
- Accessibility (ARIA labels, keyboard navigation)
- Mobile-responsive design
- Loading states and skeletons

#### 5.2 Error Handling

- Connection error handling
- Failed message retry
- Offline mode with queue
- File upload error recovery
- Call connection failures

#### 5.3 Security

- End-to-end encryption for messages (future enhancement)
- File upload validation and scanning
- XSS protection in message content
- Rate limiting for API calls
- Socket.io authentication tokens

## File Structure

```
backend/src/
├── config/
│   └── socket.ts                    # Socket.io configuration
├── controllers/
│   ├── socketMessageController.ts   # Real-time messaging
│   ├── channelController.ts         # Channel management
│   └── callController.ts            # Call handling
├── models/
│   ├── Message.ts                   # Enhanced message model
│   ├── Conversation.ts              # Enhanced conversation model
│   ├── Channel.ts                   # Channel/group model
│   └── CallHistory.ts               # Call logs
├── middlewares/
│   └── socketAuth.ts                # Socket authentication
├── routes/
│   ├── messages.ts                  # Message routes (updated)
│   ├── channels.ts                  # Channel routes
│   └── calls.ts                     # Call routes
└── services/
    ├── socketService.ts             # Socket event handling
    └── jitsiService.ts              # Jitsi integration

src/
├── pages/
│   └── Comms.tsx                    # Main comms page
├── components/comms/
│   ├── CommsLayout.tsx              # Main layout
│   ├── Sidebar.tsx                  # Navigation
│   ├── ConversationList.tsx         # Chat list
│   ├── MessageArea.tsx              # Messages display
│   ├── ComposeBox.tsx               # Message input
│   ├── RightPanel.tsx               # Details panel
│   ├── MessageBubble.tsx            # Message component
│   ├── ThreadView.tsx               # Threads
│   ├── ReactionPicker.tsx           # Reactions
│   ├── VideoCall.tsx                # Jitsi wrapper
│   ├── CallControls.tsx             # Call UI
│   ├── CallNotification.tsx         # Incoming calls
│   ├── CreateChannel.tsx            # Channel creation
│   └── ...                          # More components
└── services/
    └── socketService.ts             # Socket.io client
```

## Route Updates

Update `src/AppRouter.tsx`:

- Replace `/messaging` route with `/comms`
- Add nested routes for channels, calls, settings

## Key Features Summary

✅ **Messaging**

- Real-time 1-on-1 and group messaging
- Threads and replies
- Reactions and emojis
- File sharing (images, documents, videos)
- Message editing and deletion
- Search and filtering

✅ **Channels/Groups**

- Public and private channels
- Member management
- Permissions and roles
- Channel descriptions and topics

✅ **Video/Audio Calls**

- Instant 1-on-1 calls
- Group calls (unlimited participants)
- Screen sharing
- Call recording (optional)
- Call history

✅ **Real-time Features**

- Online presence
- Typing indicators
- Read receipts
- Live updates

✅ **Professional Features**

- Rich text formatting
- Code blocks with syntax highlighting
- Desktop notifications
- Custom status
- Keyboard shortcuts

### To-dos

- [ ] Configure Socket.io server in backend with authentication middleware and room management
- [ ] Update Message, Conversation models and create Channel, CallHistory models
- [ ] Implement real-time message controllers and Socket.io event handlers
- [ ] Update message routes and create channel/call routes
- [ ] Integrate Jitsi Meet for video/audio calls and screen sharing
- [ ] Build main Comms layout with sidebar, conversation list, and message area
- [ ] Create message components (bubbles, threads, reactions, files)
- [ ] Implement channel creation, settings, and member management
- [ ] Build call notification, controls, and history UI
- [ ] Implement Socket.io client service for real-time features
- [ ] Add rich text editor, file uploads, and media previews
- [ ] Implement desktop notifications and presence status
- [ ] Add message search, filters, and organization features
- [ ] Implement pagination, lazy loading, and caching
- [ ] Add animations, keyboard shortcuts, dark mode, and accessibility
- [ ] Implement error handling, retry logic, and security measures
- [ ] Update AppRouter to replace /messaging with /comms and add nested routes
- [ ] Test all features end-to-end including real-time messaging, calls, and file sharing