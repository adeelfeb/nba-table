/**
 * Notification Service - Higher level API for managing notifications
 * Integrates with service worker and provides React-friendly hooks
 */

import {
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission,
  showResolutionReminder,
  scheduleNotification,
  scheduleAllResolutions,
  clearAllScheduledNotifications,
  initializeNotifications,
} from './notifications';

// Service Worker registration
let serviceWorkerRegistration = null;

// Register service worker
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    serviceWorkerRegistration = registration;
    console.log('Service Worker registered:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New service worker available. Refresh to update.');
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Unregister service worker
export const unregisterServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker unregistered');
    }
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

// Initialize the complete notification system
export const initializeNotificationSystem = async () => {
  // Check support
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
      serviceWorker: null,
    };
  }

  // Register service worker
  const swRegistration = await registerServiceWorker();

  // Get current permission
  const permission = getNotificationPermission();

  return {
    supported: true,
    permission,
    serviceWorker: swRegistration,
  };
};

// Request permission with user-friendly messaging
export const requestPermissionWithMessage = async (onSuccess, onError) => {
  try {
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      // Register service worker after permission is granted
      await registerServiceWorker();
      
      if (onSuccess) {
        onSuccess(permission);
      }
    }
    
    return permission;
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

// Show notification via service worker if available, otherwise use direct API
export const showNotificationViaService = (title, options = {}) => {
  if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
    // Send message to service worker
    serviceWorkerRegistration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      options,
    });
  } else {
    // Fallback to direct notification API
    const { showNotification } = require('./notifications');
    return showNotification(title, options);
  }
};

// Get service worker registration
export const getServiceWorkerRegistration = () => {
  return serviceWorkerRegistration;
};

// Check if service worker is ready
export const isServiceWorkerReady = () => {
  return serviceWorkerRegistration && serviceWorkerRegistration.active !== null;
};

// Export all notification utilities
export * from './notifications';
