import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HttpError } from "@/lib/http";
import type { Role } from "@/lib/types";
export function configured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
export async function createClient() {
  if (!configured())
    throw new HttpError(
      503,
      "Supabase is not configured for this deployment. Explore the isolated demo instead.",
    );
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Proxy refreshes cookies when Server Components cannot. */
          }
        },
      },
    },
  );
}
export async function actor(allowed?: Role[]) {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user)
    throw new HttpError(401, "Please sign in to continue.");
  const { data: memberships, error: membershipError } = await db
    .from("memberships")
    .select("org_id,department_id,role")
    .eq("user_id", data.user.id)
    .limit(2);
  if (membershipError)
    throw new HttpError(503, "Account membership could not be verified.");
  if (!memberships?.length)
    throw new HttpError(
      403,
      "An authorized organization membership is required.",
    );
  if (memberships.length > 1)
    throw new HttpError(
      409,
      "Multiple organization memberships require a workspace selection.",
    );
  const membership = memberships[0] as {
    org_id: string;
    department_id: string | null;
    role: Role;
  };
  if (allowed && !allowed.includes(membership.role))
    throw new HttpError(403, "You do not have permission for this action.");
  return { db, user: data.user, membership };
}
