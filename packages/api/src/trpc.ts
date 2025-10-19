/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import type { Auth, Session } from "@workspace/auth";
import { prisma, PrismaClient } from "@workspace/db";

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  createRBACContext,
} from "./rbac";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

type SessionWithRole = Session & {
  user: Session["user"] & {
    role: string;
  };
};

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: Auth;
}): Promise<{
  authApi: Auth["api"];
  session: Session | null;
  db: PrismaClient;
  rbac: ReturnType<typeof createRBACContext>;
}> => {
  const authApi = opts.auth.api;
  const session = await authApi.getSession({
    headers: opts.headers,
  });
  return {
    authApi,
    session,
    db: prisma,
    rbac: createRBACContext({ session, db: prisma }),
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC
  .context<{
    authApi: Auth["api"];
    session: Session | null;
    db: PrismaClient;
    rbac: ReturnType<typeof createRBACContext>;
  }>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? (error.cause as ZodError<Record<string, unknown>>).flatten()
            : null,
      },
    }),
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    const session = ctx.session as SessionWithRole | null;
    // if (session?.user.role !== "Admin") {
    //   throw new TRPCError({ code: "UNAUTHORIZED" });
    // }
    return next({
      ctx: {
        session: session as SessionWithRole,
      },
    });
  });

type AnyProcedure = ReturnType<typeof t.procedure.use>;

export const permissionProcedure = (module: string, action: string) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;

    const hasAccess = await hasPermission(ctx.db, userId, { module, action });

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing required permission: ${module}:${action}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
      },
    });
  }) as AnyProcedure;
};
/**
 * Any permission procedure
 *
 * User needs at least ONE of the specified permissions
 *
 * @example
 * export const viewDashboard = anyPermissionProcedure([
 *   { module: "dashboard", action: "view" },
 *   { module: "admin", action: "access" }
 * ]).query(async ({ ctx }) => {
 *   // User has either dashboard:view OR admin:access
 *   return { data: "dashboard data" };
 * });
 */
export const anyPermissionProcedure = (
  permissions: Array<{ module: string; action: string }>
) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;

    const hasAccess = await hasAnyPermission(ctx.db, userId, permissions);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing one of required permissions: ${permissions
          .map((p) => `${p.module}:${p.action}`)
          .join(", ")}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        rbac: createRBACContext({ session: ctx.session, db: ctx.db }),
      },
    });
  }) as AnyProcedure;
};

/**
 * All permissions procedure
 *
 * User needs ALL of the specified permissions
 *
 * @example
 * export const exportUserData = allPermissionsProcedure([
 *   { module: "users", action: "read" },
 *   { module: "export", action: "execute" }
 * ]).mutation(async ({ ctx }) => {
 *   // User has BOTH users:read AND export:execute
 *   return { exported: true };
 * });
 */
export const allPermissionsProcedure = (
  permissions: Array<{ module: string; action: string }>
) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;

    const hasAccess = await hasAllPermissions(ctx.db, userId, permissions);

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing required permissions: ${permissions
          .map((p) => `${p.module}:${p.action}`)
          .join(", ")}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        rbac: createRBACContext({ session: ctx.session, db: ctx.db }),
      },
    });
  }) as AnyProcedure;
};

/**
 * Role-based procedure
 *
 * Use this when you need to check for a specific role name
 *
 * @example
 * export const adminSettings = roleProcedure("Admin")
 *   .query(async ({ ctx }) => {
 *     // User has Admin role
 *     return { settings: [] };
 *   });
 */
export const roleProcedure = (roleName: string) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    const hasRoleAccess = user?.roles.some((role) => role.name === roleName);

    if (!hasRoleAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing required role: ${roleName}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        rbac: createRBACContext({ session: ctx.session, db: ctx.db }),
      },
    });
  }) as AnyProcedure;
};
