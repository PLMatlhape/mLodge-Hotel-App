# Reviews Implementation TODO

## Overview
The reviews table exists in the database and backend API is fully implemented. However, the client-side UI for displaying, creating, and managing reviews is missing. This TODO focuses on implementing reviews functionality on both client and admin sites while maintaining the project's structure, design, and functionality.

## Client-Side Reviews Implementation

### 1. Room Details Page - Display Reviews
- [ ] Add reviews section to `src/Pages/Client/RoomDetails.tsx`
- [ ] Fetch and display existing reviews for the accommodation
- [ ] Show review rating, comment, user name, and date
- [ ] Display average rating and total review count
- [ ] Implement pagination for reviews (if many reviews exist)
- [ ] Add "Write a Review" button for authenticated users who have completed bookings

### 2. Review Creation Modal/Dialog
- [ ] Create `src/components/ReviewModal.tsx` component
- [ ] Add star rating selector (1-5 stars)
- [ ] Add comment textarea with validation (10-1000 characters)
- [ ] Implement form validation and error handling
- [ ] Check if user has completed booking for the accommodation before allowing review
- [ ] Prevent duplicate reviews for same accommodation
- [ ] Show success/error messages using existing toast system

### 3. User Review Management
- [ ] Add "My Reviews" section to `src/Pages/Client/Profile.tsx`
- [ ] Display user's submitted reviews with accommodation details
- [ ] Allow users to edit their own reviews (rating and comment)
- [ ] Allow users to delete their own reviews
- [ ] Show review status (pending/approved/rejected) with appropriate styling

### 4. Dashboard Integration
- [ ] Add average rating display to room cards in `src/Pages/Client/Dashboard.tsx`
- [ ] Show review count on room cards
- [ ] Update room rating calculation to use actual review data

### 5. Review Permissions & Validation
- [ ] Implement client-side validation matching backend rules
- [ ] Check booking completion before allowing reviews
- [ ] Prevent review editing after approval
- [ ] Handle authentication requirements for review actions

## Admin-Side Reviews Enhancement

### 6. Review Moderation Page Improvements
- [ ] Enhance `src/Pages/admin/ReviewModeration.tsx` with additional filters
- [ ] Add bulk approve/reject actions
- [ ] Add review flagging functionality
- [ ] Implement review search by user name, accommodation, or content
- [ ] Add review statistics dashboard (pending, approved, rejected counts)

### 7. Admin Review Management
- [ ] Add detailed review view modal in admin panel
- [ ] Allow admins to edit review content if needed
- [ ] Add review audit trail (who approved/rejected and when)
- [ ] Implement review reporting system for flagged content

## UI/UX Enhancements

### 8. Review Components
- [ ] Create reusable `ReviewCard.tsx` component
- [ ] Create `StarRating.tsx` component for rating display/input
- [ ] Add review loading states and skeletons
- [ ] Implement responsive design for review sections

### 9. Review Notifications
- [ ] Add notification when review is approved/rejected
- [ ] Show pending review status to users
- [ ] Implement email notifications for review status changes

## Integration & Testing

### 10. Redux State Integration
- [ ] Ensure reviews state is properly connected to existing Redux store
- [ ] Update `src/store/slices/reviewsSlice.ts` if needed for new functionality
- [ ] Handle review state in room details and user profile

### 11. API Integration
- [ ] Connect all review components to existing API endpoints
- [ ] Handle API errors gracefully with user-friendly messages
- [ ] Implement proper loading states for all review operations

### 12. Testing & Validation
- [ ] Test review creation with various scenarios (authenticated/unauthenticated, booking status)
- [ ] Test admin moderation workflow
- [ ] Validate review data integrity and security
- [ ] Test responsive design on different screen sizes

## Design Consistency

### 13. Maintain Project Design
- [ ] Use existing color scheme (#001F3F, #0F51AF, etc.)
- [ ] Follow established component patterns and styling
- [ ] Maintain consistent spacing and typography
- [ ] Use existing UI components from `src/components/ui/`
- [ ] Ensure reviews integrate seamlessly with existing room details and dashboard layouts

## Performance & Security

### 14. Performance Optimization
- [ ] Implement lazy loading for reviews on room details
- [ ] Cache review data appropriately
- [ ] Optimize review fetching and pagination

### 15. Security Measures
- [ ] Validate all review inputs on client and server
- [ ] Implement rate limiting for review submissions
- [ ] Ensure proper authentication checks for all review operations
- [ ] Sanitize review content to prevent XSS attacks

## Final Integration

### 16. Complete Integration
- [ ] Update navigation to include review-related links if needed
- [ ] Add review functionality to booking completion flow
- [ ] Ensure reviews work across all accommodation types
- [ ] Test end-to-end review workflow from creation to moderation
