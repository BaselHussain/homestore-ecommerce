# Research: Frontend & Core Features

## Technology Decisions

### State Management: Zustand vs Context
**Decision:** Zustand for cart and wishlist state management
**Rationale:** Zustand provides a simpler, more performant solution for global state management compared to React Context. It doesn't cause unnecessary re-renders across the entire app tree and offers a more straightforward API for managing complex state like shopping cart items and quantities. Better for performance than Context when dealing with complex state updates.
**Alternatives considered:**
- React Context + useReducer: More boilerplate, causes re-renders across consumer components
- Redux Toolkit: More complex setup than needed for this scope
- Jotai: Good but Zustand has better persistence middleware for cart/wishlist storage

### Forms: React Hook Form vs Native
**Decision:** React Hook Form with Zod for validation
**Rationale:** React Hook Form provides excellent performance, easy integration with Zod for validation schemas, and reduces boilerplate code for form handling. Combined with Zod, it provides both client-side validation and type safety, which aligns with the requirement for form validation across all forms.
**Alternatives considered:**
- Native form handling: More verbose, manual validation management
- Final Form: Good but less intuitive than React Hook Form
- Formik: More established but heavier than React Hook Form

### API Client: fetch vs axios
**Decision:** axios for API integration
**Rationale:** Axios provides built-in request/response interceptors which are valuable for handling authentication headers and error responses. It also has better error handling, request/response transformation, and works well with TypeScript. The interceptors will be useful when authentication is added in a later spec.
**Alternatives considered:**
- fetch API: Native but requires more boilerplate for error handling and headers
- SWR: Good for caching but requires more complex cache invalidation strategies
- React Query: Excellent for server state but may be overkill for simple API calls

### Image Zoom: Click to Zoom vs Hover vs Gallery
**Decision:** Click to zoom into 2x view with pan capability
**Rationale:** This approach provides the best user experience for product viewing without overcrowding the UI. Click-to-zoom is intuitive and provides good accessibility. The pan capability allows users to see details in large images. This matches the requirement from the clarifications session.
**Alternatives considered:**
- Hover zoom: Not mobile-friendly
- Gallery view: Would require redesigning the product display layout
- 360-degree view: Too complex for initial implementation

### Empty State Handling
**Decision:** Show friendly message with suggestions or related items
**Rationale:** This maintains user engagement when encountering empty states. For cart/wishlist, this could suggest popular products or a message to continue browsing. For search results, suggesting similar categories or popular items improves UX.
**Alternatives considered:**
- Redirect: Disrupts user flow
- Static placeholder: Less helpful for user engagement
- No message: Poor UX

## Best Practices Researched

### Next.js 16+ Implementation
- Use App Router for layout and route-level configurations
- Leverage React Server Components where possible for better performance
- Implement proper loading and error boundaries (loading.tsx, error.tsx)
- Use Image component for optimized images and automatic responsiveness

### shadcn/ui Integration
- Follow the official setup instructions for Next.js and TypeScript
- Customize the theme to match the homestore-sparkle design
- Use the components as base elements and extend them when needed
- Maintain accessibility standards provided by shadcn/ui components

### Performance Optimization
- Implement proper image optimization with Next.js Image component
- Use client-side caching for API responses
- Implement code splitting with dynamic imports for large components
- Use React.memo for components that render frequently but rarely change

### UI Fidelity to Demo
- Use the same font stack as homestore-sparkle (likely Inter or similar)
- Match color palette exactly using the same hex codes
- Replicate spacing using the same Tailwind classes or measurements
- Use the same component structure and layout patterns