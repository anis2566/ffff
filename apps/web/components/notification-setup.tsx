"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePushNotifications } from "@/hooks/use-push-notification";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Bell, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

interface NotificationSetupProps {
  userId: string;
  onComplete: () => void;
  allowSkip?: boolean; // For testing or optional scenarios
}

export function NotificationSetup({
  userId,
  onComplete,
  allowSkip = false,
}: NotificationSetupProps) {
  const router = useRouter();
  const { permission, isSupported, enableNotifications } =
    usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await enableNotifications();

      if (token) {
        // Mark user as having notifications enabled
        await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationsEnabled: true }),
        });

        onComplete();
      } else {
        setError("Failed to enable notifications. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (allowSkip) {
      onComplete();
    }
  };

  if (!isSupported) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. You may miss
            important updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSkip} variant="outline" className="w-full">
            Continue Without Notifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (permission === "denied") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Notifications Blocked
          </CardTitle>
          <CardDescription>
            You've blocked notifications for this site. To receive important
            updates:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How to Enable in Browser Settings:</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Notifications" in the permissions list</li>
                <li>Change it from "Block" to "Allow"</li>
                <li>Refresh this page and try again</li>
              </ol>
            </AlertDescription>
          </Alert>
          {allowSkip && (
            <Button onClick={handleSkip} variant="outline" className="w-full">
              Continue Anyway (Not Recommended)
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          Enable Notifications
        </CardTitle>
        <CardDescription>
          Stay informed about important updates from your coaching classes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            You'll receive notifications for:
          </h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-blue-900">
                  Class Schedule Changes
                </p>
                <p className="text-xs text-blue-700">
                  Get notified when classes are rescheduled or cancelled
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-green-900">
                  New Assignments
                </p>
                <p className="text-xs text-green-700">
                  Never miss a new assignment or homework
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-purple-900">
                  Important Announcements
                </p>
                <p className="text-xs text-purple-700">
                  Stay updated with announcements from teachers and admin
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
              <CheckCircle2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-orange-900">
                  Deadline Reminders
                </p>
                <p className="text-xs text-orange-700">
                  Get reminded before assignment deadlines
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleEnable}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enabling Notifications...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-5 w-5" />
                Enable Notifications
              </>
            )}
          </Button>

          {allowSkip && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full"
              disabled={loading}
            >
              Skip for Now
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can change notification settings later in your profile
        </p>
      </CardContent>
    </Card>
  );
}
