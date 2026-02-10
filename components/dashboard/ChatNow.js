import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
} from '../../utils/notifications';
import styles from '../../styles/ChatNow.module.css';

const CHAT_NOTIFICATIONS_KEY = 'chatNotificationsEnabled';
const POLL_INTERVAL_MS = 12000;

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getNotificationsEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CHAT_NOTIFICATIONS_KEY) === 'true';
  } catch {
    return false;
  }
}

function setNotificationsEnabled(value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_NOTIFICATIONS_KEY, value ? 'true' : 'false');
  } catch {}
}

export default function ChatNow({ user, onUnreadChange }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifPermission, setNotifPermission] = useState('unsupported');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const lastMessageIdsRef = useRef(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load conversations');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setConversations(data.data.conversations || []);
        return data.data.totalUnread ?? 0;
      }
      return 0;
    } catch (e) {
      setError(e.message || 'Failed to load conversations');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (withId) => {
    if (!withId) return;
    setError('');
    try {
      const res = await fetch(`/api/chat/messages?with=${encodeURIComponent(withId)}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load messages');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data.messages || []);
        setPartner(data.data.partner || null);
        const ids = (data.data.messages || []).map((m) => m.id);
        lastMessageIdsRef.current = new Set(ids);
      }
    } catch (e) {
      setError(e.message || 'Failed to load messages');
    }
  }, []);

  const markRead = useCallback(async (userId) => {
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });
      onUnreadChange?.();
      await fetchConversations();
    } catch {}
  }, [fetchConversations, onUnreadChange]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync notification preference and permission from localStorage/browser after mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNotifEnabled(getNotificationsEnabled());
    setNotifPermission(isNotificationSupported() ? getNotificationPermission() : 'unsupported');
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    markRead(selectedId);
    fetchMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages in selected conversation; show push if new from partner
  useEffect(() => {
    if (!selectedId || !partner) return;

    const poll = async () => {
      const res = await fetch(`/api/chat/messages?with=${encodeURIComponent(selectedId)}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.data?.messages) return;

      const list = data.data.messages;
      const prevIds = lastMessageIdsRef.current;
      const newFromPartner = list.filter(
        (m) => !m.sentByMe && !prevIds.has(m.id)
      );

      if (newFromPartner.length > 0) {
        lastMessageIdsRef.current = new Set(list.map((m) => m.id));
        setMessages(list);

        const canNotify =
          notifEnabled &&
          notifPermission === 'granted' &&
          isNotificationSupported() &&
          document.visibilityState !== 'visible';

        if (canNotify && newFromPartner.length > 0) {
          const last = newFromPartner[newFromPartner.length - 1];
          const body =
            last.content.length > 80 ? last.content.slice(0, 77) + '...' : last.content;
          showNotification(`Message from ${partner.name}`, {
            body,
            tag: `chat-${selectedId}-${last.id}`,
          });
        }
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId, partner, notifEnabled, notifPermission]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ recipientId: selectedId, content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send');

      if (data.success && data.data?.message) {
        setMessages((prev) => [...prev, data.data.message]);
        setInput('');
        onUnreadChange?.();
        const conv = conversations.find((c) => c.id === selectedId);
        if (conv) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? {
                    ...c,
                    lastMessage: text,
                    lastMessageAt: data.data.message.createdAt,
                    lastSentByMe: true,
                  }
                : c
            )
          );
        }
      }
    } catch (e) {
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNotifToggle = async () => {
    if (typeof window === 'undefined' || !isNotificationSupported()) return;

    if (notifEnabled) {
      setNotifEnabled(false);
      setNotificationsEnabled(false);
      return;
    }

    try {
      const perm = await requestNotificationPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setNotifEnabled(true);
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
    } catch {
      setNotifPermission(getNotificationPermission());
      setNotifEnabled(false);
      setNotificationsEnabled(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.loading}>Loading conversations…</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </h2>
        <div className={styles.notifWrap}>
          <span className={styles.notifLabel}>Push</span>
          <button
            type="button"
            className={`${styles.toggle} ${notifEnabled ? styles.toggleOn : ''}`}
            onClick={handleNotifToggle}
            aria-label={notifEnabled ? 'Disable push notifications' : 'Enable push notifications'}
            aria-pressed={notifEnabled}
          >
            <span className={styles.thumb} />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <ul className={styles.convList}>
            {conversations.length === 0 ? (
              <li className={styles.loading}>No conversations yet.</li>
            ) : (
              conversations.map((c) => (
                <li key={c.id} className={styles.convItem}>
                  <button
                    type="button"
                    className={`${styles.convBtn} ${selectedId === c.id ? styles.convBtnActive : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <span className={styles.convName}>{c.name}</span>
                    {c.unreadCount > 0 && (
                      <span className={styles.convBadge}>
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className={styles.panel}>
          {!selectedId ? (
            <div className={styles.placeholder}>
              Select a conversation to start messaging.
            </div>
          ) : (
            <>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.messagesWrap}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.message} ${m.sentByMe ? styles.messageSent : styles.messageReceived}`}
                  >
                    <div>{m.content}</div>
                    <div className={styles.messageMeta}>
                      {m.sentByMe ? 'You' : m.senderName} · {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className={styles.form} onSubmit={handleSend}>
                <textarea
                  className={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message…"
                  rows={2}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={sending || !input.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
