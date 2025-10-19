"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TodoSchema, TodoSchemaType } from "@workspace/utils/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export const TodoForm = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: createTodo, isPending } = useMutation(
    trpc.todo.createOne.mutationOptions({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        toast.success(data.message);
        form.reset({
          text: "",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.todo.getMany.queryKey(),
        });
      },
    })
  );

  const form = useForm<TodoSchemaType>({
    resolver: zodResolver(TodoSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = (data: TodoSchemaType) => {
    createTodo(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex items-center justify-between gap-x-2"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  className="bg-background dark:bg-background flex-1 w-full"
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button variant="default" size="icon" disabled={isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};
