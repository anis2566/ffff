import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oAuthProxy } from "better-auth/plugins";

import { prisma } from "@workspace/db";

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  const machineId = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const processId = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return timestamp + machineId + processId + counter;
}

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
}): ReturnType<typeof betterAuth> {
  const config = {
    database: prismaAdapter(prisma, {
      provider: "mongodb",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,

    advanced: {
      generateId: generateObjectId,
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "User",
          input: false, // Users can't set their own role
        },
        status: {
          type: "string",
          defaultValue: "Pending",
          input: false,
        },
        phone: {
          type: "string",
          required: false,
        },
        roleIds: {
          type: "string[]",
          defaultValue: [],
          required: false,
          input: false, // Managed by the system, not user input
        },
      },
    },

    account: {
      fields: {
        accountId: "accountId",
        providerId: "providerId",
        userId: "userId",
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        idToken: "idToken",
        password: "password",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },

    session: {
      fields: {
        token: "sessionToken",
        userId: "userId",
        expiresAt: "expiresAt",
        ipAddress: "ipAddress",
        userAgent: "userAgent",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    },

    // Database hooks for assigning default role
    databaseHooks: {
      user: {
        create: {
          async after(user) {
            try {
              // Find or create default "User" role
              let defaultRole = await prisma.role.findUnique({
                where: { name: "User" },
              });

              if (!defaultRole) {
                // Create default role if it doesn't exist
                defaultRole = await prisma.role.create({
                  data: {
                    name: "User",
                    description: "Default user role with basic permissions",
                    userIds: [],
                    permissionIds: [],
                  },
                });
              }

              // Assign the role to the new user
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  roleIds: [defaultRole.id],
                },
              });
            } catch (error) {
              console.error("Error assigning default role:", error);
            }
          },
        },
      },
    },

    plugins: [
      oAuthProxy({
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
    ],

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      autoSignIn: true, // Automatically sign in after signup
    },

    trustedOrigins: [options.baseUrl, options.productionUrl],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
