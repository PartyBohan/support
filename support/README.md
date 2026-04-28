# support.partykeys.org

PartyKeys customer Help Center with AI-powered search.

- Static HTML + a single Vercel Edge Function
- Streaming answers from Claude Haiku 4.5 (with prompt caching)
- 10 languages, 73 Q&A items
- Falls back to keyword filter when API is unreachable

## Folder layout

```
support/
├── index.html        # main page — UI, FAQ, i18n, AI search, contact modal
├── api/
│   ├── ask.js        # Vercel Edge Function — Claude streaming Q&A
│   └── contact.js    # Vercel Edge Function — Resend email sender
├── vercel.json       # security headers + cache hints
├── .gitignore
└── README.md         # this file
```

This whole folder IS the deploy artifact. Push to GitHub, import to Vercel, done.

## Deploy

### 1. Push to GitHub

```bash
cd ~/Downloads/support           # or wherever you placed this folder
git init
git add .
git commit -m "Initial: PartyKeys Help Center"
```

Create repo on github.com → name it `support` (or anything you like) → don't add README/license → Create.

```bash
git remote add origin https://github.com/PartyBohan/support.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

vercel.com → Add New → Project → pick the repo → Import.

| Setting | Value |
|---|---|
| Framework Preset | **Other** |
| Root Directory | leave empty |
| Build / Install / Output Command | leave empty |

### 3. Add the environment variables

Before clicking Deploy (or in Settings → Environment Variables after the fact), add:

| Key | Required | Value | Where to get it |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes (for AI search) | `sk-ant-...` | console.anthropic.com → Settings → API Keys |
| `RESEND_API_KEY` | yes (for contact form) | `re_...` | resend.com → API Keys (free tier: 100 emails/day) |
| `RESEND_FROM` | optional | e.g. `PartyKeys <support@partykeys.com>` | once you verify partykeys.com on Resend |
| `RESEND_TO` | optional | `support@partykeys.com` | inbox where contact form messages land |

**Resend setup (5 minutes):**
1. Sign up at resend.com (free).
2. For testing **right now**, leave `RESEND_FROM` unset — defaults to `onboarding@resend.dev`, which works without domain verification.
3. For production: add `partykeys.com` as a domain in Resend, copy the SPF/DKIM DNS records into your DNS provider, wait for verification (~10 min), then set `RESEND_FROM` to a `@partykeys.com` address.

Set Environments = Production + Preview + Development for both API keys. If you deployed before adding them, redeploy from the Deployments tab.

### 4. Bind support.partykeys.org

Project → Settings → Domains → Add → `support.partykeys.org`.

DNS at your registrar (or Cloudflare):

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | support | `cname.vercel-dns.com` | DNS only (Cloudflare: gray cloud, NOT orange) |

Wait 5–10 min for SSL.

### 5. Verify

```bash
curl -I https://support.partykeys.org
# expect 200 OK, server: Vercel

curl -N -X POST https://support.partykeys.org/api/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"How long does the battery last?"}'
# expect text/event-stream with content_block_delta events
```

## Updating

```bash
cd ~/Downloads/support
# edit index.html or api/ask.js
git add . && git commit -m "Update FAQ" && git push
```

Vercel auto-deploys on push.

When updating Q&A: change BOTH `index.html` (what users see) AND the `FAQ` constant in `api/ask.js` (what the AI sees). Otherwise the AI's answers will lag the page content.

## Local development

```bash
cd ~/Downloads/support
export ANTHROPIC_API_KEY=sk-ant-...
npx vercel dev
# opens at http://localhost:3000
```

## Cost

Claude Haiku 4.5 with 5-minute prompt caching:

- ~10k input tokens (cached after first request) + ~300 output tokens per answer
- ≈ **$0.001 per cached query**
- 1,000 queries/day ≈ $30/month
- 100 queries/day ≈ $3/month

To reduce further, add a Vercel KV / Cloudflare KV cache layer keyed on the question (most users ask the same things).

## Common pitfalls

| Problem | Fix |
|---|---|
| `/api/ask` returns 404 | Root Directory was set in Vercel — clear it. The `api/` folder must sit at repo root. |
| AI answers say "Server not configured" | `ANTHROPIC_API_KEY` missing in Vercel env vars, or you didn't redeploy after adding it. |
| Domain stuck on "Invalid Configuration" | Cloudflare orange cloud — switch to gray (DNS only). |
| AI answers in wrong language | The system prompt auto-detects from the user's question. If a user types in English, they get English. The page UI language toggle doesn't change the AI's reply language. |

## Keyboard shortcuts (already wired)

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Focus search |
| `Enter` | Ask AI (streams a custom answer) |
| Type in search | Live keyword filter (no API call) |
| `Esc` | Close AI answer card |
| `Shift` + click popular chip | Send chip text directly to AI |
