function required(name: string, value: string | undefined): string {
  if (!value || !value.trim()) throw new Error(`Missing env var: ${name}`);
  return value.trim();
}

/** School Google Workspace domain. Public — shipped to the browser. */
export function allowedDomain(): string {
  return (process.env.NEXT_PUBLIC_ALLOWED_DOMAIN ?? "ccchwc.edu.hk").trim().toLowerCase();
}

/** Google OAuth client ID. Public — it is an identifier, not a secret. */
export function googleClientId(): string {
  return required(
    "GOOGLE_CLIENT_ID",
    process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  );
}

export function sessionSecret(): string {
  return required("SESSION_SECRET", process.env.SESSION_SECRET);
}

export function supabaseUrl(): string {
  return required("SUPABASE_URL", process.env.SUPABASE_URL);
}

export function supabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type PetitionKind = "school" | "public";

/**
 * Which petition pool this Worker serves. "school" enforces the Workspace
 * domain; "public" accepts any verified Google account into a separate
 * signature pool.
 */
export function petitionKind(): PetitionKind {
  return process.env.PETITION_KIND === "public" ? "public" : "school";
}
