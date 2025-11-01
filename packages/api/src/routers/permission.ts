import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure } from "../trpc";

import { PermissionSchema } from "@workspace/utils/schemas";

export const permissionRouter = {
  createOne: permissionProcedure("permission", "create")
    .input(PermissionSchema)
    .mutation(async ({ ctx, input }) => {
      const { module, actions } = input;

      try {
        const constructedNames = actions.map(
          (action) => `${module.toLocaleLowerCase()}.${action}`
        );

        const existingPermission = await ctx.db.permission.findFirst({
          where: {
            name: {
              in: constructedNames,
            },
          },
        });

        if (existingPermission) {
          return {
            success: false,
            message: "Action already exists",
          };
        }

        for (const action of actions) {
          await ctx.db.permission.create({
            data: {
              name: `${module.toLocaleLowerCase()}.${action}`,
              module: module.toLocaleLowerCase(),
              action,
            },
          });
        }

        return { success: true, message: "Permission created" };
      } catch (error) {
        console.error("Error creating permission:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("permission", "update")
    .input(
      z.object({
        permissionId: z.string(),
        roles: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { permissionId, roles } = input;

      try {
        const dbRoles = await ctx.db.role.findMany({
          where: {
            name: {
              in: roles,
            },
          },
          select: {
            id: true,
          },
        });

        if (dbRoles.length !== roles.length) {
          return { success: false, message: "Role not found" };
        }

        const selectedRoleIds = dbRoles.map((role) => role.id);

        await ctx.db.permission.update({
          where: {
            id: permissionId,
          },
          data: {
            roles: {
              set: [],
            },
          },
        });

        await ctx.db.permission.update({
          where: {
            id: permissionId,
          },
          data: {
            roles: {
              connect: selectedRoleIds.map((id) => ({ id })),
            },
          },
        });

        return { success: true, message: "Permission updated" };
      } catch (error) {
        console.error("Error updating permission:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getMany: permissionProcedure("permission", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search } = input;

      const distinctModules = await ctx.db.permission.findMany({
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { module: { contains: search, mode: "insensitive" } },
              { action: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        distinct: ["module"],
        orderBy: {
          createdAt: sort === "asc" ? "asc" : "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        select: { module: true },
      });

      const moduleNames = distinctModules.map((m) => m.module);

      const allPermissions = await ctx.db.permission.findMany({
        where: {
          module: { in: moduleNames },
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { action: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          roles: true,
        },
        orderBy: {
          createdAt: sort === "asc" ? "asc" : "desc",
        },
      });

      const totalModules = await ctx.db.permission.groupBy({
        by: ["module"],
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { module: { contains: search, mode: "insensitive" } },
              { action: { contains: search, mode: "insensitive" } },
            ],
          }),
        },
        _count: true,
      });

      const totalCount = totalModules.length;

      type PermissionWithRoles = (typeof allPermissions)[number];

      const groupedByModule = allPermissions.reduce(
        (acc, permission) => {
          const {
            module,
            action,
            roles,
            id,
            name,
            description,
            roleIds,
            createdAt,
            updatedAt,
          } = permission;

          if (!acc[module]) {
            acc[module] = {
              module,
              permissions: [],
            };
          }

          acc[module]!.permissions.push({
            id,
            name,
            action,
            description,
            roles,
            roleIds,
            createdAt,
            updatedAt,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            module: string;
            permissions: Array<Omit<PermissionWithRoles, "module">>;
          }
        >
      );

      const groupedArray = Object.values(groupedByModule);

      return {
        permissions: groupedArray,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
