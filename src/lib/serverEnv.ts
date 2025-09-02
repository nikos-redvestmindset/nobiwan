export interface ServerEnv {
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_PROJECT_ID?: string;
}

function readServerEnvVar(name: keyof ServerEnv | string): string {
  const value = process.env[name as string];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export const serverEnv: ServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: readServerEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
  SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
};
