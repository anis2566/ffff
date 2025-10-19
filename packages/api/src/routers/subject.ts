import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { SubjectSchema } from "@workspace/utils/schemas";
import { getLevelByClassName } from "@workspace/utils";

export const subjectRouter = {
  createOne: permissionProcedure("subject", "create")
    .input(SubjectSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, level, group } = input;

      try {
        const existingSubject = await ctx.db.subject.findFirst({
          where: {
            name,
            level,
            ...(group && { group }),
          },
        });

        if (existingSubject) {
          return { success: false, message: "Subject already exists" };
        }

        await ctx.db.subject.create({
          data: {
            name,
            level,
            group,
          },
        });

        return { success: true, message: "Subject created" };
      } catch (error) {
        console.error("Error creating subject", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("subject", "update")
    .input(
      z.object({
        ...SubjectSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, level, group } = input;

      try {
        const existingSubject = await ctx.db.subject.findUnique({
          where: { id },
        });

        if (!existingSubject) {
          return { success: false, message: "Subject not found" };
        }

        await ctx.db.subject.update({
          where: { id },
          data: {
            name,
            level,
            group,
          },
        });

        return { success: true, message: "Subject updated" };
      } catch (error) {
        console.error("Error updating subject", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("subject", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const subjectId = input;

      try {
        const existingSubject = await ctx.db.subject.findUnique({
          where: { id: subjectId },
        });

        if (!existingSubject) {
          return { success: false, message: "Subject not found" };
        }

        await ctx.db.subject.delete({
          where: { id: subjectId },
        });

        return { success: true, message: "Subject deleted" };
      } catch (error) {
        console.error("Error deleting subject", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getByClass: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const classId = input;

      if (!classId) {
        return [];
      }

      const className = await ctx.db.className.findUnique({
        where: { id: classId },
      });

      if (!className) {
        return [];
      }

      const level = getLevelByClassName(className.name);

      const subjects = await ctx.db.subject.findMany({
        where: {
          level,
        },
      });
      return subjects;
    }),
  getByLevel: protectedProcedure
    .input(
      z.object({
        level: z.string(),
        query: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { level, query } = input;
      const subjects = await ctx.db.subject.findMany({
        where: {
          level,
          ...(query && {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }),
        },
      });
      return subjects;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const subjectId = input;

    const subjectData = await ctx.db.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subjectData) {
      throw new Error("Subject not found");
    }

    return subjectData;
  }),
  getMany: permissionProcedure("subject", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        level: z.string().nullish(),
        group: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, level, group } = input;

      const [subjects, totalCount] = await Promise.all([
        ctx.db.subject.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(level && {
              level,
            }),
            ...(group && {
              group,
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.subject.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(level && {
              level,
            }),
            ...(group && {
              group,
            }),
          },
        }),
      ]);

      return {
        subjects,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
