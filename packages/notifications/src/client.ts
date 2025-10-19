import { getToken, onMessage, Messaging } from "firebase/messaging";
import { getMessagingInstance } from "./firebase-config";

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log("Messaging not supported");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error("Error getting notification token:", error);
    return null;
  }
};

export const onMessageListener = async (
  callback: (payload: any) => void
): Promise<(() => void) | null> => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    return null;
  }

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

export const checkNotificationSupport = (): boolean => {
  return "Notification" in window && "serviceWorker" in navigator;
};

export const getNotificationPermissionStatus = (): NotificationPermission => {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
};
