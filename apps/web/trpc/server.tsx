import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { cache, Suspense } from "react";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ErrorBoundary } from "react-error-boundary";

import type { AppRouter } from "@workspace/api";
import { appRouter, createTRPCContext } from "@workspace/api";

import { auth } from "@/auth/server";
import { createQueryClient } from "./query-client";
import Loader from "@/components/loader";
import { ErrorView } from "@/components/error";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
    auth,
  });
});

const getQueryClient = cache(createQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
  router: appRouter,
  ctx: createContext,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loader />}>
        <ErrorBoundary fallback={<ErrorView />}>{props.children}</ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === "infinite") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

export const createCaller = cache(
  async (): Promise<ReturnType<typeof appRouter.createCaller>> => {
    const context = await createContext();
    return appRouter.createCaller(context);
  }
);
