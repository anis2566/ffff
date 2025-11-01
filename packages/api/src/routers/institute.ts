import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { InstituteSchema } from "@workspace/utils/schemas";
import { currentSession } from "@workspace/utils/constant";
import { getInstituteTypeByClassName } from "@workspace/utils";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.InstituteWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build search filter with proper typing
const buildSearchFilter = (
  search?: string | null
): Prisma.InstituteWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

export const instituteRouter = {
  createOne: permissionProcedure("institute", "create")
    .input(InstituteSchema)
    .mutation(async ({ input, ctx }) => {
      const { type, name, session } = input;

      try {
        const existingInstitute = await ctx.db.institute.findFirst({
          where: {
            session,
            type,
            name,
          },
          select: { id: true },
        });

        if (existingInstitute) {
          return { success: false, message: "Institute already exists" };
        }

        await ctx.db.institute.create({
          data: {
            session,
            type,
            name,
          },
        });

        return { success: true, message: "Institute created successfully" };
      } catch (error) {
        return handleError(error, "creating institute");
      }
    }),

  updateOne: permissionProcedure("institute", "update")
    .input(
      z.object({
        ...InstituteSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, type, name, session } = input;

      try {
        await ctx.db.institute.update({
          where: { id },
          data: {
            session,
            type,
            name,
          },
        });

        return { success: true, message: "Institute updated successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Institute not found" };
        }
        return handleError(error, "updating institute");
      }
    }),

  deleteOne: permissionProcedure("institute", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.institute.delete({
          where: { id: input },
        });

        return { success: true, message: "Institute deleted successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Institute not found" };
        }
        return handleError(error, "deleting institute");
      }
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const institute = await ctx.db.institute.findUnique({
      where: { id: input },
    });

    if (!institute) {
      throw new Error("Institute not found");
    }

    return institute;
  }),

  getByClass: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { classId, search } = input;

      if (!classId) {
        return [];
      }

      const className = await ctx.db.className.findUnique({
        where: { id: classId },
      });

      if (!className) {
        return [];
      }

      const instituteType = getInstituteTypeByClassName(className.name);

      const institutes = await ctx.db.institute.findMany({
        where: {
          type: instituteType,
          ...(search && { name: { contains: search, mode: "insensitive" } }),
        },
        select: {
          id: true,
          name: true,
        },
      });

      return institutes;
    }),

  getMany: permissionProcedure("institute", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        type: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, type, search, session } = input;

      const where: Prisma.InstituteWhereInput = {
        ...buildSessionFilter(session),
        ...buildSearchFilter(search),
        ...(type && { type }),
      };

      const [institutes, totalCount] = await Promise.all([
        ctx.db.institute.findMany({
          where,
          select: {
            id: true,
            name: true,
            type: true,
            session: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
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
        ctx.db.institute.count({ where }),
      ]);

      return {
        institutes,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
