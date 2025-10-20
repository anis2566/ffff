import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { ChatView } from "@/modules/chat/ui/views/chat-view";
import { Suspense } from "react";
import Loader from "@/components/loader";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat page",
};

const Chat = async () => {
  return (
    <ContentLayout>
      <Suspense fallback={<Loader />}>
        <ChatView />
      </Suspense>
    </ContentLayout>
  );
};

export default Chat;
