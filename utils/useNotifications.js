/**
 * React Hook for managing browser notifications
 * Provides easy access to notification functionality in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeNotificationSystem,
  requestPermissionWithMessage,
  getNotificationPermission,
  isNotificationSupported,
  scheduleAllResolutions,
  clearAllScheduledNotifications,
  showResolutionReminder,
} from './notificationService';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [supported, setSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scheduledTimeoutsRef = useRef([]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        const result = await initializeNotificationSystem();
        setSupported(result.supported);
        setPermission(result.permission || 'default');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Request permission
  const requestPermission = useCallback(async (onSuccess, onError) => {
    try {
      const newPermission = await requestPermissionWithMessage(
        (perm) => {
          setPermission(perm);
          if (onSuccess) onSuccess(perm);
        },
        (error) => {
          if (onError) onError(error);
        }
      );
      return newPermission;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  }, []);

  // Show a test notification
  const showTestNotification = useCallback(() => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
    return showResolutionReminder({
      _id: 'test',
      title: 'Test Notification',
      description: 'This is a test notification. Your notifications are working!',
      category: 'Personal',
    });
  }, [permission]);

  // Schedule notifications for resolutions
  const scheduleResolutions = useCallback((resolutions) => {
    if (permission !== 'granted') {
      return [];
    }
    clearAllScheduledNotifications(scheduledTimeoutsRef.current);
    const timeouts = scheduleAllResolutions(resolutions);
    scheduledTimeoutsRef.current = timeouts;
    return timeouts;
  }, [permission]);

  // Clear all scheduled notifications
  const clearScheduled = useCallback(() => {
    clearAllScheduledNotifications(scheduledTimeoutsRef.current);
    scheduledTimeoutsRef.current = [];
  }, []);

  return {
    permission,
    supported,
    isInitialized,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
    requestPermission,
    showTestNotification,
    scheduleResolutions,
    clearScheduled,
  };
};
