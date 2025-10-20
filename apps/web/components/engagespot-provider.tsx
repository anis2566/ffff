"use client";

import { EngagespotProvider as Provider } from "@engagespot/react-component";
import { EnableWebPush } from "./enable-web-push";

interface EngagespotContextType {
  children: React.ReactNode;
  userId: string;
}

export const EngagespotProvider = ({
  children,
  userId,
}: EngagespotContextType) => {
  return (
    <Provider apiKey={process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!} userId={userId} dataRegion="us">
      {children}
      <EnableWebPush />
    </Provider>
  );
};
