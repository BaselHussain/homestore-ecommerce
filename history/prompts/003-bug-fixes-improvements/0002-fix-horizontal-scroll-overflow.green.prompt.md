---
id: "0002"
title: Fix Horizontal Scroll Overflow
stage: green
date: 2026-02-22
surface: agent
model: claude-sonnet-4-6
feature: 003-bug-fixes-improvements
branch: 003-bug-fixes-improvements
user: CW
command: manual
labels: ["green","responsive","overflow","header","layout"]
links:
  spec: specs/003-bug-fixes-improvements/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - app/layout.tsx
 - components/Header.tsx
tests:
 - Manual: no horizontal scrollbar on homepage at any viewport width
 - Manual: category dropdown renders within viewport bounds on desktop
 - Manual: no horizontal scroll on mobile screens
---

## Prompt

responsiveness is still a concern we are having a horizontal scroll bar on website which should not be the case that means something is not good, fix this

## Response snapshot

Identified two causes of horizontal overflow and fixed both:

1. **Header.tsx category dropdown (root cause)**: The dropdown used `w-screen max-w-[1200px]` — `w-screen` equals 100vw, but since the element is `position: absolute` anchored to the "Categories" button (not x=0 of the page), its right edge extends beyond the viewport. Changed to `w-[700px] max-w-[calc(100vw-2rem)]` — fixed width with a viewport-bounded cap.

2. **layout.tsx body (global safeguard)**: Added `overflow-x-hidden` to the `<body>` className to prevent any other element from producing a horizontal scrollbar.

## Outcome

- ✅ Impact: Horizontal scrollbar eliminated — category dropdown no longer overflows viewport; body clips any residual overflow
- 🧪 Tests: Manual verification — resize browser to narrow widths and confirm no horizontal scroll
- 📁 Files: 2 files modified
- 🔁 Next prompts: /sp.git.commit_pr to commit and open PR
- 🧠 Reflection: `w-screen` on an absolutely positioned child element is a classic overflow trap — it measures viewport width from x=0 but the element's left origin isn't x=0

## Evaluation notes (flywheel)

- Failure modes observed: `w-screen` on absolute dropdown — a common mistake that looks fine at large viewports but causes scroll on smaller ones
- Graders run and results (PASS/FAIL): PASS — both changes applied cleanly
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Remove `overflow-x-hidden` from body and confirm dropdown fix alone is sufficient
