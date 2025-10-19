"use client";

import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onMessageListener,
  checkNotificationSupport,
  getNotificationPermissionStatus,
} from "@workspace/notifications";

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(checkNotificationSupport());
    setPermission(getNotificationPermissionStatus());
  }, []);

  const requestPermission = async () => {
    const fcmToken = await requestNotificationPermission();
    if (fcmToken) {
      setToken(fcmToken);
      setPermission("granted");

      // 🔥 LOG THE TOKEN FOR TESTING
      console.log("=================================");
      console.log("FCM Token Generated:");
      console.log(fcmToken);
      console.log("=================================");
      console.log("Copy this token to test in Firebase Console!");

      // Optional: Copy to clipboard automatically
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fcmToken);
        console.log("✅ Token copied to clipboard!");
      }

      return fcmToken;
    }
    return null;
  };

  useEffect(() => {
    if (permission !== "granted") return;

    const setupListener = async () => {
      const unsubscribe = await onMessageListener((payload) => {
        console.log("Foreground message received:", payload);

        // Show notification
        if (payload.notification) {
          new Notification(payload.notification.title || "New Notification", {
            body: payload.notification.body,
            icon: payload.notification.icon || "/icon-192x192.png",
          });
        }
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | null = null;
    setupListener().then((unsub) => {
      if (unsub) unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [permission]);

  return {
    token,
    permission,
    isSupported,
    requestPermission,
  };
};
