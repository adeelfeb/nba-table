/**
 * Browser Notification Utility for New Year Resolutions
 * Uses native Browser Notification API - no external dependencies required
 */

// Check if browser supports notifications
export const isNotificationSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
};

// Get current notification permission status
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request notification permission from user
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    throw new Error('Notification permission was previously denied. Please enable it in your browser settings.');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  if (permission === 'denied') {
    throw new Error('Notification permission was denied');
  }

  return permission;
};

// Show a notification immediately (browser Notification API)
export const showNotification = (title, options = {}) => {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser');
    return null;
  }
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted. Current:', Notification.permission);
    return null;
  }

  const defaultOptions = {
    body: '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: options.tag || 'app-notification',
    requireInteraction: false,
    silent: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);

    setTimeout(() => {
      try { notification.close(); } catch (_) {}
    }, 6000);
    notification.onclick = () => {
      window.focus();
      try { notification.close(); } catch (_) {}
    };

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

// Show resolution reminder notification
export const showResolutionReminder = (resolution) => {
  const { title, description, category } = resolution;
  
  const notificationBody = description 
    ? `${description}\nCategory: ${category}`
    : `Don't forget your ${category.toLowerCase()} goal!`;

  return showNotification(`Reminder: ${title}`, {
    body: notificationBody,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: `resolution-${resolution._id || resolution.id}`,
    requireInteraction: false,
    data: {
      resolutionId: resolution._id || resolution.id,
      type: 'resolution-reminder',
    },
  });
};

// Calculate next notification time based on frequency
export const getNextNotificationTime = (frequency, lastNotificationTime = null) => {
  const now = new Date();
  const nextTime = new Date();

  switch (frequency) {
    case 'daily':
      // Set for same time tomorrow
      nextTime.setDate(now.getDate() + 1);
      break;
    
    case 'weekly':
      // Set for same time next week
      nextTime.setDate(now.getDate() + 7);
      break;
    
    case 'monthly':
      // Set for same time next month
      nextTime.setMonth(now.getMonth() + 1);
      break;
    
    case 'none':
      return null;
    
    default:
      return null;
  }

  return nextTime;
};

// Schedule a notification using setTimeout (for same-session reminders)
// Note: For persistent reminders across sessions, you'd need a service worker
export const scheduleNotification = (resolution, callback = null) => {
  if (!resolution.notificationEnabled || resolution.reminderFrequency === 'none') {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Cannot schedule notification: permission not granted');
    return null;
  }

  const nextTime = getNextNotificationTime(resolution.reminderFrequency);
  if (!nextTime) {
    return null;
  }

  const now = new Date();
  const delay = nextTime.getTime() - now.getTime();

  if (delay <= 0) {
    // If time has passed, schedule for next interval
    const adjustedTime = getNextNotificationTime(resolution.reminderFrequency, now);
    const adjustedDelay = adjustedTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      showResolutionReminder(resolution);
      if (callback) callback(resolution);
      // Reschedule for next interval
      scheduleNotification(resolution, callback);
    }, adjustedDelay);

    return timeoutId;
  }

  const timeoutId = setTimeout(() => {
    showResolutionReminder(resolution);
    if (callback) callback(resolution);
    // Reschedule for next interval
    scheduleNotification(resolution, callback);
  }, delay);

  return timeoutId;
};

// Schedule notifications for multiple resolutions
export const scheduleAllResolutions = (resolutions, callback = null) => {
  const timeouts = [];

  resolutions.forEach((resolution) => {
    if (resolution.notificationEnabled && resolution.reminderFrequency !== 'none' && !resolution.isCompleted) {
      const timeoutId = scheduleNotification(resolution, callback);
      if (timeoutId) {
        timeouts.push({
          resolutionId: resolution._id || resolution.id,
          timeoutId,
        });
      }
    }
  });

  return timeouts;
};

// Clear a scheduled notification
export const clearScheduledNotification = (timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
};

// Clear all scheduled notifications
export const clearAllScheduledNotifications = (timeouts) => {
  if (Array.isArray(timeouts)) {
    timeouts.forEach(({ timeoutId }) => {
      clearTimeout(timeoutId);
    });
  }
};

// Store notification preferences in localStorage
export const saveNotificationPreferences = (preferences) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

// Get notification preferences from localStorage
export const getNotificationPreferences = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('notificationPreferences');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

// Initialize notification system
export const initializeNotifications = async () => {
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
    };
  }

  const permission = getNotificationPermission();
  
  return {
    supported: true,
    permission,
  };
};
