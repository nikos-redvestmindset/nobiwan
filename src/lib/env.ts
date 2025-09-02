export interface PublicEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

function readEnvVar(name: keyof PublicEnv | string): string {
  const value = process.env[name as string];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env: PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: readEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
