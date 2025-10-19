"use client";

import { useEffect, useState, useCallback } from "react";
import {
  requestNotificationPermission,
  onMessageListener,
  checkNotificationSupport,
  getNotificationPermissionStatus,
} from "@workspace/notifications";
import {
  saveTokenToDatabase,
  deleteToken,
  getDeviceInfo,
} from "@workspace/notifications/service";
import { useAuth } from "@/lib/use-auth";

export const usePushNotifications = () => {
  const { session } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize support and permission
  useEffect(() => {
    setIsSupported(checkNotificationSupport());
    setPermission(getNotificationPermissionStatus());
    setIsInitialized(true);
  }, []);

  // Auto-initialize if permission already granted
  useEffect(() => {
    if (!isInitialized || !session?.user?.id) return;
    if (permission !== "granted") return; // only proceed if granted
    if (token) return;

    const initToken = async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);

          const deviceInfo = getDeviceInfo();
          await saveTokenToDatabase({
            userId: session.user.id,
            token: fcmToken,
            deviceInfo: deviceInfo || undefined,
          });
        } else {
          console.warn("Notifications permission blocked or denied.");
          setPermission("denied");
        }
      } catch (err) {
        console.error("Error initializing FCM token:", err);
        setPermission("denied");
      }
    };

    initToken();
  }, [isInitialized, session, permission, token]);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    if (!session?.user?.id) return null;

    const fcmToken = await requestNotificationPermission();
    if (!fcmToken) {
      console.warn("Notifications permission blocked or denied.");
      setPermission("denied");
      return null;
    }

    setToken(fcmToken);
    setPermission("granted");

    const deviceInfo = getDeviceInfo();
    const saved = await saveTokenToDatabase({
      userId: session.user.id,
      token: fcmToken,
      deviceInfo: deviceInfo || undefined,
    });

    if (saved) console.log("✅ Token saved to database");

    return fcmToken;
  }, [session]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    if (token) {
      await deleteToken(token);
      setToken(null);
      console.log("✅ Notifications disabled");
    }
  }, [token]);

  // Listen for foreground messages
  useEffect(() => {
    if (permission !== "granted") return;

    let unsubscribe: (() => void) | null = null;

    onMessageListener((payload) => {
      console.log("📨 Foreground message received:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title || "New Notification", {
          body: payload.notification.body,
          icon: payload.notification.icon || "/icon-192x192.png",
          data: payload.data,
        });
      }
    }).then((unsub) => (unsubscribe = unsub));

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [permission]);

  // Token refresh handler
  useEffect(() => {
    if (!session?.user?.id || permission !== "granted") return;

    const refreshTokenIfNeeded = async () => {
      try {
        const { getMessagingInstance } = await import(
          "@workspace/notifications"
        );
        const { getToken } = await import("firebase/messaging");

        const messaging = await getMessagingInstance();
        if (!messaging) return;

        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });

        if (currentToken && currentToken !== token) {
          console.log("🔄 Token changed, updating database...");
          setToken(currentToken);

          const deviceInfo = getDeviceInfo();
          await saveTokenToDatabase({
            userId: session.user.id,
            token: currentToken,
            deviceInfo: deviceInfo || undefined,
          });
        }
      } catch (err) {
        console.error("Error refreshing FCM token:", err);
      }
    };

    refreshTokenIfNeeded();
    const interval = setInterval(refreshTokenIfNeeded, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token, session, permission]);

  return {
    token,
    permission,
    isSupported,
    enableNotifications,
    disableNotifications,
    isEnabled: permission === "granted" && !!token,
  };
};
