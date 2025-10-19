// packages/api/src/rbac.ts

import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@workspace/db";
import type { Session } from "@workspace/auth";

type SessionWithRole = Session & {
  user: Session["user"] & {
    role: string;
    roleIds: string[];
  };
};

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  db: PrismaClient,
  userId: string,
  requiredPermission: { module: string; action: string }
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) return false;


  // Check if any of the user's roles has the required permission
  return user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.module === requiredPermission.module &&
        permission.action === requiredPermission.action
    )
  );
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  db: PrismaClient,
  userId: string,
  requiredPermissions: Array<{ module: string; action: string }>
): Promise<boolean> {
  for (const permission of requiredPermissions) {
    if (await hasPermission(db, userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  db: PrismaClient,
  userId: string,
  requiredPermissions: Array<{ module: string; action: string }>
): Promise<boolean> {
  for (const permission of requiredPermissions) {
    if (!(await hasPermission(db, userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(
  db: PrismaClient,
  userId: string
): Promise<Array<{ module: string; action: string; name: string }>> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) return [];

  // Flatten all permissions from all roles and remove duplicates
  const permissionsMap = new Map<
    string,
    { module: string; action: string; name: string }
  >();

  user.roles.forEach((role) => {
    role.permissions.forEach((permission) => {
      const key = `${permission.module}:${permission.action}`;
      if (!permissionsMap.has(key)) {
        permissionsMap.set(key, {
          module: permission.module,
          action: permission.action,
          name: permission.name,
        });
      }
    });
  });

  return Array.from(permissionsMap.values());
}

/**
 * Check if user has a specific role by name
 */
export async function hasRole(
  db: PrismaClient,
  userId: string,
  roleName: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
    },
  });

  if (!user) return false;

  return user.roles.some((role) => role.name === roleName);
}

/**
 * RBAC context extension - adds permission checking utilities to context
 */
export function createRBACContext(ctx: {
  session: Session | null;
  db: PrismaClient;
}) {
  const userId = ctx.session?.user?.id;

  return {
    ...ctx,
    rbac: {
      hasPermission: (module: string, action: string) => {
        if (!userId) return Promise.resolve(false);
        return hasPermission(ctx.db, userId, { module, action });
      },
      hasAnyPermission: (
        permissions: Array<{ module: string; action: string }>
      ) => {
        if (!userId) return Promise.resolve(false);
        return hasAnyPermission(ctx.db, userId, permissions);
      },
      hasAllPermissions: (
        permissions: Array<{ module: string; action: string }>
      ) => {
        if (!userId) return Promise.resolve(false);
        return hasAllPermissions(ctx.db, userId, permissions);
      },
      getUserPermissions: () => {
        if (!userId) return Promise.resolve([]);
        return getUserPermissions(ctx.db, userId);
      },
      hasRole: (roleName: string) => {
        if (!userId) return Promise.resolve(false);
        return hasRole(ctx.db, userId, roleName);
      },
    },
  };
}
