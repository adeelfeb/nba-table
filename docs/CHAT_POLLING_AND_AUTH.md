# Chat: Polling, Load, and Authorization

## Is the frontend constantly sending requests?

**Yes**, but only for users who have access to Chat and only when relevant:

| What | When | Who | How often (optimized) |
|------|------|-----|------------------------|
| **Unread count** (`/api/chat/unread-count`) | User is on Dashboard but **not** on Messages section | Only roles: developer, hr, hr_admin, superadmin | Every **15s** |
| **Conversations** (`/api/chat/conversations`) | User is on **Messages** section | Same roles | Every **12s** (visible) / **30s** (hidden). When a thread is open: **20s** / 30s |
| **Messages** (`/api/chat/messages?with=...`) | User is on Messages **and** a conversation is selected | Same roles | Every **10s** (visible) / **25s** (hidden) |

So:
- **base_user** (and any role without chat) never call these APIs.
- **Unread count** is **not** polled while the user is on the Messages page (ChatNow already refreshes the count via `onUnreadChange` after its conversations poll).
- When the user leaves the Messages page, conversations and messages polls stop (component unmounts).

## Memory and server load

- **Memory (browser):** Small. A few arrays (conversations, messages), refs (Sets/Maps for “last seen” state). No heavy computation. **Impact: negligible.**
- **Server/DB:** Each request does one lightweight query. Load scales with **chat users currently on dashboard / Messages**. Intervals are **visibility-aware** (slower when tab is hidden) and **no duplicate unread poll on Messages**.

## Is it optimized?

- **Role-gated:** Only chat roles trigger chat requests.
- **Visibility-aware:** Slower polling when the tab is hidden (25–30s instead of 10–12s).
- **No duplicate unread poll:** Unread count runs every 15s only when the user is on dashboard but **not** on Messages; on Messages, ChatNow’s conversations poll drives the sidebar count via `onUnreadChange`.
- **Thread open:** When a conversation is selected, the conversations list is polled less often (20s) since the open thread is updated by the messages poll.

## Authorization (only authorized roles make these requests)

1. **Frontend**
   - “Messages” in the sidebar and the Chat component are rendered only for roles that include chat (developer, hr, hr_admin, superadmin).
   - `refetchChatUnread` (unread-count poll) runs only when `canAccessChat` is true for the current user.

2. **Backend**
   - Every chat API (`/api/chat/conversations`, `/api/chat/messages`, `/api/chat/read`, `/api/chat/unread-count`) checks `canAccessChat(req.user.role)` after auth.
   - If the role is not allowed: **403** for conversations/messages/read, or **200 with unreadCount: 0** for unread-count (no DB count for non-chat users).
   - So even if the frontend were bypassed, non-chat users cannot read or write chat data.

---

## Is this the best case for your requirements?

**For “no WebSockets, DB-backed chat, push notifications, low server load”: yes, this is a strong fit.**

| Requirement | How it’s met |
|-------------|----------------|
| No WebSockets | Polling only; no persistent connection. |
| Chat in DB | All messages and reads go through REST APIs and MongoDB. |
| Push notifications | Conversations poll detects new messages; browser `Notification` when enabled and new message from partner. |
| Less server load | Polling only for chat roles; only when on dashboard/Messages; visibility-aware (slower when tab hidden); no unread poll on Messages; longer intervals (10–30s). |
| Less memory | No socket buffers; small in-memory state (conversations list, message ids for “last seen”). |

**Rough request rate per user (Messages open, one thread selected, tab visible):**

- Before optimization: ~3 requests every 5s (conversations + messages) + unread every 12s → **~40+ req/min**.
- After: messages every 10s, conversations every 20s, no unread poll on Messages → **~10 req/min**.

**Alternatives (and why we don’t use them here):**

- **WebSockets:** You asked to avoid them to avoid loading the system; polling is the chosen trade-off.
- **Long polling (single hanging request):** One request per user that waits until new data; similar server load, more complex to implement; current short polling is simpler and already optimized.
- **Server-Sent Events (SSE):** One long-lived connection per user; you preferred no sockets, so polling is used instead.

Summary: **Only chat-allowed roles trigger requests; memory impact is small; server load is reduced by fewer and slower polls and by not polling unread count on the Messages page; and the design fits “no sockets, DB-backed chat, push, low load” well.**
