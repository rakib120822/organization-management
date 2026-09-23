# Project Management SaaS — Revised MVP Requirements

## 1. Product Overview

### Product Name
Project Management SaaS

### Product Type
Multi-tenant project and team collaboration platform.

### Main Objective
Build a production-oriented project management application that demonstrates strong full-stack engineering skills, including:

- Multi-tenancy
- Role-based access control
- Secure authentication
- REST API design
- PostgreSQL database modeling
- Prisma ORM
- Task and project management
- Kanban workflow
- Automated testing
- Deployment and documentation

### Core Hierarchy

```text
Organization
 ├── Members
 ├── Teams
 │    └── Team Members
 └── Projects
      ├── Project Members
      ├── Sprints
      ├── Tasks
      │    ├── Subtasks
      │    ├── Comments
      │    ├── Labels
      │    └── Activity History
      └── Project Analytics
```

---

## 2. Project Goals

The project should demonstrate that the developer can:

1. Design a scalable relational database.
2. Implement secure authentication and authorization.
3. Build a multi-tenant SaaS architecture.
4. Create reusable frontend components.
5. Develop modular backend services.
6. Build and document REST APIs.
7. Write unit, integration, and authorization tests.
8. Use Git and GitHub professionally.
9. Deploy a full-stack application.
10. Explain architectural decisions during technical interviews.

---

## 3. Non-Goals for the Initial MVP

The following features should not block the first release:

- Real-time collaborative editing
- Complex enterprise billing
- Advanced AI project planning
- Full video and audio communication
- Complex workflow automation
- Advanced resource planning
- Large-scale event streaming
- Full-featured mobile applications
- Advanced third-party integrations

These features can be added after the core system is stable.

---

## 4. Scope Strategy

### 4.1 Core MVP

The first release should include:

- User registration and login
- User profile
- Organization creation
- Organization membership
- Role-based access control
- Team management
- Project management
- Task CRUD operations
- Task assignment
- Task status and priority
- Kanban board
- Task filtering and searching
- Subtasks
- Comments
- Activity history
- Input validation
- Centralized error handling
- Automated tests
- Deployment
- API documentation

### 4.2 Portfolio Enhancements

After the core MVP is stable, add:

- Sprints
- Labels
- Due dates
- Basic analytics
- Calendar view
- File attachments
- Email notifications
- Redis caching
- Improved audit logs
- Advanced filtering
- Pagination and sorting

### 4.3 Advanced Extensions

Possible future improvements:

- Real-time updates using WebSockets or Server-Sent Events
- In-app notifications
- Subscription and billing
- AI-generated task suggestions
- External calendar integration
- Slack or Discord integration
- Advanced reporting
- Custom workflows
- Enterprise-level audit and compliance features

---

## 5. Recommended Technology Stack

### Frontend

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Zustand or Context API where appropriate
- A drag-and-drop library for the Kanban board

### Backend

- Node.js
- Express.js
- TypeScript
- REST API
- Zod or equivalent validation library
- JWT-based authentication or secure session-based authentication
- Centralized error handling
- Modular service and controller architecture

### Database

- PostgreSQL
- Prisma ORM
- Database migrations
- Foreign-key constraints
- Unique constraints
- Indexes for frequently queried fields

### Testing

- Vitest or Jest
- Supertest for API testing
- React Testing Library
- Authorization and tenant-isolation tests

### DevOps and Tools

- Git
- GitHub
- GitHub Issues
- GitHub Projects or a similar task board
- GitHub Actions
- Docker where practical
- Vercel or another frontend hosting provider
- Render, Railway, Fly.io, or another backend hosting provider
- Neon, Supabase, or another managed PostgreSQL provider

---

## 6. Architecture Decisions

### 6.1 Recommended Repository Structure

A monorepo structure is recommended:

```text
project-management-saas/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── config/
│   ├── types/
│   └── validation/
├── docs/
├── .github/
│   └── workflows/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

If a monorepo feels too complex initially, the frontend and backend can be maintained in separate repositories. However, the folder structure should remain modular.

### 6.2 Backend Module Structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── teams/
│   ├── projects/
│   ├── tasks/
│   ├── comments/
│   ├── sprints/
│   └── analytics/
├── lib/
├── utils/
├── types/
└── routes/
```

