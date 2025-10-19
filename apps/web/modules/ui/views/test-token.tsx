"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Bell, Copy, CheckCircle, Loader2 } from "lucide-react";

export default function TokenTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );

  const requestToken = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("=".repeat(50));
      console.log("🔔 Starting token request process...");
      console.log("=".repeat(50));

      // Step 1: Check support
      if (!("Notification" in window)) {
        throw new Error("This browser doesn't support notifications");
      }
      console.log("✅ Browser supports notifications");

      // Step 2: Request permission
      console.log("📝 Requesting notification permission...");
      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log("Permission result:", perm);

      if (perm !== "granted") {
        throw new Error("Notification permission denied");
      }
      console.log("✅ Permission granted");

      // Step 3: Import Firebase dynamically
      console.log("📦 Importing Firebase...");
      const { initializeApp, getApps } = await import("firebase/app");
      const { getMessaging, getToken, isSupported } = await import(
        "firebase/messaging"
      );

      // Step 4: Check messaging support
      console.log("🔍 Checking messaging support...");
      const supported = await isSupported();
      if (!supported) {
        throw new Error("Firebase Messaging is not supported in this browser");
      }
      console.log("✅ Messaging supported");

      // Step 5: Initialize Firebase
      console.log("🔥 Initializing Firebase...");
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      console.log("Firebase config check:");
      console.log("  apiKey:", firebaseConfig.apiKey ? "✓" : "✗ MISSING");
      console.log(
        "  authDomain:",
        firebaseConfig.authDomain ? "✓" : "✗ MISSING"
      );
      console.log("  projectId:", firebaseConfig.projectId ? "✓" : "✗ MISSING");
      console.log(
        "  messagingSenderId:",
        firebaseConfig.messagingSenderId ? "✓" : "✗ MISSING"
      );
      console.log("  appId:", firebaseConfig.appId ? "✓" : "✗ MISSING");

      const app =
        getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      console.log("✅ Firebase initialized");

      // Step 6: Get messaging instance
      console.log("💬 Getting messaging instance...");
      const messaging = getMessaging(app);
      console.log("✅ Messaging instance created");

      // Step 7: Get VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      console.log(
        "🔑 VAPID key:",
        vapidKey ? `${vapidKey.substring(0, 10)}...` : "✗ MISSING"
      );

      if (!vapidKey) {
        throw new Error("VAPID key is missing from environment variables");
      }

      // Step 8: Get token
      console.log("🎫 Requesting FCM token...");
      const fcmToken = await getToken(messaging, { vapidKey });

      if (!fcmToken) {
        throw new Error("Failed to get FCM token");
      }

      console.log("=".repeat(50));
      console.log("✅✅✅ SUCCESS! ✅✅✅");
      console.log("=".repeat(50));
      console.log("Token:", fcmToken);
      console.log("=".repeat(50));

      setToken(fcmToken);

      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(fcmToken);
        console.log("📋 Token copied to clipboard!");
      } catch (e) {
        console.log("Could not copy to clipboard");
      }
    } catch (err: any) {
      console.error("=".repeat(50));
      console.error("❌ ERROR:");
      console.error(err);
      console.error("=".repeat(50));
      setError(err.message || "Failed to get token");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">FCM Token Test</h1>

      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Permission:</span>
              <span
                className={
                  permission === "granted"
                    ? "text-green-600 font-semibold"
                    : permission === "denied"
                      ? "text-red-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                }
              >
                {permission}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Token Status:</span>
              <span
                className={
                  token ? "text-green-600 font-semibold" : "text-gray-400"
                }
              >
                {token ? "✓ Generated" : "Not generated"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Request Button */}
        {!token && (
          <Card>
            <CardHeader>
              <CardTitle>Get FCM Token</CardTitle>
              <CardDescription>
                Click the button below to request notification permission and
                generate your FCM token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={requestToken}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Token...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-5 w-5" />
                    Get Token
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Token Display */}
        {token && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-800">
                <span>FCM Token Generated! 🎉</span>
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
                      Copy
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-green-700">
                Use this token to send test notifications from Firebase Console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-md border border-green-300">
                <code className="text-xs break-all text-green-900">
                  {token}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {token && (
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  1. Go to Firebase Console
                </h4>
                <p className="text-sm text-muted-foreground">
                  Visit{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    console.firebase.google.com
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  2. Navigate to Cloud Messaging
                </h4>
                <p className="text-sm text-muted-foreground">
                  Engage → Cloud Messaging → Send your first message
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  3. Send Test Message
                </h4>
                <p className="text-sm text-muted-foreground">
                  Click "Send test message", paste your token, and click Test
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
