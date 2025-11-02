import { EngagespotClient } from "@engagespot/node";

type Notification = {
  identifier: string;
  recipients: string[];
  data: Record<string, any>;
};

// Lazy initialization (only at runtime)
function getEngagespot() {
  return EngagespotClient({
    apiKey: process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!,
    apiSecret: process.env.ENGAGESPOT_API_SECRET!,
    dataRegion: "us",
  });
}

export const triggerNotification = async ({
  identifier,
  recipients,
  data,
}: Notification): Promise<void> => {
  try {
    const engagespot = getEngagespot();

    const result = await engagespot.send({
      notification: {
        workflow: { identifier },
      },
      data,
      sendTo: {
        recipients: recipients.map((recipient) => ({
          identifier: recipient,
        })),
      },
    });

    console.log("Notification sent:", result);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
