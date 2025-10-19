// firebase-messaging-sw.js

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
// ⚠️ REPLACE these values with YOUR actual Firebase config from .env.local
firebase.initializeApp({
  apiKey: "AIzaSyA5Syucm_F2zOaTtsbZroR0Fz9AsgAeIkM",
  authDomain: "basic-org.firebaseapp.com",
  projectId: "basic-org",
  storageBucket: "basic-org.firebasestorage.app",
  messagingSenderId: "486997349567",
  appId: "1:486997349567:web:60c3b7254bf0fc8445620a",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: payload.data,
    tag: payload.data?.tag || "notification",
    requireInteraction: false,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Notification clicked:",
    event.notification
  );

  event.notification.close();

  // Get the URL from notification data or use default
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
