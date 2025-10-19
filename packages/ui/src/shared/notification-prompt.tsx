"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";

interface NotificationPromptProps {
  isSupported: boolean;
  permission: NotificationPermission;
  onRequestPermission: () => Promise<string | null>;
}

export function NotificationPrompt({
  isSupported,
  permission,
  onRequestPermission,
}: NotificationPromptProps) {
  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === "granted") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Notifications Enabled
          </CardTitle>
          <CardDescription>
            You'll receive notifications about important updates.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-red-600" />
            Notifications Blocked
          </CardTitle>
          <CardDescription>
            Please enable notifications in your browser settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enable Notifications
        </CardTitle>
        <CardDescription>
          Stay updated with important announcements and messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRequestPermission}>Enable Notifications</Button>
      </CardContent>
    </Card>
  );
}
