// app/api/stream/webhook/route.ts
import { StreamMessageNewEvent } from "@/lib/stream-push-event-type";
import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!,
  process.env.GETSTREAM_API_SECRET!
);

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const isValid = streamClient.verifyWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: StreamMessageNewEvent = JSON.parse(rawBody);

    // Example: For message.new event
    if (event.type === "message.new") {
        const isUserOnline = event.message.user.online;
        console.log(event.members)
    }

    // You can also handle message.read etc
    // e.g., event.type === "message.read"
    // Then update your DB etc accordingly

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
