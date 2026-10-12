import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  myNotifications,
  myUnreadNotificationCount,
  markMyNotificationRead,
  markAllMyNotificationsRead,
} from '../api';

const POLL_MS = 60000;

/**
 * A traveller's own notification bell — verified/rejected documents, mainly.
 *
 * Mirrors the staff client's bell, scaled down to what a traveller needs:
 * no severity filters, no pagination controls, just "what happened to my
 * stuff" in a short dropdown. Polls the unread count rather than a socket,
 * the same tradeoff the staff bell already makes.
 */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const refreshCount = useCallback(() => {
    myUnreadNotificationCount()
      .then((data) => setUnread(data.unread))
      .catch(() => {
        // A failed poll just means the badge stays stale until the next
        // tick — not worth surfacing to the traveller.
      });
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      setError(null);
      myNotifications({ perPage: 10 })
        .then(setItems)
        .catch((err) => setError(err.message));
    }
  }

  async function handleItemClick(item) {
    if (!item.readAt) {
      try {
        await markMyNotificationRead(item.id);
        setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row)));
        setUnread((count) => Math.max(0, count - 1));
      } catch {
        // Not worth blocking navigation over a failed mark-as-read.
      }
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  }

  async function handleMarkAllRead() {
    try {
      await markAllMyNotificationsRead();
      setItems((prev) => (prev ? prev.map((row) => ({ ...row, readAt: row.readAt || new Date().toISOString() })) : prev));
      setUnread(0);
    } catch {
      // Leave the badge as-is; the traveller can try again.
    }
  }

  return (
    <div className="bell" ref={containerRef}>
      <button type="button" className="bell__trigger" onClick={toggleOpen} aria-label="Notifications">
        <span aria-hidden="true">🔔</span>
        {unread > 0 && <span className="bell__badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="bell__panel">
          <div className="bell__header">
            <span>Notifications</span>
            {unread > 0 && (
              <button type="button" className="bell__mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          {!error && !items && <p className="meta">Loading…</p>}
          {!error && items && items.length === 0 && <p className="meta">Nothing yet.</p>}
          {!error && items && items.length > 0 && (
            <ul className="bell__list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`bell__item ${item.readAt ? '' : 'bell__item--unread'}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="bell__item-title">{item.title}</span>
                    {item.body && <span className="bell__item-body">{item.body}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
