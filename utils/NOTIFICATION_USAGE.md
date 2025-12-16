# Notification Utility Usage Guide

This project includes a comprehensive browser notification system for New Year Resolution reminders.

## Features

- ✅ Native Browser Notification API (no external dependencies)
- ✅ Service Worker for background notifications
- ✅ Permission management
- ✅ Scheduled notifications (daily, weekly, monthly)
- ✅ React hooks for easy integration
- ✅ Automatic scheduling based on resolution frequency

## Quick Start

### Basic Usage in Components

```javascript
import { useNotifications } from '../utils/useNotifications';

function MyComponent() {
  const { 
    permission, 
    supported, 
    isGranted, 
    requestPermission,
    showTestNotification 
  } = useNotifications();

  return (
    <div>
      {supported && !isGranted && (
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      )}
      {isGranted && (
        <button onClick={showTestNotification}>
          Test Notification
        </button>
      )}
    </div>
  );
}
```

### Direct API Usage

```javascript
import {
  requestNotificationPermission,
  showResolutionReminder,
  scheduleNotification,
} from '../utils/notificationService';

// Request permission
const permission = await requestNotificationPermission();

// Show a notification immediately
showResolutionReminder({
  _id: '123',
  title: 'Read 12 books',
  description: 'Don\'t forget your reading goal!',
  category: 'Education',
});

// Schedule a notification
scheduleNotification({
  _id: '123',
  title: 'Read 12 books',
  reminderFrequency: 'daily',
  notificationEnabled: true,
});
```

## Integration

The notification system is already integrated into `NewYearResolutionManager` component. It will:

1. Automatically request permission when user interacts
2. Schedule notifications based on `reminderFrequency` field
3. Show notifications at the scheduled times
4. Handle notification clicks to navigate to dashboard

## Notification Frequencies

- `daily` - Notifications every day at the same time
- `weekly` - Notifications once per week
- `monthly` - Notifications once per month
- `none` - No notifications

## Service Worker

The service worker (`public/sw.js`) handles:
- Background push notifications
- Notification clicks
- Offline notification support

It's automatically registered when notifications are enabled.

## Browser Support

- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (iOS 16.4+, macOS)
- ⚠️ Older browsers may have limited support

## Notes

- Notifications require HTTPS (except localhost)
- Users must grant permission explicitly
- Notifications are scheduled per browser session
- For persistent notifications across sessions, consider server-side push notifications
