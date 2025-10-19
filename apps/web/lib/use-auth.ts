"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const trpc = useTRPC();
  const { data, isLoading, isError } = useQuery(
    trpc.auth.getSession.queryOptions()
  );

  return {
    session: data,
    roles: data?.roles,
    isAuthenticated: !!data,
    isLoading,
    isError,
  };
}
