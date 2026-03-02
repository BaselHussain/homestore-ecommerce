---
id: "0005"
title: UI bug fixes — profile, contact, track-order
stage: green
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 005-store-gaps
branch: 005-store-gaps
user: CW
command: continue from context summary
labels: ["bug-fix", "ui", "profile", "contact", "track-order", "animation", "css"]
links:
  spec: specs/005-store-gaps/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/routes/orders.ts
  - frontend/app/profile/page.tsx
  - frontend/app/track-order/page.tsx
  - frontend/app/contact/page.tsx
tests:
  - Manual: track-order submit button icon + text aligned in flex row
  - Manual: progress tracker line overlaps circles correctly at top-[10px]/top-[12px]
  - Manual: sidebar tab buttons show pointer cursor
  - Manual: order cards expand with smooth 500ms animation + 400ms opacity fade
  - Manual: track order with G9OZDOFC (short 8-char display ID) returns correct order
  - Manual: Account tab form centered with card header/body/footer pattern
  - Manual: Security tab form centered with same card pattern
  - Manual: Orders and Addresses tabs use consistent card pattern
  - Manual: /profile has no Footer
  - Manual: contact form constrained to 600px wide (no container class)
---

## Prompt

(Multiple sequential bug-fix prompts in one session)

1. Track order button icon/text misaligned
2. Progress tracker circles above the connecting line
3. Sidebar tabs missing cursor-pointer
4. Order card expansion animation too fast (blink)
5. Order card expand button missing cursor-pointer
6. Short order ID 'G9OZDOFC' returns "not found" even though order visible in profile
7. Account/Security tab forms left-aligned instead of centered
8. Make card layout consistent across all profile tabs
9. Remove footer from /profile route
10. Contact form stretches full width

## Response snapshot

Fixed 10 separate UI issues across profile, track-order, contact pages and backend:

1. **Track button layout** — Wrapped `LightSheenButton` content in `<span className="flex items-center justify-center gap-2">` so icon and text align in a flex row (LightSheenButton doesn't flex internally).

2. **Progress tracker line** — Changed positioning from `top-1/2 -translate-y-1/2` (which referenced 50% of the full flex container height including labels) to explicit `top-[10px]` for 20px circles (profile) and `top-[12px]` for 24px circles (track-order).

3. **Sidebar cursor** — Added `cursor-pointer` to all `<button>` tab elements in the sidebar.

4. **Expand animation** — Switched from `duration-200` to CSS grid-rows trick: `grid-rows-[0fr]/grid-rows-[1fr]` with `transition-all duration-500 ease-in-out` for height + `duration-[400ms] delay-150` opacity fade for staggered appearance.

5. **Expand button cursor** — Added `cursor-pointer` to each order card's expand `<button>`.

6. **Short order ID lookup** — Backend `GET /api/orders/track` now accepts 8-char display IDs via Prisma `OR: [{ id: orderId }, { id: { endsWith: orderId.toLowerCase(), mode: 'insensitive' } }]`. Profile always shows last 8 chars uppercased; users were entering that format.

7. **Account/Security centering** — Moved section heading + subtitle inside the card with a `border-b border-border` separator. Added `bg-secondary/40` footer row with right-aligned Save button. Wrapped content in `max-w-md mx-auto`.

8. **Tab card consistency** — Applied the same card header/body/footer pattern to Orders and Addresses tabs. Addresses tab uses animated slide-down form (grid-rows trick) for "Add address" flow.

9. **Footer removal** — Removed `Footer` import and `<Footer />` from `/profile` page.

10. **Contact form width** — Root cause: Tailwind config `container: { screens: { "2xl": "1400px" } }` generates `max-width: 1400px` at ≥1536px via media query, which overrides `max-w-2xl` (672px) because media query rules come later in CSS cascade. Fix: removed all `container` usage, moved `px-4 lg:px-8` to `<section>`, used `w-full max-w-[600px] mx-auto` on inner wrapper.

## Outcome

- ✅ Impact: 10 UI bugs fixed across profile dashboard, track-order page, contact page, and orders backend endpoint
- 🧪 Tests: Manual verification of all flows
- 📁 Files: 4 modified (orders.ts, profile/page.tsx, track-order/page.tsx, contact/page.tsx)
- 🔁 Next prompts: End-to-end testing with live backend; create PR for 005-store-gaps
- 🧠 Reflection: The Tailwind container config is a footgun — `screens` override only applies at that breakpoint but generates a media query that beats regular utilities. Always use `w-full max-w-[X] mx-auto` pattern instead of `container mx-auto max-w-[X]` for constrained centered content. Also: progress tracker lines need explicit pixel positioning (half of circle height), not `top-1/2` which is relative to the full container.

## Evaluation notes (flywheel)

- Failure modes observed: Multiple "File has been modified since read" errors during contact page rewrite — file was being modified by Next.js HMR/linter between Read and Write calls
- Graders run and results (PASS/FAIL): N/A (manual review)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Pre-fill orderId in track-order form from checkout confirmation page query param