Each module should contain, where appropriate:

```text
module/
├── controller.ts
├── service.ts
├── route.ts
├── validation.ts
├── types.ts
└── test.ts
```

### 6.3 Frontend Structure

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
├── organizations/
├── teams/
├── projects/
│   └── [projectId]/
│       ├── overview/
│       ├── board/
│       ├── tasks/
│       ├── sprints/
│       └── settings/
├── settings/
└── api/
```

Recommended reusable frontend folders:

```text
components/
├── ui/
├── forms/
├── layout/
├── tasks/
├── projects/
├── teams/
└── analytics/

lib/
├── api-client.ts
├── auth.ts
├── permissions.ts
└── query-client.ts
```

---

## 7. User Roles and Permissions

### 7.1 Organization-Level Roles

- Owner
- Admin
- Manager
- Member
- Guest

### 7.2 Role Responsibilities

#### Owner

- Manage the organization
- Update organization settings
- Invite and remove members
- Assign organization roles
- Manage all projects and teams
- Transfer or delete the organization, if implemented

#### Admin

- Manage members
- Manage teams and projects
- Review organization activity
- Update operational settings
- Cannot perform owner-only actions

#### Manager

- Manage assigned teams and projects
- Create and assign tasks
- Manage sprints
- Review team activity
- Cannot change organization ownership

#### Member

- View permitted teams and projects
- Create and update permitted tasks
- Add comments
- Update assigned work
- View relevant activity

#### Guest

- View explicitly shared projects or tasks
- Add comments only if permitted
- Cannot manage members or organization settings

### 7.3 Authorization Rules

Authorization must be enforced on the backend. Frontend permission checks are only for user experience and must not be treated as security controls.

Every protected request should verify:

1. The user is authenticated.
2. The user belongs to the relevant organization.
3. The user has the required role or permission.
4. The target resource belongs to the same organization.
5. The user has access to the specific team, project, or task.

---

## 8. Multi-Tenancy and Tenant Isolation

### Requirements

- Every organization-owned record must include an `organizationId` directly or through a secure relationship.
- Users must not access records from another organization.
- Organization membership must be verified for every protected operation.
- Resource IDs must not be trusted as sufficient authorization.
- Service methods should apply organization-level filters.
- Tenant-isolation tests must be included.

### Example Rule

A user from Organization A must not be able to:

- Read a project from Organization B
- Update a task from Organization B
- Add a comment to a task from Organization B
- View private organization activity from Organization B

---

## 9. Core Domain Models

The database should include models similar to the following.

### User

Suggested fields:

- id
- name
- email
- passwordHash or externalAuthId
- avatarUrl
- createdAt
- updatedAt

### Organization

Suggested fields:

- id
- name
- slug
- ownerId
- createdAt
- updatedAt

### OrganizationMember

Suggested fields:

- id
- organizationId
- userId
- role
- joinedAt

Constraints:

- Unique combination of `organizationId` and `userId`
- Indexed organization and user references

### Team

Suggested fields:

- id
- organizationId
- name
- description
- createdBy
- createdAt
- updatedAt

### TeamMember

Suggested fields:

- id
- teamId
- userId
- role or membershipType
- joinedAt

### Project

Suggested fields:

- id
- organizationId
- teamId
- name
- description
- key
- status
- startDate
- endDate
- createdBy
- createdAt
- updatedAt

### ProjectMember

Suggested fields:

- id
- projectId
- userId
- role
- joinedAt

### Sprint

Suggested fields:

- id
- projectId
- name
- goal
- status
- startDate
- endDate
- createdAt
- updatedAt

### Task

Suggested fields:

- id
- organizationId
- projectId
- sprintId
- parentTaskId
- title
- description
- status
- priority
- assigneeId
- reporterId
- dueDate
- position
- createdAt
- updatedAt

### Label

Suggested fields:

- id
- organizationId
- name
- color
- createdAt

### TaskLabel

Suggested fields:

- taskId
- labelId

### Comment

Suggested fields:

- id
- taskId
- authorId
- body
- createdAt
- updatedAt

### Attachment

Suggested fields:

- id
- taskId
- uploadedBy
- fileName
- fileUrl
- fileSize
- mimeType
- createdAt

Attachments should be treated as a portfolio enhancement if time is limited.

### Activity

Suggested fields:

- id
- organizationId
- actorId
- entityType
- entityId
- action
- metadata
- createdAt

---

## 10. Database Constraints and Indexes

The database should enforce important business rules.

### Constraints

- Unique organization slug
- Unique organization membership per user
- Unique team membership per user
- Unique project key within an organization
- Valid foreign-key relationships
- Required fields cannot be null
- Enum values for role, status, and priority
- Prevent duplicate task-label relationships

### Suggested Indexes

Add indexes for:

- Organization membership lookups
- User email
- Project organization ID
- Task project ID
- Task assignee ID
- Task status
- Task priority
- Task due date
- Activity organization ID
- Activity entity ID
- Comment task ID

Do not add indexes blindly. Use expected query patterns and inspect query performance when needed.

---

## 11. Functional Requirements

## 11.1 Authentication

The system must support:

- User registration
- User login
- Logout
- Current-user retrieval
- Password hashing
- Protected routes
- Authentication error handling
- Optional password reset as a later feature

Acceptance criteria:

- Invalid credentials are rejected.
- Passwords are never stored in plain text.
- Protected endpoints reject unauthenticated requests.
- Authentication tokens or sessions are handled securely.
- User identity is derived from trusted authentication data.

## 11.2 Organization Management

The system must support:

- Create an organization
- View organizations belonging to the current user
- Update organization information based on permission
- Invite members
- Remove members based on permission
- Change member roles based on permission
- View organization members

Acceptance criteria:

- Only authorized users can manage members.
- A user cannot access another organization.
- Duplicate memberships are prevented.
- Owner-only actions are protected.

## 11.3 Team Management

The system must support:

- Create teams
- Update teams
- Delete teams where permitted
- Add team members
- Remove team members
- View team members
- Assign teams to projects

Acceptance criteria:

- Team access is organization-scoped.
- Only authorized users can manage team membership.
- Team membership is validated before restricted actions.

## 11.4 Project Management

The system must support:

- Create projects
- Update projects
- Archive or delete projects where permitted
- Add project members
- Remove project members
- Assign a project to a team
- View project details
- View project activity

Acceptance criteria:

- Project keys are unique within the organization.
- Users cannot access projects outside their organization.
- Project-level permissions are enforced.
- Archived projects cannot receive normal updates unless explicitly allowed.

## 11.5 Task Management

The system must support:

- Create tasks
- Update tasks
- Delete tasks where permitted
- Assign tasks
- Set task status
- Set task priority
- Add due dates
- Add descriptions
- Create subtasks
- Add labels
- Add comments
- View task activity

Suggested statuses:

- TODO
- IN_PROGRESS
- IN_REVIEW
- DONE
- BLOCKED

Suggested priorities:

- LOW
- MEDIUM
- HIGH
- URGENT

Acceptance criteria:

- Task titles are required.
- Task project and organization relationships are validated.
- Only authorized users can modify tasks.
- Assignees must have access to the relevant project or team.
- Status changes create activity records.
- Task updates are validated on the server.

## 11.6 Kanban Board

The Kanban board should support:

- Displaying tasks by status
- Moving tasks between columns
- Updating task position
- Drag-and-drop interaction
- Filtering by assignee, priority, label, and sprint
- Loading and error states
- Empty states
- Optimistic updates only when rollback is handled correctly

Acceptance criteria:

- Moving a task updates its status.
- Task ordering is persisted.
- Unauthorized users cannot move restricted tasks.
- Failed updates do not leave the UI in an inconsistent state.

## 11.7 Subtasks

The system should support:

- Creating subtasks
- Updating subtasks
- Completing subtasks
- Displaying parent-child relationships
- Showing progress based on completed subtasks

Acceptance criteria:

- A subtask belongs to the same project and organization as its parent task.
- Circular parent-child relationships are prevented.
- Deleting a parent task follows a documented rule.

## 11.8 Comments

The system should support:

- Adding comments
- Editing own comments where permitted
- Deleting own comments or authorized comments
- Displaying comment author and timestamp

Acceptance criteria:

- Empty comments are rejected.
- Users cannot comment on inaccessible tasks.
- Comment ownership and moderation rules are enforced.

## 11.9 Activity History

The system should record important events such as:

- Organization creation
- Member invitation
- Role changes
- Project creation
- Task creation
- Task assignment
- Status changes
- Priority changes
- Comment creation
- Task deletion

Activity records should include:

- Actor
- Action
- Target entity
- Timestamp
- Optional metadata

## 11.10 Sprints

Sprints may be implemented after the core MVP.

The system should support:

- Create sprints
- Set sprint goals
- Set start and end dates
- Assign tasks to sprints
- Start and complete sprints
- View sprint progress

## 11.11 Basic Analytics

Basic analytics may include:

- Total tasks
- Completed tasks
- Tasks by status
- Tasks by priority
- Overdue tasks
- Sprint completion progress
- Team workload overview

Analytics should initially use simple database queries rather than a complex data warehouse.

---

## 12. API Requirements

### General API Rules

- Use versioned routes such as `/api/v1`.
- Use consistent response formats.
- Validate all request bodies, query parameters, and route parameters.
- Use appropriate HTTP status codes.
- Avoid exposing sensitive internal errors.
- Add pagination to potentially large collections.
- Support filtering and sorting where appropriate.
- Document authentication requirements for protected endpoints.

### Example Endpoint Groups

#### Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

#### Organizations

```text
POST   /api/v1/organizations
GET    /api/v1/organizations
GET    /api/v1/organizations/:organizationId
PATCH  /api/v1/organizations/:organizationId
DELETE /api/v1/organizations/:organizationId
```

#### Organization Members

```text
GET    /api/v1/organizations/:organizationId/members
POST   /api/v1/organizations/:organizationId/members/invite
PATCH  /api/v1/organizations/:organizationId/members/:memberId
DELETE /api/v1/organizations/:organizationId/members/:memberId
```

#### Teams

```text
POST   /api/v1/organizations/:organizationId/teams
GET    /api/v1/organizations/:organizationId/teams
GET    /api/v1/teams/:teamId
PATCH  /api/v1/teams/:teamId
DELETE /api/v1/teams/:teamId
```

#### Projects

```text
POST   /api/v1/organizations/:organizationId/projects
GET    /api/v1/organizations/:organizationId/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
```

#### Tasks

```text
POST   /api/v1/projects/:projectId/tasks
GET    /api/v1/projects/:projectId/tasks
GET    /api/v1/tasks/:taskId
PATCH  /api/v1/tasks/:taskId
DELETE /api/v1/tasks/:taskId
PATCH  /api/v1/tasks/:taskId/status
PATCH  /api/v1/tasks/:taskId/position
```

#### Comments

```text
GET    /api/v1/tasks/:taskId/comments
POST   /api/v1/tasks/:taskId/comments
PATCH  /api/v1/comments/:commentId
DELETE /api/v1/comments/:commentId
```

### Example Response Format

Success:

```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "errorCode": "FORBIDDEN"
}
```

---

## 13. Frontend Requirements

The frontend should provide:

- Responsive layout
- Accessible components
- Clear loading states
- Clear error states
- Empty states
- Form validation
- Toast or inline feedback
- Protected routes
- Organization switcher
- Project navigation
- Task detail drawer or modal
- Kanban board
- Search and filters
- Pagination where required
- Mobile-friendly layout

### Important UI Pages

- Login
- Registration
- Dashboard
- Organization selection
- Organization settings
- Team management
- Project list
- Project overview
- Kanban board
- Task details
- Sprint view
- Activity history
- User settings

### UX Requirements

- Avoid unnecessary page reloads.
- Keep forms reusable.
- Show meaningful validation messages.
- Prevent duplicate submissions.
- Handle API errors consistently.
- Use optimistic updates only when failure rollback is implemented.
- Provide keyboard-accessible interactions where practical.

---

## 14. Security Requirements

The application must include:

- Secure password hashing
- Input validation
- Authorization on every protected operation
- Tenant isolation
- Protection against mass assignment
- Safe error messages
- Rate limiting for authentication endpoints
- CORS configuration
- Secure cookie configuration if cookies are used
- Token expiration and refresh strategy if JWT is used
- Protection against unauthorized object access
- Environment variables for secrets
- No secrets committed to Git
- Dependency updates and vulnerability checks

Never rely only on frontend role checks for security.

---

## 15. Non-Functional Requirements

### Performance

- Use pagination for large datasets.
- Avoid unnecessary database queries.
- Use appropriate indexes.
- Prevent N+1 query patterns.
- Add caching only after identifying a real need.
- Use Redis as an enhancement rather than a mandatory MVP dependency.

### Reliability

- Centralized error handling
- Database transactions for multi-step operations
- Graceful handling of failed requests
- Consistent validation
- Logging for unexpected server errors

### Maintainability

- Strict TypeScript configuration
- Reusable services and components
- Clear naming conventions
- Small, focused modules
- Consistent folder structure
- API documentation
- Environment configuration documentation

### Accessibility

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible form labels
- Appropriate color contrast
- Screen-reader-friendly controls where practical

---

## 16. Testing Strategy

### Unit Tests

Test:

- Validation functions
- Permission helpers
- Utility functions
- Business rules
- Service-level logic

### Integration Tests

Test:

- Authentication endpoints
- Organization creation
- Membership management
- Project creation
- Task CRUD
- Comment operations
- Status updates

### Authorization Tests

Test that:

- Unauthenticated users are rejected.
- Members cannot perform admin-only actions.
- Users cannot access another organization’s data.
- Guests cannot modify restricted resources.
- Users cannot update projects they cannot access.

### Tenant Isolation Tests

At minimum:

1. Create two organizations.
2. Create resources under each organization.
3. Authenticate a user from Organization A.
4. Attempt to access Organization B resources.
5. Confirm that the API rejects the request.

### Frontend Tests

Test:

- Form validation
- Loading states
- Error states
- Permission-based UI behavior
- Kanban task movement
- Task creation and editing

---

## 17. Git and GitHub Workflow

Use a professional workflow even if the project is developed individually.

### Branches

Suggested branches:

```text
main
develop
feature/authentication
feature/organizations
feature/projects
feature/tasks
fix/task-permission
```

### Commit Guidelines

Use meaningful commit messages:

```text
feat: add organization creation endpoint
feat: implement task status update
fix: prevent cross-tenant task access
test: add project authorization tests
docs: update API documentation
refactor: extract task permission service
```

### Pull Request Workflow

For each meaningful feature:

1. Create an issue.
2. Create a feature branch.
3. Implement the feature.
4. Write or update tests.
5. Run linting and tests.
6. Commit changes.
7. Push the branch.
8. Open a pull request.
9. Review the changes.
10. Merge after checks pass.

### CI Pipeline

The GitHub Actions pipeline should run:

- Install dependencies
- Type checking
- Linting
- Unit tests
- Integration tests where configured
- Build validation

---

## 18. Deployment Requirements

### Deployment Checklist

- Configure production environment variables.
- Use a managed PostgreSQL database.
- Run production migrations safely.
- Configure CORS.
- Configure frontend and backend URLs.
- Enable secure cookies or secure token handling.
- Configure logging.
- Add health-check endpoint.
- Configure CI/CD.
- Test the deployed application.
- Add deployment instructions to the README.

### Suggested Health Endpoint

```text
GET /health
```

Example response:

```json
{
  "status": "ok",
  "service": "project-management-api",
  "timestamp": "2026-09-23T00:00:00.000Z"
}
```

---

## 19. Development Phases

### Phase 1 — Setup and Architecture

- Initialize repository
- Configure TypeScript
- Configure linting and formatting
- Configure environment variables
- Set up PostgreSQL
- Configure Prisma
- Create initial project structure
- Configure frontend and backend applications
- Add CI workflow

### Phase 2 — Authentication and Organization Access

- Implement registration
- Implement login and logout
- Implement current-user endpoint
- Create organization
- Add organization membership
- Implement role checks
- Add tenant-isolation middleware or service logic

### Phase 3 — Teams and Projects

- Create teams
- Manage team members
- Create projects
- Manage project members
- Implement project permissions
- Add project overview page

### Phase 4 — Task Management

- Create task schema
- Implement task CRUD
- Add status and priority
- Add assignment
- Add due dates
- Add subtasks
- Add comments
- Add activity history

### Phase 5 — Kanban and Core UX

- Build Kanban board
- Add drag-and-drop
- Persist task position
- Add filters
- Add search
- Add loading and error states
- Add responsive behavior

### Phase 6 — Quality and Portfolio Enhancements

- Add automated tests
- Add API documentation
- Add basic analytics
- Add labels
- Add sprints
- Improve audit logs
- Add pagination
- Review security

### Phase 7 — Deployment and Documentation

- Deploy frontend
- Deploy backend
- Configure production database
- Configure CI/CD
- Write README
- Add architecture diagram
- Add screenshots
- Record a short project demonstration
- Document important technical decisions

---

## 20. Definition of Done

A feature is considered complete when:

- The feature meets its acceptance criteria.
- Input validation is implemented.
- Authorization rules are enforced.
- Tenant isolation is verified.
- Error cases are handled.
- Tests are added or updated.
- The code passes linting.
- The code passes type checking.
- The application builds successfully.
- API documentation is updated where necessary.
- The feature is tested locally.
- The feature is committed using a meaningful commit message.
- The related issue or task is updated.

---

## 21. Portfolio and CV Evidence

Only mention features that are actually implemented, tested, and deployable.

### Possible CV Bullet Examples

Use only the bullets that accurately describe the finished project:

- Built a multi-tenant project management SaaS using Next.js, TypeScript, Express.js, PostgreSQL, and Prisma.
- Designed organization-scoped data models with role-based access control and tenant-isolation safeguards.
- Developed REST APIs for organizations, teams, projects, tasks, comments, and activity tracking.
- Implemented a Kanban board with task status updates, ordering, filtering, and assignment.
- Added automated authorization and cross-tenant access tests to improve application security.
- Deployed the full-stack application with managed PostgreSQL and documented the architecture and API workflow.
- Implemented reusable form components, server-side validation, consistent error handling, and responsive UI patterns.

### Portfolio Documentation Should Include

- Project overview
- Main features
- Technology stack
- Architecture diagram
- Database ER diagram
- API documentation
- Authentication strategy
- Authorization strategy
- Tenant-isolation strategy
- Testing approach
- Deployment links
- Screenshots
- Known limitations
- Future improvements

---

## 22. Final Implementation Checklist

### Architecture

- [ ] Frontend framework selected
- [ ] Backend framework selected
- [ ] Repository structure created
- [ ] Environment configuration prepared
- [ ] Database connection configured
- [ ] CI pipeline configured

### Authentication and Security

- [ ] Registration implemented
- [ ] Login implemented
- [ ] Logout implemented
- [ ] Passwords securely hashed
- [ ] Protected routes implemented
- [ ] Authorization rules implemented
- [ ] Tenant isolation tested
- [ ] Rate limiting configured
- [ ] Secrets excluded from Git

### Organization and Collaboration

- [ ] Organization creation implemented
- [ ] Organization membership implemented
- [ ] Role management implemented
- [ ] Team management implemented
- [ ] Project management implemented
- [ ] Project membership implemented

### Task Workflow

- [ ] Task CRUD implemented
- [ ] Task assignment implemented
- [ ] Status implemented
- [ ] Priority implemented
- [ ] Due dates implemented
- [ ] Subtasks implemented
- [ ] Comments implemented
- [ ] Activity history implemented
- [ ] Kanban board implemented
- [ ] Filters implemented

### Quality

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Authorization tests written
- [ ] Error handling completed
- [ ] API documentation written
- [ ] README completed
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Production build passes

### Deployment

- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Production database configured
- [ ] Environment variables configured
- [ ] Health endpoint added
- [ ] CI/CD verified
- [ ] Live application tested

---

## 23. Recommended Starting Point

Before writing the complete Prisma schema, finalize these decisions:

1. Frontend framework: Next.js App Router or separate React frontend.
2. Authentication method: JWT or secure session-based authentication.
3. Organization role model and permission rules.
4. MVP entities and relationships.
5. Task status and priority enums.
6. API response and error format.
7. Deployment providers.
8. Testing tools.
9. GitHub branching and pull request workflow.

The recommended implementation order is:

```text
Architecture
→ Authentication
→ Organizations
→ Teams
→ Projects
→ Tasks
→ Kanban
→ Comments and Activity
→ Tests
→ Documentation
→ Deployment
```
