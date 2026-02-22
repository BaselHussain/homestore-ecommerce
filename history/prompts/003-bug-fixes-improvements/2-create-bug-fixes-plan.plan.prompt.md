---
id: 2
title: Create Bug Fixes Plan
stage: plan
date: 2026-02-22
surface: agent
model: if/qwen3-coder-plus
feature: 003-bug-fixes-improvements
branch: 003-bug-fixes-improvements
user: CW
command: /sp.plan
labels: [planning, bug-fixes, improvements, frontend]
links:
  spec: E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\spec.md
  ticket: null
  adr: null
  pr: null
files:
 - E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\plan.md
 - E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\research.md
 - E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\data-model.md
 - E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\quickstart.md
 - E:\\e-commerce claude\\specs\\003-bug-fixes-improvements\\contracts
tests:
 - null
---

## Prompt

Spec 4 - Bug Fixes & Improvements

Create full execution plan:

1. Detailed folder/file structure changes:
   - frontend/components/GlowingButton.tsx (reusable button with glow effect)
   - frontend/app/categories/[slug]/page.tsx (fix dynamic route)
   - frontend/app/privacy-policy/page.tsx (new footer page)
   - frontend/app/returns-exchanges/page.tsx (new footer page)
   - frontend/app/about/page.tsx (new footer page)
   - frontend/app/contact/page.tsx (new footer page)
   - frontend/components/ProductCard.tsx (reposition Add to Cart button)
   - frontend/components/SearchBar.tsx (fix search functionality)
   - frontend/components/ReviewsCarousel.tsx (new carousel component for PDP)
   - Update all price displays (e.g., ProductCard, Cart) to USD

2. Step-by-step integration plan:
   - Create GlowingButton component (shadcn/ui Button variant with Tailwind glow) — replace all buttons
   - Fix categories dynamic route: proper params handling + API call
   - Reposition Add to Cart button in ProductCard: CSS absolute bottom-0 left-1/2
   - Build footer pages: static content, consistent layout matching demo
   - Fix search: update SearchBar to call /api/products?search=query, handle results
   - Change currency: replace € with $ in all components, update backend if prices stored
   - Make responsive: add Tailwind md/lg classes, test on mobile
   - Build ReviewsCarousel component:
     - Show 3 reviews visible (desktop), 1 on mobile
     - Auto-rotate every 5-7 seconds (smooth slide using Framer Motion or Swiper)
     - Fake reviews (Claude generate: name, 1-5 stars, text)
     - Add to PDP below description

3. Decision table:
   - Carousel library: Framer Motion vs Swiper.js (choose Framer Motion for simplicity + shadcn/ui compatibility)
   - Glow effect: Tailwind CSS vs CSS animation (choose Tailwind for reusability)
   - Footer pages: Static vs dynamic (choose static for simplicity)

4. Testing strategy with exact commands:
   - npm run dev → check all buttons glow
   - Navigate /categories/furniture → no 404, shows products
   - Hover product card → Add to Cart centered bottom
   - Click footer links → pages open with content
   - Search "sofa" → shows results, no 404
   - Prices show $ (USD)
   - Resize browser to mobile → no breaks
   - PDP: reviews carousel auto-rotates, 3 visible on desktop

5. Risk mitigation:
   - 404 persist → check dynamic params in Next.js
   - Glow inconsistency → use reusable component everywhere
   - Carousel not smooth → use Framer Motion variants
   - Responsiveness break → use Chrome DevTools mobile emulation

Output in specs/4-bug-fixes-improvements/PLAN.md

Go.

## Response snapshot

Completed comprehensive implementation plan for bug fixes and improvements including:
- Updated Technical Context with accurate project details
- Created Constitution Check with verification against all principles
- Generated research.md with decisions on Framer Motion, Next.js routing, Tailwind effects
- Created data-model.md with Review, SearchQuery, and CategoryParams entities
- Developed quickstart.md with setup instructions and testing steps
- Updated agent context with new technologies (Framer Motion)
- All design artifacts created and validated against constitution

## Outcome

- ✅ Impact: Complete implementation plan created with all required artifacts
- 🧪 Tests: All constitution checks passed in both Phase 0 and Phase 1
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, and contracts directory created
- 🔁 Next prompts: /sp.tasks to generate implementation tasks from plan
- 🧠 Reflection: Plan addresses all requirements with proper technical approach and research

## Evaluation notes (flywheel)

- Failure modes observed: None - plan completed successfully
- Graders run and results (PASS/FAIL): PASS - all constitution checks passed
- Prompt variant (if applicable): Standard /sp.plan command
- Next experiment (smallest change to try): Generate implementation tasks with /sp.tasks