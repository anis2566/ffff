import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/db"; // your Prisma client
import { getAuth } from "@/lib/get-auth";

export async function POST(request: NextRequest) {
  try {
    const { session } = await getAuth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, deviceInfo } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Upsert token (create or update)
    const fcmToken = await prisma.fcmToken.upsert({
      where: { token },
      update: { 
        isActive: true,
        lastUsed: new Date(),
        ...deviceInfo,
      },
      create: {
        token,
        userId: session.user.id,
        isActive: true,
        ...deviceInfo,
      },
    });

    return NextResponse.json({ success: true, id: fcmToken.id });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return NextResponse.json(
      { error: "Failed to save token" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { session } = await getAuth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Mark as inactive instead of deleting
    await prisma.fcmToken.updateMany({
      where: {
        token,
        userId: session.user.id,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FCM token:", error);
    return NextResponse.json(
      { error: "Failed to delete token" },
      { status: 500 }
    );
  }
}

// Get user's tokens
export async function GET(request: NextRequest) {
  try {
    const { session } = await getAuth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await prisma.fcmToken.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        lastUsed: "desc",
      },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
