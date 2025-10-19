"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Bell, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function TestNotificationPage() {
  const { token, isSupported, permission, requestPermission } =
    useNotifications();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Push Notification Testing</h1>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Browser Support:</span>
              <span className={isSupported ? "text-green-600" : "text-red-600"}>
                {isSupported ? "✓ Supported" : "✗ Not Supported"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permission:</span>
              <span
                className={
                  permission === "granted"
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {permission}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Generated:</span>
              <span className={token ? "text-green-600" : "text-gray-400"}>
                {token ? "✓ Yes" : "✗ No"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Request Permission */}
        {permission !== "granted" && (
          <Card>
            <CardHeader>
              <CardTitle>Enable Notifications</CardTitle>
              <CardDescription>
                Click the button below to request notification permission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={requestPermission} className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Request Permission
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Token Display */}
        {token && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                FCM Token (For Testing)
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="ml-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Token
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Use this token to send test notifications from Firebase Console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <code className="text-xs break-all">{token}</code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {token && (
          <Card>
            <CardHeader>
              <CardTitle>How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Copy the token above</h3>
                <p className="text-sm text-muted-foreground">
                  Click the "Copy Token" button to copy your FCM token to
                  clipboard
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  2. Go to Firebase Console
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visit:{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Firebase Console
                  </a>
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  3. Navigate to Cloud Messaging
                </h3>
                <p className="text-sm text-muted-foreground">
                  Go to: Engage → Cloud Messaging → "Send your first message"
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Send Test Message</h3>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Click "Send test message"</li>
                  <li>Paste your FCM token</li>
                  <li>Click the "+" button to add it</li>
                  <li>Click "Test" button</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Keep this tab open to receive
                  foreground notifications! Close the tab to test background
                  notifications via the service worker.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
