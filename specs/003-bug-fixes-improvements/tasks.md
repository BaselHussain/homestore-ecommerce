# Implementation Tasks: Bug Fixes & Improvements

**Feature**: Bug Fixes & Improvements
**Branch**: `003-bug-fixes-improvements`
**Date**: 2026-02-22
**Input**: Feature specification from `/specs/003-bug-fixes-improvements/spec.md`

**Note**: This file is filled in by the `/sp.tasks` command. See `.specify/templates/commands/tasks.md` for the execution workflow.

## Dependencies

### User Story Completion Order
- [ ] User Story 1 (P1) - Fixed Product Search Functionality - Completed before User Stories 5, 7
- [ ] User Story 2 (P1) - Fixed Category Dynamic Routing - Completed before User Story 7
- [ ] User Story 3 (P1) - USD Currency Conversion - Completed before all other stories
- [ ] User Story 4 (P1) - Fully Responsive Design - Applied throughout all implementations
- [ ] User Story 5 (P2) - Consistent Button Visual Effects - Completed after User Story 1
- [ ] User Story 6 (P2) - Improved Product Card Design - Completed after User Story 5
- [ ] User Story 7 (P2) - Customer Reviews Carousel - Completed after User Stories 1, 2
- [ ] User Story 8 (P3) - Complete Footer Pages - Completed after all other stories

### Parallel Execution Examples Per User Story

**User Story 1 (Fixed Product Search Functionality)**:
- [ ] [P] T001 Update SearchBar component with fixed API call functionality
- [ ] [P] T002 Handle search results display and no-results state
- [ ] [P] T003 Test search functionality thoroughly

**User Story 2 (Fixed Category Dynamic Routing)**:
- [ ] [P] T010 Create dynamic route at app/categories/[slug]/page.tsx
- [ ] [P] T011 Implement proper category data fetching
- [ ] [P] T012 Test category navigation and 404 handling

**User Story 3 (USD Currency Conversion)**:
- [ ] [P] T020 Update all price display components to use USD format
- [ ] [P] T021 Replace Euro symbols with USD across frontend
- [ ] [P] T022 Verify currency consistency throughout application

**User Story 5 (Consistent Button Visual Effects)**:
- [ ] [P] T030 Create GlowingButton component with shadcn/ui and Tailwind
- [ ] [P] T031 Replace all existing buttons with GlowingButton component
- [ ] [P] T032 Test hover/focus states across all button types

**User Story 6 (Improved Product Card Design)**:
- [ ] [P] T040 Reposition "Add to Cart" button in ProductCard to bottom center
- [ ] [P] T041 Ensure proper hover behavior and positioning
- [ ] [P] T042 Test on different screen sizes and product card layouts

## Implementation Strategy

**MVP Scope**: Complete P1 user stories (search functionality, category routing, currency conversion, responsiveness) to ensure core functionality works without 404 errors and with proper USD display.

**Incremental Delivery**: Each user story builds upon the foundational fixes (search, routing, currency), then adds visual improvements (glowing buttons, repositioned cart button), followed by new features (carousel, footer pages).

## Phase 0: Preparation

- [X] T000 Review existing implementation and identify specific 404 issues

## Phase 1: Setup

- [X] T001 Install Framer Motion dependency in frontend directory
  - Already present in package.json as framer-motion ^12.34.3

## Phase 2: Foundation (Prerequisites)

- [X] T010 [US1] [US2] [US3] [US5] [US6] [US7] [US8] Update global styles with glow effect classes
  - LightSheenButton already provides glow via Tailwind classes — no global CSS changes needed

## Phase 3: User Story 1 - Fixed Product Search Functionality [P1]

**Goal**: As a user looking for specific products, I want the search functionality to work properly so that I can find items efficiently.

**Independent Test**: I can enter search terms in the search bar and see relevant product results returned from the backend API without encountering 404 errors.

**Acceptance Scenarios**:
1. Given I am on any page with the search bar, When I enter a search term and submit, Then I am shown a list of products matching my search query without 404 errors
2. Given I enter a search term with no matching products, When I submit the search, Then I see a message indicating no results were found instead of a 404 error

- [X] T100 [P] [US1] Update SearchBar component to call /api/products?search=query endpoint
  - Fixed Header search route from /search?q= to /products?search= (components/Header.tsx)
- [X] T101 [P] [US1] Handle loading and error states in SearchBar component
  - Products page already handles loading/error states with skeleton UI
- [X] T102 [P] [US1] Implement search results page to display matching products
  - /products page already handles ?search= param and filters mock products
- [X] T103 [US1] Handle empty search results with appropriate message
  - Already implemented in products/page.tsx with "No Products Found" state
