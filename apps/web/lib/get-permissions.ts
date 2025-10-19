import "server-only";

import { headers } from "next/headers";
import { prisma } from "@workspace/db";
import { auth } from "@/auth/server";

export type UserPermission = {
  module: string;
  action: string;
  name: string;
};

export type UserRole = {
  id: string;
  name: string;
  description: string | null;
};

export async function getServerPermissions() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      permissions: [],
      roles: [],
      isAuthenticated: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) {
    return {
      permissions: [],
      roles: [],
      isAuthenticated: true,
    };
  }

  // Flatten all permissions from all roles and remove duplicates
  const permissionsMap = new Map<string, UserPermission>();

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

  const permissions = Array.from(permissionsMap.values());
  const roles = user.roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
  }));

  return {
    permissions,
    roles,
    isAuthenticated: true,
  };
}

// Helper functions for server-side permission checks
export function createPermissionChecker(permissions: UserPermission[]) {
  const permissionMap = new Map<string, boolean>();
  permissions.forEach((permission) => {
    const key = `${permission.module}:${permission.action}`;
    permissionMap.set(key, true);
  });

  return {
    hasPermission: (module: string, action: string) => {
      return permissionMap.has(`${module}:${action}`);
    },

    hasAnyPermission: (checks: Array<{ module: string; action: string }>) => {
      return checks.some(({ module, action }) =>
        permissionMap.has(`${module}:${action}`)
      );
    },

    hasAllPermissions: (checks: Array<{ module: string; action: string }>) => {
      return checks.every(({ module, action }) =>
        permissionMap.has(`${module}:${action}`)
      );
    },
  };
}

export function createRoleChecker(roles: UserRole[]) {
  const roleMap = new Map<string, boolean>();
  roles.forEach((role) => {
    roleMap.set(role.name, true);
  });

  return {
    hasRole: (roleName: string) => {
      return roleMap.has(roleName);
    },

    hasAnyRole: (roleNames: string[]) => {
      return roleNames.some((name) => roleMap.has(name));
    },
  };
}
