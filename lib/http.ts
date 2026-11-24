export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function jsonError(error: unknown): Response {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Internal error";
  return Response.json({ error: message }, { status });
}
