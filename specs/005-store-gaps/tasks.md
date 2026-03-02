---
description: "Task list for Store Gaps Fixes feature implementation"
---

# Tasks: Store Gaps Fixes

**Input**: Design documents from `/specs/005-store-gaps/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature spec does not explicitly request test implementation, so tests are NOT included in these tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/`
- Paths adjusted based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create frontend page structure for new routes in app/ directory

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Create backend route for order details endpoint GET /api/users/orders/:id
- [X] T003 [P] Create backend route for contact form endpoint POST /api/contact
- [X] T004 Create shared UI components if needed for new feature pages

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View order details (Priority: P1) 🎯 MVP

**Goal**: Implement order detail page at /orders/[id] that shows complete order information for authenticated users

**Independent Test**: Can be fully tested by navigating to /orders, clicking "View Details" button for an order, and verifying the detailed order page displays all relevant information including items, quantities, prices, shipping address, status, and tracking number.

### Implementation for User Story 1

- [X] T005 [P] Create dynamic route structure frontend/app/orders/[id]/page.tsx
- [X] T006 [P] [US1] Implement backend validation to ensure users can only access their own orders
- [X] T007 [US1] Create order detail page UI following existing design patterns (font-display headings, LightSheenButton, AnimatedElement, card/border/rounded-xl)
- [X] T008 [US1] Connect order detail page to backend API endpoint to fetch specific order
- [X] T009 [US1] Display order items, quantities, prices, shipping address, status, and tracking information
- [X] T010 [US1] Add authentication guard using useAuth() hook

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Manage saved addresses (Priority: P1)

**Goal**: Complete the addresses tab on the profile page to allow adding and deleting saved addresses

**Independent Test**: Can be fully tested by navigating to /profile, going to Addresses tab, adding a new address, verifying it appears in the list, and deleting an address, verifying it's removed.

### Implementation for User Story 2

- [X] T011 [P] [US2] Connect address form to userApi.addAddress() function
- [X] T012 [P] [US2] Connect address deletion to userApi.deleteAddress() function
- [X] T013 [US2] Add success/error notifications using sonner toast for address operations
- [X] T014 [US2] Update address list after add/delete operations
- [X] T015 [US2] Implement validation for address form fields
- [X] T016 [US2] Add loading states for address operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Change password (Priority: P1)

**Goal**: Complete the password change functionality on the profile page account tab

**Independent Test**: Can be fully tested by navigating to /profile, going to Account tab, entering current password and new password, submitting form, and verifying success message appears.

### Implementation for User Story 3

- [X] T017 [P] [US3] Connect password form to userApi.updatePassword() function
- [X] T018 [P] [US3] Implement current password validation before allowing change
- [X] T019 [US3] Add security best practices (generic error messages to prevent password enumeration)
- [X] T020 [US3] Add success notifications using sonner toast for password changes
- [X] T021 [US3] Implement password validation requirements
- [X] T022 [US3] Add loading states for password change operations

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Contact page (Priority: P2)

**Goal**: Create a contact form page at /contact with name, email, message fields that stores submissions in database

**Independent Test**: Can be fully tested by navigating to /contact page, filling out form and submitting, and verifying confirmation feedback appears.

### Implementation for User Story 4

- [X] T023 Create contact page UI at frontend/app/contact/page.tsx following existing design patterns
- [X] T024 [P] [US4] Create contact form with name, email, message fields
- [X] T025 [P] [US4] Connect form to backend API endpoint POST /api/contact
- [X] T026 [US4] Implement form validation for required fields
- [X] T027 [US4] Add success/error feedback using sonner toast
- [X] T028 [US4] Store contact submissions in database for follow-up

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---

## Phase 7: User Story 5 - Returns & Exchanges page (Priority: P2)

**Goal**: Create a static returns and exchanges policy page at /returns-exchanges with policy information

**Independent Test**: Can be fully tested by navigating to /returns-exchanges page and verifying policy information is displayed clearly.

### Implementation for User Story 5

- [X] T029 Create returns and exchanges page at frontend/app/returns-exchanges/page.tsx
- [X] T030 [P] [US5] Add return policy information content following existing design patterns
- [X] T031 [US5] Include exchange process information
- [X] T032 [US5] Add instructions on how to initiate a return
- [X] T033 [US5] Apply consistent styling (font-display headings, card/border/rounded-xl patterns)

**Checkpoint**: At this point, all user stories should now be independently functional

---

## Phase 8: User Story 6 - Products pagination (Priority: P2)

**Goal**: Implement pagination on /products page showing 12 products per page with navigation controls

**Independent Test**: Can be fully tested by visiting /products page and using pagination controls to navigate between pages, verifying correct products are displayed on each page.

### Implementation for User Story 6

- [X] T034 [P] [US6] Update ProductsClientPage.tsx to add pagination controls
- [X] T035 [P] [US6] Modify API calls to include page and limit parameters (limit=12)
- [X] T036 [US6] Add pagination state management
- [X] T037 [US6] Update URL to reflect current page
- [X] T038 [US6] Implement prev/next navigation buttons
- [X] T039 [US6] Handle edge cases for first/last page navigation

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T040 [P] Update navigation links to include new pages (/contact, /returns-exchanges)
- [X] T041 [P] Verify all new pages follow consistent design patterns
- [X] T042 Test all new functionality with authentication guards
- [X] T043 Run quickstart validation to ensure all features work together
- [X] T044 Update any necessary documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members
- Tasks within each user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tasks for User Story 1 together:
Task: "Create dynamic route structure frontend/app/orders/[id]/page.tsx"
Task: "Implement backend validation to ensure users can only access their own orders"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. Complete Phase 5: User Story 3
6. **STOP and VALIDATE**: Test User Stories 1-3 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
   - Developer F: User Story 6
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence