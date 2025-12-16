/**
 * Service Worker for Background Notifications
 * Handles push notifications and background sync for resolution reminders
 */

const CACHE_NAME = 'resolution-notifications-v1';
const NOTIFICATION_TAG = 'resolution-reminder';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim(); // Take control of all pages immediately
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'Resolution Reminder',
    body: 'Don\'t forget your goals!',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: NOTIFICATION_TAG,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || NOTIFICATION_TAG,
        data: data.data || {},
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      silent: false,
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const resolutionId = notificationData.resolutionId;

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // If resolution ID is provided, navigate to that resolution
            if (resolutionId) {
              return client.navigate(`/dashboard?resolution=${resolutionId}`).then(() => client.focus());
            }
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          const url = resolutionId 
            ? `${self.location.origin}/dashboard?resolution=${resolutionId}`
            : `${self.location.origin}/dashboard`;
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Background sync for checking scheduled notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-resolutions') {
    event.waitUntil(checkScheduledResolutions());
  }
});

// Function to check and trigger scheduled resolutions
async function checkScheduledResolutions() {
  try {
    // This would typically fetch from your API
    // For now, we'll just log - you can extend this to fetch from your backend
    console.log('Checking scheduled resolutions...');
    
    // You can fetch resolutions from your API here
    // const response = await fetch('/api/resolutions/scheduled');
    // const resolutions = await response.json();
    // Process and show notifications for due resolutions
  } catch (error) {
    console.error('Error checking scheduled resolutions:', error);
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      })
    );
  }
});
