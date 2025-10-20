import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";

import { authEnv } from "@workspace/auth/env";

export const env = createEnv({
  extends: [authEnv, vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    DATABASE_URL: z.string().url(),
    GETSTREAM_API_SECRET: z.string(),
    ENGAGESPOT_API_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_ENGAGESPOT_API_KEY: z.string(),
    NEXT_PUBLIC_GETSTREAM_API_KEY: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ENGAGESPOT_API_SECRET: process.env.ENGAGESPOT_API_SECRET,
    GETSTREAM_API_SECRET: process.env.GETSTREAM_API_SECRET,
    NEXT_PUBLIC_ENGAGESPOT_API_KEY: process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY,
    NEXT_PUBLIC_GETSTREAM_API_KEY: process.env.NEXT_PUBLIC_GETSTREAM_API_KEY,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
