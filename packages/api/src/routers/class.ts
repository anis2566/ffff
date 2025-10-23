import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { ClassNameSchema } from "@workspace/utils/schemas";
import { currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal server error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.ClassNameWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build search filter with proper typing
const buildSearchFilter = (
  search?: string | null
): Prisma.ClassNameWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

export const classRouter = {
  createOne: permissionProcedure("class", "create")
    .input(ClassNameSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, level, position, session } = input;
      const positionInt = parseInt(position);

      try {
        // Check for duplicate name or position in a single query
        const existingClass = await ctx.db.className.findFirst({
          where: {
            session,
            OR: [{ name }, { position: positionInt }],
          },
          select: { id: true, name: true, position: true },
        });

        if (existingClass) {
          const conflictType =
            existingClass.name === name ? "name" : "position";
          return {
            success: false,
            message: `Class ${conflictType} already exists`,
          };
        }

        const newClass = await ctx.db.className.create({
          data: {
            name,
            level,
            position: positionInt,
            session,
          },
        });

        return {
          success: true,
          message: "Class created successfully",
          data: newClass,
        };
      } catch (error) {
        return handleError(error, "creating class");
      }
    }),

  updateOne: permissionProcedure("class", "update")
    .input(
      z.object({
        ...ClassNameSchema.shape,
        classId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { classId, name, level, position, session } = input;
      const positionInt = parseInt(position);

      try {
        // Fetch existing class and check for position conflict in parallel
        const [existingClass, positionConflict] = await Promise.all([
          ctx.db.className.findUnique({
            where: { id: classId },
            select: { id: true, position: true },
          }),
          ctx.db.className.findFirst({
            where: {
              session,
              position: positionInt,
              id: { not: classId },
            },
            select: { id: true },
          }),
        ]);

        if (!existingClass) {
          return { success: false, message: "Class not found" };
        }

        if (positionConflict) {
          return {
            success: false,
            message: "Position already exists",
          };
        }

        await ctx.db.className.update({
          where: { id: classId },
          data: {
            session,
            name,
            level,
            position: positionInt,
          },
        });

        return { success: true, message: "Class updated successfully" };
      } catch (error) {
        return handleError(error, "updating class");
      }
    }),

  forSelect: protectedProcedure
    .input(
      z.object({
        search: z.string().nullish(),
        session: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, session } = input;

      const classes = await ctx.db.className.findMany({
        where: {
          ...buildSessionFilter(session),
          ...buildSearchFilter(search),
        },
        select: {
          id: true,
          name: true,
          level: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      });

      return classes;
    }),

  deleteOne: permissionProcedure("class", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        // Use delete directly - Prisma will throw if not found
        await ctx.db.className.delete({
          where: { id },
        });

        return { success: true, message: "Class deleted successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Class not found" };
        }
        return handleError(error, "deleting class");
      }
    }),

  getAll: permissionProcedure("class", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        session: z.string().nullish(),
        search: z.string().nullish(),
        level: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search, level, session } = input;

      const where: Prisma.ClassNameWhereInput = {
        ...buildSessionFilter(session),
        ...buildSearchFilter(search),
        ...(level && { level }),
      };

      const [classes, totalCount] = await Promise.all([
        ctx.db.className.findMany({
          where,
          select: {
            id: true,
            name: true,
            level: true,
            position: true,
            session: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                batches: true,
                students: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.className.count({ where }),
      ]);

      return {
        classes,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
