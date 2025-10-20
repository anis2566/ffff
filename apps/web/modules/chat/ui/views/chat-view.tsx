"use client";

import useInitializeChatClient from "@/hooks/use-initialize-chat-client";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Channel,
  Chat,
  ChatView as ChatPageView,
  Thread,
  ThreadList,
  useCreateChatClient,
} from "stream-chat-react";
import { useSidebar } from "@workspace/ui/components/sidebar";

import "stream-chat-react/dist/css/v2/index.css";
import { cn } from "@workspace/ui/lib/utils";
import { useThemeContext } from "../../contex/theme";

export const ChatView = () => {
  const { open, setOpen } = useSidebar();
  const chatClient = useInitializeChatClient();
  const { themeClassName } = useThemeContext();

  if (!chatClient) {
    return (
      <div className="w-full min-h-[80vh] flex justify-center items-center">
        <Loader2 className="mx-auto my-3 animate-spin" />
      </div>
    );
  }

  return (
    <Chat client={chatClient} theme={cn("messaging", themeClassName)}>
      <ChatPageView>
        <ChatPageView.Selector />
        <ChatPageView.Channels>
          {/* <MessagingSidebar
            channelListOptions={channelListOptions}
            onClick={toggleMobile}
            onCreateChannel={() => setIsCreating(!isCreating)}
            onPreviewSelect={() => setIsCreating(false)}
          />
          <Channel
            SendButton={SendButton}
            ThreadHeader={MessagingThreadHeader}
            TypingIndicator={noop}
            EmojiPicker={EmojiPickerWithTheme}
            emojiSearchIndex={SearchIndex}
          >
            {isCreating && (
              <CreateChannel
                toggleMobile={toggleMobile}
                onClose={() => setIsCreating(false)}
              />
            )}
            <ChannelInner theme={themeClassName} toggleMobile={toggleMobile} />
          </Channel> */}
        </ChatPageView.Channels>
        <ChatPageView.Threads>
          <ThreadList />
          <ChatPageView.ThreadAdapter>
            <Thread virtualized />
          </ChatPageView.ThreadAdapter>
        </ChatPageView.Threads>
      </ChatPageView>
    </Chat>
  );
};
