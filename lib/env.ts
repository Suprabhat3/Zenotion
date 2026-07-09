import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
});

export const env = serverEnvSchema.parse(process.env);

export const isProduction = env.NODE_ENV === "production";

// Example usage:
// import { env } from '@/lib/env';
// const dbUrl = env.DATABASE_URL;

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>