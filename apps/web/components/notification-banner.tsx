"use client";

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notification";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Bell, X } from "lucide-react";

export function NotificationBanner() {
  const { permission, isSupported, enableNotifications, isEnabled } =
    usePushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("notification-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  const handleEnable = async () => {
    await enableNotifications();
    setIsDismissed(true);
  };

  // Don't show if:
  // - Not supported
  // - Already enabled
  // - Permission denied
  // - User dismissed
  if (!isSupported || isEnabled || permission === "denied" || isDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50 border-blue-200 bg-blue-50">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Stay Updated
            </h3>
            <p className="text-xs text-blue-700 mb-3">
              Enable notifications to get important updates and announcements
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEnable}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enable
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-blue-700"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-400 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