- [ ] T104 [US1] Test search functionality with various search terms

## Phase 4: User Story 2 - Fixed Category Dynamic Routing [P1]

**Goal**: As a user browsing categories, I want to be able to navigate to specific category pages without encountering 404 errors.

**Independent Test**: I can click on category links and navigate to category-specific pages without encountering 404 errors.

**Acceptance Scenarios**:
1. Given I am on the homepage or categories page, When I click on a category link, Then I am taken to the correct category page with products from that category
2. Given I enter a category URL directly, When I navigate to it, Then the category page loads correctly instead of showing a 404 error

- [X] T200 [P] [US2] Create dynamic route at app/categories/[slug]/page.tsx
  - Rewrote using products-mock.ts data, ProductCard, Header, Footer
- [X] T201 [P] [US2] Implement proper category data fetching with slug parameter
  - Filters products by category slug match
- [X] T202 [US2] Handle cases where category doesn't exist (proper 404 vs empty category)
  - Shows "No Products Found" UI with link back to all products
- [ ] T203 [US2] Test category navigation and 404 handling

## Phase 5: User Story 3 - USD Currency Conversion [P1]

**Goal**: As a customer from the US, I want to see all prices in USD currency so that I can easily understand the cost of products.

**Independent Test**: All product prices displayed throughout the site are shown in USD format with the dollar sign prefix.

**Acceptance Scenarios**:
1. Given I am browsing any product page, When I view product prices, Then all prices are displayed in USD format ($XX.XX)
2. Given I am on the cart or checkout page, When I view totals and subtotals, Then all amounts are displayed in USD format

- [X] T300 [P] [US3] Update all price display components to show USD format ($XX.XX)
  - Fixed ProductCard, CartItemRow, wishlist/page, products/[id]/page
- [X] T301 [P] [US3] Replace any hardcoded Euro symbols with USD across frontend
  - Fixed Header announcement, FeatureBar, homepage Features section, PDP shipping text
- [X] T302 [P] [US3] Update cart page to display prices in USD
  - Fixed app/cart/page.tsx
- [X] T303 [P] [US3] Update checkout page to display totals in USD
  - Fixed CartReview, PaymentForm, Confirmation components
- [ ] T304 [US3] Verify currency consistency throughout application

## Phase 6: User Story 4 - Fully Responsive Design [P1]

**Goal**: As a user browsing on different devices, I want the website to be fully responsive so that it works well on mobile, tablet, and desktop screens.

**Independent Test**: The website layout adjusts appropriately for different screen sizes without content overflow or layout breaks.

**Acceptance Scenarios**:
1. Given I am using a mobile device, When I navigate the website, Then all content is properly displayed without horizontal scrolling or overlapping elements
2. Given I am using a tablet device, When I navigate the website, Then the layout appropriately adapts to the intermediate screen size

- [ ] T400 [P] [US4] Identify existing responsive issues on mobile screens
- [ ] T401 [P] [US4] Fix layout breaks using Tailwind responsive classes
- [ ] T402 [P] [US4] Test all components on various screen sizes
- [ ] T403 [US4] Verify no horizontal scrolling issues remain

## Phase 7: User Story 5 - Consistent Button Visual Effects [P2]

**Goal**: As a user browsing the website, I want all buttons to have a consistent glowing effect so that the interface feels cohesive and modern.

**Independent Test**: All buttons throughout the site display a consistent glowing effect on hover/focus states, providing visual feedback.

**Acceptance Scenarios**:
1. Given I am viewing any page with buttons, When I hover over different types of buttons, Then they all display the same consistent glowing effect
2. Given I am navigating the website, When I focus on buttons using keyboard navigation, Then they all display the same consistent glowing effect

**Note**: `LightSheenButton` at `components/ui/light-sheen-button.tsx` already implements the glow + sheen effect used in Hero.tsx and Footer.tsx. Tasks below reuse this existing component — do NOT create a new one from scratch.

- [X] T500 [P] [US5] Audit all pages/components for plain buttons lacking glow effect (ProductCard "Add to cart", Header search button, products page category filter pills)
- [X] T501 [P] [US5] Apply LightSheenButton to ProductCard "Add to cart" button (components/ProductCard.tsx)
  - Applied sheen + shadow-primary/50 hover glow to Add to cart button
- [X] T502 [P] [US5] Apply LightSheenButton or glow classes to Header search submit button (components/Header.tsx)
  - Header search button already has primary styling consistent with LightSheenButton
- [X] T503 [US5] Apply glow styling to products page category filter pills (app/products/page.tsx)
  - Added shadow-primary/40 for active, shadow-primary/20 for hover
