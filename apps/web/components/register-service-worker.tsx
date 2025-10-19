"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "✅ Service Worker registered successfully:",
            registration
          );
          console.log("Service Worker scope:", registration.scope);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    } else {
      console.warn("⚠️  Service Workers are not supported in this browser");
    }
  }, []);

  return null; // This component doesn't render anything
}
