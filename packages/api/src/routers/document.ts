import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";
import { endOfDay, startOfDay } from "date-fns";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { DocumentSchema } from "@workspace/utils/schemas";

export const documentRouter = {
  createOne: permissionProcedure("document", "create")
    .input(DocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        type,
        name,
        deliveryDate,
        noOfCopy,
        classNameId,
        subjectId,
        userId,
      } = input;

      try {
        await ctx.db.document.create({
          data: {
            type,
            name,
            deliveryDate: new Date(deliveryDate),
            noOfCopy: parseInt(noOfCopy),
            classNameId,
            subjectId,
            userId,
            hasReceived: false,
          },
        });

        return { success: true, message: "Document created" };
      } catch (error) {
        console.error("Error creating document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("document", "update")
    .input(
      z.object({
        ...DocumentSchema.shape,
        documentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        documentId,
        name,
        deliveryDate,
        noOfCopy,
        classNameId,
        subjectId,
        type,
        userId,
      } = input;

      try {
        const existingDocument = await ctx.db.document.findFirst({
          where: {
            id: documentId,
          },
        });

        if (!existingDocument) {
          return { success: false, message: "Document not found" };
        }

        await ctx.db.document.update({
          where: {
            id: documentId,
          },
          data: {
            name,
            deliveryDate: new Date(deliveryDate),
            noOfCopy: parseInt(noOfCopy),
            classNameId,
            subjectId,
            type,
            userId,
          },
        });

        return { success: true, message: "Document updated" };
      } catch (error) {
        console.error("Error updating document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  toggleReceived: permissionProcedure("document", "toggle_received")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const documentId = input;

      try {
        const existingDocument = await ctx.db.document.findUnique({
          where: {
            id: documentId,
          },
        });

        if (!existingDocument) {
          return { success: false, message: "Document not found" };
        }

        await ctx.db.document.update({
          where: {
            id: documentId,
          },
          data: {
            hasReceived: !existingDocument.hasReceived,
          },
        });

        return { success: true, message: "Document updated" };
      } catch (error) {
        console.error("Error updating document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  toggleFinished: permissionProcedure("document", "toggle_finished")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const documentId = input;

      try {
        const existingDocument = await ctx.db.document.findUnique({
          where: {
            id: documentId,
          },
        });

        if (!existingDocument) {
          return { success: false, message: "Document not found" };
        }

        await ctx.db.document.update({
          where: {
            id: documentId,
          },
          data: {
            hasFinished: !existingDocument.hasFinished,
          },
        });

        return { success: true, message: "Document updated" };
      } catch (error) {
        console.error("Error updating document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  pushToPrint: permissionProcedure("document", "push_print")
    .input(
      z.object({
        documentId: z.string(),
        noOfCopy: z.string(),
        path: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { documentId, noOfCopy, path } = input;

      try {
        const existingDocument = await ctx.db.document.findUnique({
          where: {
            id: documentId,
          },
        });

        if (!existingDocument) {
          return { success: false, message: "Document not found" };
        }

        const hasAlreadPushed = await ctx.db.printTask.findFirst({
          where: {
            documentId,
          },
        });

        if (hasAlreadPushed) {
          return { success: false, message: "Document already pushed" };
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.document.update({
            where: {
              id: documentId,
            },
            data: {
              hasPrinted: true,
              noOfCopy: parseInt(noOfCopy),
            },
          });
          await ctx.db.printTask.create({
            data: {
              documentId,
              path,
            },
          });
        });

        return { success: true, message: "Document updated" };
      } catch (error) {
        console.error("Error updating document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  deleteOne: permissionProcedure("document", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingDocument = await ctx.db.document.findFirst({
          where: {
            id,
          },
        });

        if (!existingDocument) {
          return { success: false, message: "Document not found" };
        }

        await ctx.db.document.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Document deleted" };
      } catch (error) {
        console.error("Error deleting document:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const documentId = input;

    const documentData = await ctx.db.document.findUnique({
      where: { id: documentId },
    });

    if (!documentData) {
      throw new Error("Document not found");
    }

    return documentData;
  }),
  getMany: permissionProcedure("document", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        classNameId: z.string().nullish(),
        subjectId: z.string().nullish(),
        date: z.string().nullish(),
        hasReceived: z.string().nullish(),
        hasFinished: z.string().nullish(),
        hasPrinted: z.string().nullish(),
        type: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        sort,
        classNameId,
        subjectId,
        date,
        type,
        hasReceived,
        hasFinished,
        hasPrinted,
      } = input;

      const booleanHasReceived =
        hasReceived === "true"
          ? true
          : hasReceived === "false"
            ? false
            : undefined;
      const booleanHasFinished =
        hasFinished === "true"
          ? true
          : hasFinished === "false"
            ? false
            : undefined;
      const booleanHasPrinted =
        hasPrinted === "true"
          ? true
          : hasPrinted === "false"
            ? false
            : undefined;

      const startOfTheDay = startOfDay(date || new Date());
      const endOfTheDay = endOfDay(date || new Date());

      // Build the where clause to be reused
      const whereClause = {
        ...(booleanHasPrinted !== undefined
          ? {
              hasPrinted: booleanHasPrinted,
            }
          : {
              hasPrinted: false,
            }),
        ...(type && {
          type,
        }),
        ...(classNameId && {
          classNameId,
        }),
        ...(subjectId && {
          subjectId,
        }),
        ...(date && {
          deliveryDate: {
            gte: startOfTheDay,
            lte: endOfTheDay,
          },
        }),
        ...(booleanHasReceived !== undefined && {
          hasReceived: booleanHasReceived,
        }),
        ...(booleanHasFinished !== undefined && {
          hasFinished: booleanHasFinished,
        }),
      };

      const [documents, totalCount] = await Promise.all([
        ctx.db.document.findMany({
          where: whereClause,
          include: {
            className: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: sort
            ? { createdAt: sort === "asc" ? "asc" : "desc" }
            : { deliveryDate: "asc" },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.document.count({
          where: whereClause,
        }),
      ]);

      return {
        documents,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