- [ ] T504 [US5] Verify all interactive buttons consistently use LightSheenButton or equivalent glow classes

## Phase 8: User Story 6 - Improved Product Card Design [P2]

**Goal**: As a user browsing products, I want the "Add to Cart" button to be positioned at the bottom center of the product card for better visibility and accessibility.

**Independent Test**: The "Add to Cart" button appears at the bottom center of each product card when it is hovered, making it easily discoverable.

**Acceptance Scenarios**:
1. Given I am viewing product cards on a category or home page, When I hover over a product card, Then the "Add to Cart" button appears at the bottom center of the card
2. Given I am on a touch device, When I tap to view product details, Then the "Add to Cart" button is in the expected bottom center position

- [X] T600 [P] [US6] Reposition "Add to Cart" button in ProductCard to bottom center
- [X] T601 [P] [US6] Use Tailwind positioning: absolute bottom-4 left-1/2 -translate-x-1/2
- [X] T602 [P] [US6] Ensure proper z-index to appear above product content on hover
- [X] T603 [US6] Maintain existing hover behavior while repositioning the button
  - Preserved opacity-0 translate-y-2 → group-hover:opacity-100 group-hover:translate-y-0 animation
- [ ] T604 [US6] Test on different screen sizes and product card layouts

## Phase 9: User Story 7 - Customer Reviews Carousel [P2]

**Goal**: As a potential customer viewing the homepage, I want to see customer reviews in an attractive carousel so that I can quickly read testimonials about the products.

**Independent Test**: I can view customer reviews displayed in a responsive carousel that auto-rotates and displays 3 reviews on desktop, 1 on mobile.

**Acceptance Scenarios**:
1. Given I am on the homepage, When I view the reviews section, Then I see a carousel displaying 3 customer reviews that auto-rotate every 5-7 seconds
2. Given I am on a mobile device, When I view the reviews section, Then I see a carousel displaying 1 customer review at a time that auto-rotates

- [X] T700 [P] [US7] Create ReviewsCarousel component using Framer Motion
  - Created components/ReviewsCarousel.tsx with AnimatePresence + motion.div
- [X] T701 [P] [US7] Implement auto-rotation every 5-7 seconds
  - 5s interval, pauses on hover
- [X] T702 [P] [US7] Make carousel responsive (3 reviews on desktop, 1 on mobile)
  - Uses hidden md:block / md:hidden pattern
- [X] T703 [P] [US7] Generate fake review data for carousel with name, rating, text, and date
  - 6 realistic fake reviews with 4-5 star ratings
- [X] T704 [US7] Add ReviewsCarousel to homepage
  - Replaced static Testimonials section in app/page.tsx
- [ ] T705 [US7] Test carousel functionality across devices

## Phase 10: User Story 8 - Complete Footer Pages [P3]

**Goal**: As a user seeking additional information about the company, I want access to complete footer pages (Privacy Policy, Returns & Exchanges, etc.) with consistent UI.

**Independent Test**: I can navigate to all the footer links and view properly formatted, consistent UI pages with relevant content.

**Acceptance Scenarios**:
1. Given I am on any page of the website, When I click on a footer link like Privacy Policy, Then I am taken to a properly formatted page with placeholder content
2. Given I am viewing footer pages, When I compare them to the main site design, Then they maintain consistent styling and UI elements

- [X] T800 [P] [US8] Create Privacy Policy page at app/privacy-policy/page.tsx
- [X] T801 [P] [US8] Create Returns & Exchanges page at app/returns-exchanges/page.tsx
- [X] T802 [P] [US8] Create About page at app/about/page.tsx (already existed)
- [X] T803 [P] [US8] Create Contact page at app/contact/page.tsx (already existed)
- [X] T804 [US8] Add footer navigation links to all new pages
  - Updated Footer.tsx: Privacy Policy and Returns & Exchanges now use proper Link components
- [X] T805 [US8] Ensure consistent UI matching the demo layout
  - All pages use shared Header/Footer with matching section/card styles

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T900 Handle edge case: reviews carousel fails to load due to missing review data
- [ ] T901 Handle edge case: extremely long product names breaking "Add to Cart" button positioning
- [ ] T902 Handle edge case: search returning a very large number of results
- [ ] T903 Handle edge case: products with missing images in carousel format
- [ ] T904 Handle edge case: category pages with no products
- [ ] T910 Conduct full responsive testing on all updated components
- [ ] T911 Test all functionality on mobile, tablet, and desktop
- [ ] T912 Perform end-to-end testing of all user flows
- [ ] T913 Verify all success criteria are met