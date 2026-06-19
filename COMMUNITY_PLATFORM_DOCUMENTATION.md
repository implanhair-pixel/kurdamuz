# KurdAmuz Community Platform Documentation

## Overview

The KurdAmuz Community Platform is a comprehensive, enterprise-grade community system integrated into the KurdAmuz language learning platform. It enables users to engage in discussions, share experiences, ask questions, and build a supportive learning community.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Pages](#pages)
6. [RBAC System](#rbac-system)
7. [Integrations](#integrations)
8. [Moderation](#moderation)
9. [Analytics](#analytics)
10. [Testing](#testing)

## Architecture

### Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Internationalization**: next-intl

### Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── community/
│   │   │   ├── page.tsx              # Community feed
│   │   │   ├── [id]/page.tsx         # Individual post
│   │   │   ├── profile/[userId]/     # User profile
│   │   │   └── search/               # Search page
│   │   └── dashboard/
│   │       └── page.tsx              # User dashboard
│   ├── admin/
│   │   └── community/
│   │       └── page.tsx              # Admin community page
│   └── api/
│       └── community/
│           ├── posts/
│           ├── comments/
│           ├── reactions/
│           ├── profiles/
│           ├── reports/
│           ├── moderation/
│           ├── notifications/
│           └── search/
├── components/
│   ├── community/
│   │   ├── PostCard.tsx
│   │   ├── PostEditor.tsx
│   │   ├── CommentThread.tsx
│   │   ├── ReactionBar.tsx
│   │   ├── ReportDialog.tsx
│   │   ├── UserProfileCard.tsx
│   │   ├── NotificationPanel.tsx
│   │   └── CommunityFeed.tsx
│   └── admin/community/
│       ├── ModerationPanel.tsx
│       ├── ReportList.tsx
│       └── analytics/
│           └── CommunityAnalytics.tsx
└── lib/
    ├── community/
    │   ├── validations.ts
    │   ├── posts.ts
    │   ├── comments.ts
    │   ├── reactions.ts
    │   ├── profiles.ts
    │   ├── reports.ts
    │   ├── moderation.ts
    │   ├── notifications.ts
    │   ├── integration.ts
    │   └── validation.test.ts
    └── auth.ts
```

## Database Schema

### Tables

#### community_profiles
User profiles for the community system, linked to the main user system.

```typescript
{
  id: uuid
  userId: uuid (FK to auth.users)
  displayName: text
  bio: text
  avatarUrl: text
  postCount: integer
  commentCount: integer
  reputationScore: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### community_posts
Main content table for community posts.

```typescript
{
  id: uuid
  userId: uuid (FK to auth.users)
  title: text
  content: text
  postType: text (discussion, question, tip, experience, success, course_discussion, announcement, update)
  status: text (draft, published, archived, removed)
  visibility: text (public, private, restricted)
  reactionCount: integer
  commentCount: integer
  viewCount: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### community_comments
Comments on posts, supporting nested replies.

```typescript
{
  id: uuid
  userId: uuid (FK to auth.users)
  postId: uuid (FK to community_posts)
  parentCommentId: uuid (FK to community_comments, nullable)
  content: text
  status: text (draft, published, archived, removed)
  reactionCount: integer
  replyCount: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### community_reactions
Reactions on posts and comments.

```typescript
{
  id: uuid
  userId: uuid (FK to auth.users)
  targetType: text (post, comment)
  targetId: uuid
  reactionType: text (like, helpful, insightful, celebrate, support)
  createdAt: timestamp
}
```

#### community_reports
User reports for content moderation.

```typescript
{
  id: uuid
  reporterId: uuid (FK to auth.users)
  targetType: text (post, comment, profile)
  targetId: uuid
  reportReason: text (spam, harassment, hate_speech, misinformation, inappropriate, copyright, self_harm, other)
  reportDetails: text
  status: text (pending, under_review, resolved, dismissed)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### moderation_actions
Moderation actions taken on content.

```typescript
{
  id: uuid
  moderatorId: uuid (FK to auth.users)
  targetType: text (post, comment, profile)
  targetId: uuid
  actionType: text (approve, remove, warn, restrict_temp, restrict_perm)
  reason: text
  duration: integer (days)
  createdAt: timestamp
}
```

#### community_notifications
User notifications for community activity.

```typescript
{
  id: uuid
  userId: uuid (FK to auth.users)
  notificationType: text (post_reaction, comment_reply, mention, moderation_action, report_update, achievement_unlock, announcement)
  payload: json
  readStatus: boolean
  createdAt: timestamp
}
```

#### community_audit_logs
Audit trail for all community actions.

```typescript
{
  id: uuid
  actorId: uuid (FK to auth.users)
  actionType: text
  targetId: uuid
  oldValue: json
  newValue: json
  createdAt: timestamp
}
```

## API Endpoints

### Posts

- `GET /api/community/posts` - List posts with pagination and filters
- `POST /api/community/posts` - Create a new post
- `GET /api/community/posts/[id]` - Get a specific post
- `PUT /api/community/posts/[id]` - Update a post
- `DELETE /api/community/posts/[id]` - Delete a post

### Comments

- `GET /api/community/comments` - List comments for a post
- `POST /api/community/comments` - Create a new comment
- `GET /api/community/comments/[id]` - Get a specific comment
- `PUT /api/community/comments/[id]` - Update a comment
- `DELETE /api/community/comments/[id]` - Delete a comment

### Reactions

- `GET /api/community/reactions` - List reactions for content
- `POST /api/community/reactions` - Add a reaction
- `DELETE /api/community/reactions` - Remove a reaction

### Profiles

- `GET /api/community/profiles` - Get user profile
- `POST /api/community/profiles` - Create user profile
- `GET /api/community/profiles/[id]` - Get profile by ID
- `PUT /api/community/profiles/[id]` - Update profile

### Reports

- `GET /api/community/reports` - List reports
- `POST /api/community/reports` - Create a report
- `GET /api/community/reports/[id]` - Get specific report
- `PUT /api/community/reports/[id]` - Update report status

### Moderation

- `GET /api/community/moderation` - List moderation actions
- `POST /api/community/moderation` - Create moderation action

### Notifications

- `GET /api/community/notifications` - List user notifications
- `GET /api/community/notifications/[id]` - Get specific notification
- `PUT /api/community/notifications/[id]` - Mark as read
- `DELETE /api/community/notifications/[id]` - Delete notification

### Search

- `GET /api/community/search` - Search posts, comments, and users

## Frontend Components

### Community Components

- **PostCard**: Display a single post with reactions, comments, and metadata
- **PostEditor**: Form for creating/editing posts
- **CommentThread**: Nested comment display with reply functionality
- **ReactionBar**: Reaction buttons for posts and comments
- **ReportDialog**: Modal for reporting content
- **UserProfileCard**: Display user profile with stats
- **NotificationPanel**: Display user notifications
- **CommunityFeed**: Main feed with search and filters

### Admin Components

- **ModerationPanel**: Interface for moderation actions
- **ReportList**: List of reports with status management
- **CommunityAnalytics**: Dashboard with community metrics

## Pages

### User Pages

- `/community` - Main community feed
- `/community/[id]` - Individual post with comments
- `/community/profile/[userId]` - User profile page
- `/community/search` - Search results page
- `/dashboard` - User dashboard with activity summary

### Admin Pages

- `/admin/community` - Admin community management page

## RBAC System

### Roles

- **owner**: Full system access
- **super_admin**: Full community management
- **admin**: Content moderation and user management
- **editor**: Content creation and editing
- **teacher**: Content creation and interaction
- **student**: Basic interaction permissions

### Permissions

- `read:posts` - View posts
- `create:posts` - Create posts
- `update:posts` - Update posts
- `delete:posts` - Delete posts
- `read:comments` - View comments
- `create:comments` - Create comments
- `update:comments` - Update comments
- `delete:comments` - Delete comments
- `react:content` - React to content
- `report:content` - Report content
- `read:profiles` - View profiles
- `update:own_profile` - Update own profile
- `moderate:content` - Moderate content
- `moderate:users` - Moderate users
- `admin:community` - Admin community settings
- `view:analytics` - View analytics
- `manage:notifications` - Manage notifications

## Integrations

### XP System

- **awardXPForPost**: Award 10 XP for creating a post
- **awardXPForComment**: Award 5 XP for creating a comment
- **awardXPForHelpfulContent**: Award 15 XP for helpful content

### Coin System

- **awardCoinsForPost**: Award 5 coins for creating a post
- **awardCoinsForHelpfulContent**: Award 3 coins for helpful content

### Achievements

- **first_post**: Awarded for first post
- **first_comment**: Awarded for first comment
- **helpful_contributor**: Awarded at 50 reputation
- **community_leader**: Awarded at 100 reputation
- **active_member**: Awarded for 10 posts and 20 comments

### Learning Paths

- **linkPostToLearningPath**: Link posts to learning paths
- **getCommunityProgressForLearningPath**: Track community activity per learning path

## Moderation

### Report Workflow

1. User submits report via ReportDialog
2. Report created with status "pending"
3. Admin reviews report in admin panel
4. Admin takes moderation action
5. Report status updated to "resolved" or "dismissed"

### Moderation Actions

- **approve**: Approve content
- **remove**: Remove content
- **warn**: Warn user
- **restrict_temp**: Temporary restriction
- **restrict_perm**: Permanent restriction

## Analytics

### Metrics Tracked

- Total posts and comments
- Total reactions
- Active users
- Pending and resolved reports
- Engagement rates
- User growth trends

### Analytics Components

- **CommunityAnalytics**: Main analytics dashboard
- **Moderation Overview**: Report statistics
- **Engagement Metrics**: User engagement data

## Testing

### Validation Functions

- `validateCommunityTables()`: Check database schema
- `validateRBACPermissions()`: Verify role permissions
- `validateAPIEndpoints()`: Check API routes
- `validateIntegrations()`: Verify system integrations
- `validateComponents()`: Check component existence
- `validatePages()`: Check page routes

### Running Validations

```typescript
import { runAllValidations } from '@/lib/community/validation.test';

const results = await runAllValidations();
console.log(results);
```

## Deployment Notes

### Database Migration

The community platform requires running the database migration before use:

```bash
npm run db:migrate
```

### Environment Variables

Ensure the following environment variables are configured:

- `NEXT_PUBLIC_APP_URL`: Application URL
- `DATABASE_URL`: PostgreSQL connection string
- Supabase configuration variables

### Dependencies

The community platform requires the following additional dependencies:

- `drizzle-orm`: Database ORM
- `zod`: Validation
- `date-fns`: Date formatting (to be installed)

## Future Enhancements

1. Real-time notifications via WebSockets
2. Advanced search with full-text indexing
3. Content tagging and categorization
4. Rich text editor with markdown support
5. File attachments for posts
6. Polls and surveys
7. Community events and meetups
8. Leaderboards and gamification
9. AI-powered content recommendations
10. Multi-language support for community content

## Support

For issues or questions regarding the community platform, refer to the main KurdAmuz documentation or contact the development team.
