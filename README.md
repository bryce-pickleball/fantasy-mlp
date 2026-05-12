# Fantasy MLP

A free salary-cap fantasy game for **Major League Pickleball**, built for friend
groups to run private leagues. Not DFS — friends and trash talk only.

## Play the demo

→ See the deployed URL in the GitHub repo description (once Vercel deploy
completes).

## What's in it

- **Lineup builder** — pick 3 men + 3 women under a $50k cap, with a live cap
  meter and instant validation.
- **The Magnificent Six scoring engine** — stateless, callable via
  `POST /api/score`. See [scoring rules](#scoring-magnificent-six) below.
- **Private leagues** with **invite links** (no email harvesting — paste in
  iMessage/Slack), a **league-scoped leaderboard**, and a **trash-talk chat**
  (polling for now, SSE in v0.5).
- **Demo user-switcher** (top-right) so one person can simulate multiple
  friends in a single browser. Real auth (Google/Apple) lands in v0.2.

## Run locally

```bash
npm install
npm run db:migrate   # creates a local SQLite-or-Postgres schema
npm run db:seed
npm run dev
```

Open <http://localhost:3000>.

> **Local Postgres in one command** (Docker):
> ```
> docker run -d --name fmlp-pg -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16
> echo 'DATABASE_URL="postgresql://postgres:dev@localhost:5432/postgres"' > .env
> ```
> Or skip the DB entirely with `USE_MOCK_DATA=1 npm run dev` — the lineup builder
> and scoring work, but `/leagues` requires the DB.

## Deploy to Vercel

1. **Push to GitHub** — see the `gh` commands in `.deploy/deploy.md`.
2. **Import the repo on Vercel** — <https://vercel.com/new>.
3. **Add Vercel Postgres** — in your project's *Storage* tab, click *Create →
   Postgres*. Vercel auto-injects `DATABASE_URL` into both production and
   preview environments.
4. **Redeploy** — Vercel triggers a new build automatically after the
   integration is added. The build script (`prisma db push && tsx
   prisma/seed.ts && next build`) creates the schema and seeds the demo league
   on first deploy.

That's it.

## Repo at a glance

| Path | What |
|---|---|
| `app/lineup/[eventId]/page.tsx` | The flagship feature. Server-renders the page, hands off to `LineupBuilder.tsx`. |
| `components/LineupBuilder.tsx` | Client component — holds picked-player state, salary meter, validates locally. |
| `lib/data/adapter.ts` | The `DataAdapter` interface and the wired-up adapter (`dbAdapter` by default, `mockAdapter` with `USE_MOCK_DATA=1`). |
| `lib/data/db.ts` | Prisma-backed adapter. |
| `lib/scoring.ts` | Canonical scoring rules. Pair with this README's table — they must agree. |
| `prisma/schema.prisma` | Postgres schema. SQLite is no longer the source of truth; flip the provider locally if you prefer. |
| `app/api/lineup/route.ts` | Server-side lineup validation. |
| `app/api/score/route.ts` | Stateless scoring API. |
| `app/leagues/*` | League list, create, detail (leaderboard + chat + invite). |
| `app/join/[token]/page.tsx` | Invite-acceptance flow. |

## Architectural conventions

- **All data goes through `DataAdapter`.** Don't `fetch()` external APIs from
  pages or components — add a method to the interface, implement it.
- **Server components by default.** Add `"use client"` only where state lives
  (`LineupBuilder`, `LeagueChat`, `UserSwitcher`, `InviteButton`).
- **Tabular numerics use JetBrains Mono.** Anything that's a salary, score,
  rank, or countdown should be monospaced (`.num` utility in `globals.css`).

## Scoring (Magnificent Six)

| Event | Points |
|---|---|
| Rally point | +0.5 |
| Winner | +1.0 |
| Ace | +1.5 |
| Unforced error | −0.5 |
| Game win | +5 |
| Dreambreaker win | +8 |

The canonical implementation is in `lib/scoring.ts`. If you change the rules
here, change them there — and vice versa.

## Not in scope

- **Real-money entry fees, payouts, KYC, Stripe.** This is friends-and-leagues,
  not DFS.
- **A public global leaderboard.** Leaderboards are league-scoped.

## Build roadmap

- **v0.2** NextAuth (Google + Apple) gating the lineup page.
- **v0.4** Live data via pickleball.com API + a scoring worker.
- **v0.5** SSE-driven live leaderboard, push notifications.
- **v0.6** Mobile PWA.
