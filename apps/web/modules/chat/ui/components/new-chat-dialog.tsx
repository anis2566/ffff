"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, SearchIcon, X } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import type { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";

import { Avatar, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useAuth } from "@/lib/use-auth";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext();
  const { session } = useAuth();

  if (!session || !session?.user?.id) redirect("/");

  const [searchInput, setSearchInput] = useState<string>("");
  const searchInputDebounced = useDebounce(searchInput);

  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
  // Exclude the logged-in user manually

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () =>
      client.queryUsers(
        {
          role: { $eq: "user" },
          ...(searchInputDebounced
            ? {
                $or: [
                  { name: { $autocomplete: searchInputDebounced } },
                  { username: { $autocomplete: searchInputDebounced } },
                ],
              }
            : {}),
        },
        { name: 1, username: 1 },
        { limit: 15 }
      ),
  });

  const filtered = data?.users.filter((u) => u.id !== session?.user?.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || selectedUsers.length === 0) {
        throw new Error("Invalid user or no users selected");
      }

      const memberIds = [session?.user.id, ...selectedUsers.map((u) => u.id)];

      // For 1-1 chats, create without custom name
      // For group chats, set a name
      const channelData =
        selectedUsers.length > 1
          ? {
              members: memberIds,
              name: [session?.user.name, ...selectedUsers.map((u) => u.name)]
                .filter(Boolean)
                .join(", "),
            }
          : {
              members: memberIds,
            };

      const channel = client.channel("messaging", channelData);
      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },
    onError(error) {
      console.error("Error starting chat:", error);
    },
  });

  const handleUserToggle = (user: UserResponse) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              placeholder="Search users..."
              className="h-12 w-full pe-4 ps-14 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <SelectedUserTag
                  key={user.id}
                  user={user}
                  onRemove={() => handleRemoveUser(user.id)}
                />
              ))}
            </div>
          )}
          <hr />
          <div className="h-96 overflow-y-auto">
            {isSuccess && filtered && filtered.length > 0 ? (
              filtered.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selectedUsers.some((u) => u.id === user.id)}
                  onClick={() => handleUserToggle(user)}
                />
              ))
            ) : isSuccess ? (
              <p className="my-3 text-center text-muted-foreground">
                No users found. Try a different name.
              </p>
            ) : null}
            {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button
            disabled={selectedUsers.length === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Starting...
              </>
            ) : (
              "Start chat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

function UserResult({ user, selected, onClick }: UserResultProps) {
  return (
    <button
      className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={user.image} className="h-8 w-8" alt={user.name} />
        </Avatar>
        <div className="flex flex-col text-start">
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      {selected && <Check className="size-5 text-green-500" />}
    </button>
  );
}

interface SelectedUserTagProps {
  user: UserResponse;
  onRemove: () => void;
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
  return (
    <button
      onClick={onRemove}
      type="button"
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
      aria-label={`Remove ${user.name}`}
    >
      <Avatar>
        <AvatarImage src={user.image} className="h-8 w-8" alt={user.name} />
      </Avatar>
      <p className="font-bold">{user.name}</p>
      <X className="mx-2 size-5 text-muted-foreground" />
    </button>
  );
}
