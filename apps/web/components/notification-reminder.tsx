"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notification";
import { Button } from "@workspace/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Bell, X } from "lucide-react";

export function NotificationReminder() {
  const { permission, isSupported, enableNotifications, isEnabled } =
    usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);

  useEffect(() => {
    // Check dismiss count
    const count = parseInt(
      localStorage.getItem("notification-dismiss-count") || "0"
    );
    setDismissCount(count);

    // Show banner if:
    // - Notifications are supported
    // - Not already enabled
    // - Permission not denied
    // - Not dismissed more than 3 times
    if (isSupported && !isEnabled && permission !== "denied" && count < 3) {
      setIsVisible(true);
    }
  }, [isSupported, isEnabled, permission]);

  const handleDismiss = () => {
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    localStorage.setItem("notification-dismiss-count", newCount.toString());
    setIsVisible(false);

    // Show again after 24 hours if dismissed less than 3 times
    if (newCount < 3) {
      setTimeout(
        () => {
          setIsVisible(true);
        },
        24 * 60 * 60 * 1000
      );
    }
  };

  const handleEnable = async () => {
    await enableNotifications();
    setIsVisible(false);
    localStorage.removeItem("notification-dismiss-count");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert className="fixed top-4 right-4 w-96 shadow-lg z-50 border-orange-200 bg-orange-50">
      <Bell className="h-5 w-5 text-orange-600" />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AlertTitle className="text-orange-900">
            Don't Miss Important Updates
          </AlertTitle>
          <AlertDescription className="text-orange-700 text-sm mt-1">
            Enable notifications to receive alerts about class schedules,
            assignments, and announcements.
          </AlertDescription>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleEnable}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Enable Now
            </Button>
            {dismissCount < 2 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-orange-700"
              >
                Later
              </Button>
            )}
          </div>
          {dismissCount >= 2 && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Last reminder - This is important for your classes!
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-orange-400 hover:text-orange-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
