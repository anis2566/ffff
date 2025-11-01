import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { SubjectSchema } from "@workspace/utils/schemas";
import { getLevelByClassName } from "@workspace/utils";
import { currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.SubjectWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.SubjectWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

export const subjectRouter = {
  createOne: permissionProcedure("subject", "create")
    .input(SubjectSchema)
    .mutation(async ({ input, ctx }) => {
      const { session, name, level, group } = input;

      try {
        const existingSubject = await ctx.db.subject.findFirst({
          where: {
            session,
            name,
            level,
            ...(group && { group }),
          },
          select: { id: true },
        });

        if (existingSubject) {
          return { success: false, message: "Subject already exists" };
        }

        await ctx.db.subject.create({
          data: {
            session,
            name,
            level,
            group,
          },
        });

        return { success: true, message: "Subject created successfully" };
      } catch (error) {
        return handleError(error, "creating subject");
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
      const { id, session, name, level, group } = input;

      try {
        await ctx.db.subject.update({
          where: { id },
          data: {
            session,
            name,
            level,
            group,
          },
        });

        return { success: true, message: "Subject updated successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Subject not found" };
        }
        return handleError(error, "updating subject");
      }
    }),

  deleteOne: permissionProcedure("subject", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.subject.delete({
          where: { id: input },
        });

        return { success: true, message: "Subject deleted successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Subject not found" };
        }
        return handleError(error, "deleting subject");
      }
    }),

  getByClass: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      if (!input) {
        return [];
      }

      const className = await ctx.db.className.findUnique({
        where: { id: input },
        select: { name: true },
      });

      if (!className) {
        return [];
      }

      const level = getLevelByClassName(className.name);

      const subjects = await ctx.db.subject.findMany({
        where: { level },
        select: {
          id: true,
          name: true,
          level: true,
          group: true,
          session: true,
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
          ...buildSearchFilter(query),
        },
        select: {
          id: true,
          name: true,
          level: true,
          group: true,
          session: true,
        },
      });

      return subjects;
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const subject = await ctx.db.subject.findUnique({
      where: { id: input },
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    return subject;
  }),

  getMany: permissionProcedure("subject", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        session: z.string().nullish(),
        search: z.string().nullish(),
        level: z.string().nullish(),
        group: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, level, group, session } = input;

      const where: Prisma.SubjectWhereInput = {
        ...buildSessionFilter(session),
        ...buildSearchFilter(search),
        ...(level && { level }),
        ...(group && { group }),
      };

      const [subjects, totalCount] = await Promise.all([
        ctx.db.subject.findMany({
          where,
          select: {
            id: true,
            name: true,
            level: true,
            group: true,
            session: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.subject.count({ where }),
      ]);

      return {
        subjects,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
