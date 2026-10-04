# Night Canteen Runner

One runner. Every hostel block. A desk for filing group delivery requests,
running the single runner's schedule, and recording who actually got fed.

## Stack

Next.js 14 (App Router) + MongoDB. No auth SDK — login is a small
username/password system with an HMAC-signed session cookie. This stack was
kept from the project's starting point; only the domain model and UI were
rewritten for PS-2.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `MONGODB_URI` — your MongoDB Atlas connection string.
   - `MONGODB_DB` — defaults to `night_canteen_runner`.
   - `SESSION_SECRET` — any random string.
3. `npm run dev`
4. Open http://localhost:3000 — the login page auto-seeds three demo
   accounts (two students, one runner), all with password `demo1234`.

## How the app is organized

```
app/
  login/              login + signup
  dashboard/          role-based desk (request form, runner controls, history)
  api/auth/           signup, login, logout, me
  api/requests/       create + list delivery requests, plus
                       [id]/accept, [id]/handover, [id]/complete
components/           RequestForm, RequestCard, RunnerStatusBanner,
                       HandoverPanel, StatsStrip, StatusPill, Toast,
                       EmptyState, ConfirmDialog
lib/                  mongodb.js (db connection), session.js (auth cookie),
                       useToasts.js (toast notifications)
models/                user.js, deliveryRequest.js (thin db helpers + shared
                       constants: hostel blocks, status enums, serializer)
```

One `deliveryRequests` collection holds everything: the hostel block, room
number, delivery time, who filed the order, every participant with their own
individual outcome, and the request's own status (`pending` → `accepted` →
`completed`, or `clash`).

## Core business rules

- **Exactly one runner.** Signing up a second `runner` account is rejected
  server-side. The dashboard's "Runner Available" / "Runner On Delivery"
  banner reflects real backend state, not a hardcoded label.
- **Only one accepted delivery at a time.** When the runner accepts a
  request, the server re-checks for any other request already in `accepted`
  status. If one exists, the new request is flipped to `clash` and the
  accept call fails with a clear reason — this check happens in the API
  route itself (`app/api/requests/[id]/accept/route.js`), so it holds even if
  requests are fired directly at the API, not just when buttons are disabled
  in the UI.
- **Individual handover outcomes.** Each participant on a request is stored
  as its own `{ name, status }` entry (`pending` / `received` / `sleeping`).
  There is no single "delivery completed" flag for the whole group — every
  name gets its own outcome, settable independently and changeable until the
  trip is completed.
- **Completion requires every outcome to be decided.** `complete` is
  rejected (409, with the names still pending) if any participant is still
  `pending`. This is enforced in the API route, not just by disabling the
  button in the UI.
- **Person history = "received" only.** A student's history list is their
  own completed requests filtered to entries where *their own* participant
  status is `received`. A student marked `sleeping` on a request will never
  see that request in their own history, even though their name was on it.
  (Matching is by name, case-insensitive, against the logged-in account's
  name — see "Known limitations" below.)
- **Runner history keeps every trip.** Completed deliveries and clashed
  requests are both visible to the runner, in separate sections, with the
  full participant list and outcomes preserved — clashes are shown as
  rejected conflicts, never counted as completed trips.

## Demo flow (for the evaluator)

1. Log in as a student (e.g. `rahul_demo`). Submit **two delivery
   requests for the same hostel block/room/time**, each with a few
   participant names (include at least one request with 4 names).
2. Log in as the **runner** (`runner_demo`). Under "Pending requests,"
   accept the first request — it becomes the active delivery and the status
   banner flips to **Runner On Delivery**. Try to accept the second — it's
   rejected and flips to **Clash**, with the reason shown (not a raw error).
3. On the active delivery's handover panel, mark 3 participants **Received**
   and 1 **Sleeping**. The "Complete Delivery" button stays disabled until
   every participant has an outcome.
4. Click **Complete Delivery** (confirm in the dialog). The runner becomes
   **Available** again and the trip moves into "Runner history · completed
   deliveries."
5. Log back in as the participants who were marked Received — their
   **personal "received only" history** shows the trip. Log in as (or check)
   the participant marked Sleeping — that trip does **not** appear in their
   received history.
6. Back as the runner, open **Runner history** — the completed trip (full
   participant breakdown) and the **clashed/rejected** request both appear,
   clearly separated, with the clash never counted as completed.

## Known limitations

- "Same time" conflict detection is "only one request may be `accepted` at a
  time" (there's exactly one runner, so this is the correct and simplest
  interpretation — the runner literally cannot be in two places at once),
  rather than comparing overlapping time ranges across multiple runners.
- Person history matches participants by name (case-insensitive) against the
  logged-in user's own account name, so a participant's typed name should
  match their account name to show up in their personal history. A fully
  separate student directory / account linking was out of scope for PS-2.
- No payments, menus, inventory, or live GPS tracking — explicitly out of
  scope per the problem statement.
