# Chat: Polling, Load, and Authorization

## Is the frontend constantly sending requests?

**Yes**, but only for users who have access to Chat and only in these cases:

| What | When | Who | How often |
|------|------|-----|-----------|
| **Unread count** (`/api/chat/unread-count`) | User is on Dashboard (any section) | Only roles: developer, hr, hr_admin, superadmin | Every 12s |
| **Conversations** (`/api/chat/conversations`) | User is on **Messages** section | Same roles | Every 5s (tab visible) / 20s (tab hidden) |
| **Messages** (`/api/chat/messages?with=...`) | User is on Messages **and** a conversation is selected | Same roles | Every 5s (visible) / 15s (hidden) |

So:
- **base_user** (and any role without chat) never calls these APIs; the Messages nav item is not shown and the unread-count poll does not run.
- Chat requests run only when the user is logged in with a chat role; when they leave the Messages page, the conversations and messages polls stop (component unmounts).

## Memory and server load

- **Memory (browser):** Small. A few arrays (conversations, messages), refs (Sets/Maps for “last seen” state). No heavy computation; only timestamp compares and filtering. **Impact: negligible.**
- **Server/DB:** Each poll does one API call and usually one lightweight query (e.g. `countDocuments` for unread, or a find with limit for messages). Load scales with **number of users who have chat access and are currently on the dashboard / Messages**, not with all users. Polling is **throttled** (see intervals above) and **pauses or slows when the tab is hidden** to reduce load.

## Is it optimized?

- **Role-gated:** Only chat roles trigger the unread-count and Chat UI; others never hit chat endpoints.
- **Visibility-aware:** When the Messages tab is in the background, polling intervals are increased so fewer requests are made.
- **Single source of truth:** Unread count is refreshed by the dashboard poll and by Chat’s `onUnreadChange` after sending/reading, avoiding redundant calls where possible.

## Authorization (only authorized roles make these requests)

1. **Frontend**
   - “Messages” in the sidebar and the Chat component are rendered only for roles that include chat (developer, hr, hr_admin, superadmin).
   - `refetchChatUnread` (unread-count poll) runs only when `canAccessChat` is true for the current user.

2. **Backend**
   - Every chat API (`/api/chat/conversations`, `/api/chat/messages`, `/api/chat/read`, `/api/chat/unread-count`) checks `canAccessChat(req.user.role)` after auth.
   - If the role is not allowed: **403** for conversations/messages/read, or **200 with unreadCount: 0** for unread-count (no DB count for non-chat users).
   - So even if the frontend were bypassed, non-chat users cannot read or write chat data.

Summary: **Yes, the frontend polls for unread and new messages, but only for chat-allowed roles; memory impact is small; server load is limited by role, visibility, and throttled intervals; and both frontend and backend enforce that only authorized roles can use chat and trigger these requests.**
