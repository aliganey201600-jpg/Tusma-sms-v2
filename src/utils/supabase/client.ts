import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Supabase environment variables are missing!");
    throw new Error("Supabase configuration error");
  }

  if (client) return client;

  client = createBrowserClient(url, anonKey);
  return client;
};
