"use client";

import { useEffect } from "react";
import { useWebPush } from "@engagespot/react-component";

export const EnableWebPush = () => {
  const { webPushState, subscribe, isSupported } = useWebPush();

  console.log(isSupported)

  useEffect(() => {
    if (!isSupported) {
      console.warn("Web push not supported in this browser.");
      return;
    }

    if (webPushState === "granted") {
      subscribe()
        .then(() => console.log("Web Push subscribed successfully"))
        .catch((err) => console.error("Failed to subscribe:", err));
    }
  }, [isSupported, webPushState, subscribe]);

  return null;
};
