import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  permissionProcedure,
  anyPermissionProcedure,
  allPermissionsProcedure,
  roleProcedure,
} from "../trpc";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";

export const rbacRouter = {
  getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
    const permissions = await ctx.rbac.rbac.getUserPermissions();
    return permissions;
  }),

  getMyRoles: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { roles: true },
    });
    return user?.roles || [];
  }),
} satisfies TRPCRouterRecord;

// Admin router for managing RBAC
export const rbacAdminRouter = createTRPCRouter({
  // Create a new role
  createRole: permissionProcedure("roles", "create")
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        permissionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.role.create({
        data: {
          name: input.name,
          description: input.description,
          permissionIds: input.permissionIds || [],
          userIds: [],
        },
      });
    }),

  // Create a new permission
  createPermission: permissionProcedure("permissions", "create")
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        module: z.string(),
        action: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.permission.create({
        data: {
          name: input.name,
          description: input.description,
          module: input.module,
          action: input.action,
          roleIds: [],
        },
      });
    }),

  // Assign role to user
  assignRole: permissionProcedure("roles", "assign")
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          roleIds: {
            push: input.roleId,
          },
        },
      });
    }),

  // Remove role from user
  removeRole: permissionProcedure("roles", "assign")
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const updatedRoleIds = user.roleIds.filter((id) => id !== input.roleId);

      return await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          roleIds: updatedRoleIds,
        },
      });
    }),

  // Assign permission to role
  assignPermission: permissionProcedure("permissions", "assign")
    .input(
      z.object({
        roleId: z.string(),
        permissionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.db.role.findUnique({
        where: { id: input.roleId },
      });

      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
      }

      return await ctx.db.role.update({
        where: { id: input.roleId },
        data: {
          permissionIds: {
            push: input.permissionId,
          },
        },
      });
    }),

  // List all roles
  listRoles: permissionProcedure("roles", "read").query(async ({ ctx }) => {
    return await ctx.db.role.findMany({
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }),

  // List all permissions
  listPermissions: permissionProcedure("permissions", "read").query(
    async ({ ctx }) => {
      return await ctx.db.permission.findMany({
        include: {
          roles: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }
  ),
});
