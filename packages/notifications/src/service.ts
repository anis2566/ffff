interface SaveTokenParams {
  userId: string;
  token: string;
  deviceInfo?: {
    deviceType?: string;
    browser?: string;
    os?: string;
  };
}

export async function saveTokenToDatabase(
  params: SaveTokenParams
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to save token");
    }

    return true;
  } catch (error) {
    console.error("Error saving token:", error);
    return false;
  }
}

export async function deleteToken(token: string): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/token", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting token:", error);
    return false;
  }
}

export function getDeviceInfo() {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent;

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  // Detect OS
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "MacOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS")) os = "iOS";

  return {
    deviceType: "web",
    browser,
    os,
  };
}
