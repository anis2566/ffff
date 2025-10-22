import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

// Initialize the Stream client (server-side)
// Ensure these environment variables are set in your .env.local
const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!,
  process.env.GETSTREAM_API_SECRET!
);

export async function POST(req: NextRequest) {
  // 1. Get the raw body and signature
  const rawBody = await req.text(); // Get the raw body as a string
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-signature header" },
      { status: 400 }
    );
  }

  try {
    // 2. Verify the signature
    // This uses your App Secret (STREAM_SECRET) to validate the payload
    const isValid = streamClient.verifyWebhook(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // 3. Process the event
    // Once verified, parse the string body into a JSON object
    const event = JSON.parse(rawBody);

    // Example: Handle a new message event
    if (event.type === "message.new") {
      console.log(`New message from ${event.user.id}: ${event.message.text}`);
      // Add your custom logic here (e.g., save to another DB, send a notification)
    }

    // Handle other event types with a switch or if/else
    // switch (event.type) {
    //   case 'user.created':
    //     // ...
    //     break;
    //   case 'channel.deleted':
    //     // ...
    //     break;
    //   default:
    //     // ...
    // }

    // 4. Respond with 200 OK
    // This acknowledges to Stream that you've received the event.
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
