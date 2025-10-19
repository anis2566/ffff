import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { initAuth } from "@workspace/auth";

import { env } from "../env";

export const auth = initAuth({
  baseUrl: `http://localhost:3000`,
  productionUrl: `https://bec-xi.vercel.app`,
  secret: env.AUTH_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
