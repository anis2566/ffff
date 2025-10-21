import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { protectedProcedure } from "../trpc";

import { TodoSchema } from "@workspace/utils/schemas";
import { TODO_STATUS } from "@workspace/utils/constant";

export const todoRouter = {
  createOne: protectedProcedure
    .input(TodoSchema)
    .mutation(async ({ input, ctx }) => {
      const { text } = input;

      try {
        await ctx.db.todo.create({
          data: {
            text,
            userId: ctx.session.user.id,
          },
        });

        return { success: true, message: "Todo created" };
      } catch (error) {
        console.error("Error creating todo", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  markComplete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      try {
        const existingTodo = await ctx.db.todo.findUnique({
          where: { id, userId: ctx.session.user.id },
        });

        if (!existingTodo) {
          return { success: false, message: "Todo not found" };
        }

        await ctx.db.todo.update({
          where: { id, userId: ctx.session.user.id },
          data: {
            status: TODO_STATUS.Completed,
          },
        });

        return { success: true, message: "Todo updated" };
      } catch (error) {
        console.error("Error updating todo", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const todoId = input;

      try {
        const existingTodo = await ctx.db.todo.findUnique({
          where: { id: todoId, userId: ctx.session.user.id },
        });

        if (!existingTodo) {
          return { success: false, message: "Todo not found" };
        }

        await ctx.db.todo.delete({
          where: { id: todoId, userId: ctx.session.user.id },
        });

        return { success: true, message: "Todo deleted" };
      } catch (error) {
        console.error("Error deleting todo", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.db.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return {
      todos,
    };
  }),
} satisfies TRPCRouterRecord;
