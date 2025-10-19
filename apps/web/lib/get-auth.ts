"server only";

import { cache } from "react";

import { createCaller } from "@/trpc/server";

export const getAuth = cache(async () => {
  const caller = await createCaller();
  const session = await caller.auth.getSession();
  const isAuthenticated = !!session;
  const roles = session?.roles ?? [];

  return { session, isAuthenticated, roles };
});
