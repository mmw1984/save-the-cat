# Save the Cat — 聯署平台

Students sign in with their **@ccchwc.edu.hk** Google account (official GIS
button + One Tap) and sign the petition. The public list shows each signer's
name and sign time; only admins see emails.

## Architecture

```
Browser ──▶ Cloudflare Workers (Next.js via @opennextjs/cloudflare)
              │  GIS credential → POST /api/auth/google
              │  server verifies ID token against Google JWKS + nonce
              │  → HttpOnly HMAC session cookie
              ▼
           Supabase Postgres (service-role only — browser NEVER sees it)
```

- **Supabase is fully hidden.** We do *not* use Supabase Auth: the GIS
  credential is verified server-side and a signed session cookie is issued
  instead. The `*.supabase.co` domain never appears in client code, so it
  cannot be targeted directly. All tables have RLS enabled with no policies.
- **No client secret needed.** The Google OAuth **client ID** is public; there
  is nothing secret to leak on the frontend.
- **Domain check happens twice**: GIS prefills the hosted domain (`hd`), and
  the server rejects any verified Google email not ending `@ccchwc.edu.hk`.

## Setup

### 1. Google Cloud (OAuth client)

1. New project → **APIs & Services → OAuth consent screen** → External, fill
   in app name. Publish it (Production) once ready.
2. **Credentials → Create OAuth client ID → Web application**.
3. Authorized JavaScript origins: `https://<your-domain>` and
   `http://localhost:3000`. **No redirect URI is needed** for the GIS flow.
4. Copy the client ID into `.env.local` (`GOOGLE_CLIENT_ID` and
   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) — see `.env.example`.

### 2. Supabase (new project)

1. Create a new Supabase project.
2. **SQL Editor** → run every file in `supabase/migrations/`, oldest first
   (`202611240001_…`, `…0002_…`, `…0003_…`). Skipping `…0003_…` leaves the
   `signatures.kind` column missing and signing fails on both Workers.
3. Add your admin email:
   `insert into admins (email) values ('you@ccchwc.edu.hk');`
4. Load the student/alumni roster through the service-role API (the emails
   are personal data and are deliberately not in git):
   `POST $SUPABASE_URL/rest/v1/roster` with
   `[{"email": "s202501001@ccchwc.edu.hk", "role": "student"}, ...]`
   (roles: `student`, `alumni`). Until it is loaded every anonymous signer
   is labelled `Staff #N`.
5. Edit the petition text any time by updating the `petition_content` row.
6. Copy project URL + service-role key into `.env.local` / Worker secrets.

### 3. Cloudflare Worker

```bash
npm install
cp .env.example .env.local        # fill in values
npm run dev                       # local dev on :3000

# Deploy
npm run deploy                    # opennextjs-cloudflare build + wrangler deploy
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SESSION_SECRET # openssl rand -hex 32
wrangler secret put GOOGLE_CLIENT_ID
# Public vars also belong in wrangler.jsonc "vars" or .dev.vars:
#   NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_ALLOWED_DOMAIN
```

Point your custom domain at the Worker (Workers → Settings → Domains) and you
get Cloudflare DDoS protection in front of everything.

## Stack

Next.js 15 (App Router) · React 19 · `@opennextjs/cloudflare` → Cloudflare
Workers · `jose` (ID-token + session JWT) · `@supabase/supabase-js`
(service-role only) · plain CSS, white theme.

## Verify

```bash
npm run typecheck
npm run build
npm run preview   # wrangler dev against the OpenNext build
```
