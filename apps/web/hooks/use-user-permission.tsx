"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";
import type { UserPermission, UserRole } from "@/lib/get-permissions";

type UsePermissionsOptions = {
  initialPermissions?: UserPermission[];
  initialRoles?: UserRole[];
};

export function usePermissions(options?: UsePermissionsOptions) {
  const trpc = useTRPC();

  // Only fetch if no initial data provided
  const shouldFetch = !options?.initialPermissions;

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    ...trpc.rbac.getMyPermissions.queryOptions(),
    enabled: shouldFetch,
    initialData: options?.initialPermissions,
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    ...trpc.rbac.getMyRoles.queryOptions(),
    enabled: shouldFetch,
  });

  const isLoading = shouldFetch && (permissionsLoading || rolesLoading);

  const permissionMap = useMemo(() => {
    if (!permissions) return new Map<string, boolean>();

    const map = new Map<string, boolean>();
    permissions.forEach((permission) => {
      const key = `${permission.module}:${permission.action}`;
      map.set(key, true);
    });
    return map;
  }, [permissions]);

  const roleMap = useMemo(() => {
    if (!roles) return new Map<string, boolean>();

    const map = new Map<string, boolean>();
    roles.forEach((role) => {
      map.set(role.name, true);
    });
    return map;
  }, [roles]);

  return {
    permissions: permissions || [],
    roles: roles || [],
    isLoading,

    /**
     * Check if user has a specific permission
     */
    hasPermission: (module: string, action: string) => {
      return permissionMap.has(`${module}:${action}`);
    },

    /**
     * Check if user has at least one of the specified permissions
     */
    hasAnyPermission: (checks: Array<{ module: string; action: string }>) => {
      return checks.some(({ module, action }) =>
        permissionMap.has(`${module}:${action}`)
      );
    },

    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions: (checks: Array<{ module: string; action: string }>) => {
      return checks.every(({ module, action }) =>
        permissionMap.has(`${module}:${action}`)
      );
    },

    /**
     * Check if user has a specific role
     */
    hasRole: (roleName: string) => {
      return roleMap.has(roleName);
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (roleNames: string[]) => {
      return roleNames.some((name) => roleMap.has(name));
    },
  };
}

// Protected component wrapper
export function Protected({
  children,
  permission,
  role,
  fallback = null,
  initialPermissions,
  initialRoles,
}: {
  children: React.ReactNode;
  permission?: { module: string; action: string };
  role?: string;
  fallback?: React.ReactNode;
  initialPermissions?: UserPermission[];
  initialRoles?: UserRole[];
}) {
  const { hasPermission, hasRole, isLoading } = usePermissions({
    initialPermissions,
    initialRoles,
  });

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission.module, permission.action)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
