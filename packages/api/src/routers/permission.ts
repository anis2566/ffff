import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { adminProcedure } from "../trpc";

import { PermissionSchema } from "@workspace/utils/schemas";

export const permissionRouter = {
  createOne: adminProcedure
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
  updateOne: adminProcedure
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
  getMany: adminProcedure
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

      // Fetch all permissions matching the search criteria with roles
      const allPermissions = await ctx.db.permission.findMany({
        where: {
          ...(search && {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                module: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                action: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }),
        },
        include: {
          roles: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      type PermissionWithRoles = (typeof allPermissions)[number];

      // Group permissions by module
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
              name,
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
            name: string;
            module: string;
            permissions: Array<Omit<PermissionWithRoles, "module">>;
          }
        >
      );

      // Convert to array and apply pagination
      const groupedArray = Object.values(groupedByModule);
      const totalCount = groupedArray.length;

      return {
        permissions: groupedArray,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
