"use client";

import { useAuth } from "@/lib/use-auth";
import { Engagespot } from "@engagespot/react-component";

export const Notifications = () => {
  const { session } = useAuth();

  if (!session || !session.user) return null;

  return (
    <Engagespot
      apiKey={process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!}
      userId={session.user.id}
      dataRegion="us"
    />
  );
};
