# support.partykeys.org

PartyKeys customer Help Center with AI-powered search.

- Static HTML + a single Vercel Edge Function
- Streaming answers from Claude Haiku 4.5 (with prompt caching)
- 10 languages, 73 Q&A items
- Falls back to keyword filter when API is unreachable

## Folder layout

```
support/
├── index.html        # main page — UI, FAQ, i18n, AI search client
├── api/
│   └── ask.js        # Vercel Edge Function — proxies Claude Messages API
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

### 3. Add the API key (required)

Before clicking Deploy, in the Import page expand **Environment Variables** and add:

| Key | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (from console.anthropic.com → Settings → API Keys) | Production, Preview, Development |

If you forget and deploy first, it's fine — just add it after the fact in Settings → Environment Variables, then redeploy from the Deployments tab.

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
