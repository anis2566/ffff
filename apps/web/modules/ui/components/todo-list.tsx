"use client";

import { useTRPC } from "@/trpc/react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { TODO_STATUS } from "@workspace/utils/constant";

export const TodoList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.todo.getMany.queryOptions());

  const { mutate: markComplete, isPending } = useMutation(
    trpc.todo.markComplete.mutationOptions({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        toast.success(data.message);
        queryClient.invalidateQueries(trpc.todo.getMany.queryOptions());
      },
    })
  );

  const { mutate: deleteTodo, isPending: isDeletePending } = useMutation(
    trpc.todo.deleteOne.mutationOptions({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        toast.success(data.message);
        queryClient.invalidateQueries(trpc.todo.getMany.queryOptions());
      },
    })
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-[20vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-4 h-4" />
      </div>
    );
  }

  return (
    <div>
      {data?.todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center justify-between gap-x-2"
        >
          <p
            className={cn(
              "",
              todo.status === TODO_STATUS.Completed && "line-through"
            )}
          >
            {todo.text}
          </p>
          <div className="flex items-center gap-x-2">
            <Button
              variant={
                todo.status === TODO_STATUS.Completed ? "default" : "secondary"
              }
              size="icon"
              disabled={isPending || isDeletePending}
              onClick={() => markComplete({ id: todo.id })}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeletePending || isPending}
              onClick={() => deleteTodo(todo.id)}
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
