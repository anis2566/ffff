import admin from "firebase-admin";
import { prisma } from "@workspace/db";
import serviceAccount from "../firebase-service-account.json";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  console.log("⏳ Initializing Firebase...");
  console.log("project id:", serviceAccount.project_id);
  console.log("private key id:", serviceAccount.private_key);
  console.log("client email", serviceAccount.client_email);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log("✅ Firebase initialized successfully");
}

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  url?: string;
}

// ------------------- Send Notification to a Single User -------------------
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
) {
  try {
    // Fetch active tokens for the user
    const tokens: { token: string }[] = await prisma.fcmToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    if (tokens.length === 0) {
      console.log(`No active tokens for user ${userId}`);
      return { success: false, reason: "no_tokens" };
    }

    // Prepare message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: {
        ...payload.data,
        url: payload.url || "/",
      },
      tokens: tokens.map((t) => t.token),
    };

    // Send notifications
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`✅ Sent ${response.successCount} notifications`);
    console.log(`❌ Failed ${response.failureCount} notifications`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];

      response.responses.forEach((resp, idx) => {
        const failedToken = tokens[idx]?.token;
        if (!resp.success && failedToken) {
          failedTokens.push(failedToken);
          console.error(`Failed token: ${failedToken}`, resp.error);
        }
      });

      if (failedTokens.length > 0) {
        await prisma.fcmToken.updateMany({
          where: { token: { in: failedTokens } },
          data: { isActive: false },
        });
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
}

// ------------------- Send Notification to Multiple Users -------------------
export async function sendNotificationToMultipleUsers(
  userIds: string[],
  payload: NotificationPayload
) {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendNotificationToUser(userId, payload))
  );

  return results;
}

// ------------------- Broadcast Notification to All Users -------------------
export async function broadcastNotification(payload: NotificationPayload) {
  try {
    const tokens: { token: string }[] = await prisma.fcmToken.findMany({
      where: { isActive: true },
      select: { token: true },
    });

    if (tokens.length === 0) {
      return { success: false, reason: "no_tokens" };
    }

    // Firebase allows max 500 tokens per request
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500).map((t) => t.token));
    }

    let totalSuccess = 0;
    let totalFailure = 0;

    for (const chunk of chunks) {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
        data: {
          ...payload.data,
          url: payload.url || "/",
        },
        tokens: chunk,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Handle failed tokens for this chunk
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          const failedToken = chunk[idx];
          if (!resp.success && failedToken) {
            failedTokens.push(failedToken);
            console.error(`Failed token: ${failedToken}`, resp.error);
          }
        });

        if (failedTokens.length > 0) {
          await prisma.fcmToken.updateMany({
            where: { token: { in: failedTokens } },
            data: { isActive: false },
          });
        }
      }
    }

    return {
      success: true,
      successCount: totalSuccess,
      failureCount: totalFailure,
    };
  } catch (error) {
    console.error("Error broadcasting notification:", error);
    return { success: false, error };
  }
}
