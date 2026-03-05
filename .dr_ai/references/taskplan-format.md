# TaskPlan Document Format Specification

Complete format specification for __TaskPlan.md documents.

## Document Template

```markdown
Task Name: [slug-task-name]
Date: [timestamp]
Git Branch: [feat|fix|doc|core/slug-task-name]
Feature Plan Reference: [Optional: Based on Feature Plan: {feature-plan-path}]

## Task Objectives
[Single comprehensive paragraph describing what needs to be achieved,
what problem this solves, and what value it delivers. Focus on the "why"
rather than the "how".]

## Implementation Summary
[Technical summary of how implementation will be done: architecture approach,
technologies to be used, integration points, data flow, and overall technical
strategy. Include framework versions, libraries, and architectural patterns.]

## UX/UI Details
[Interface details, user flows, interactions, visual states, responsive behavior,
accessibility considerations, and user experience requirements. Include wireframe
references if applicable. Describe loading states, error states, empty states,
and success states.]

## Tasks
### Task 1: [Task Name]
**Recommended Agent**: [react-architect | nodejs-specialist |
supabase-edge-functions | tailwind-specialist | python-specialist |
openai-responses-specialist | other relevant agent]

**Files to create/change**: [Specify using patterns below]
- component: path/ComponentName.tsx
- page: path/PageName.tsx
- lib: path/libraryName.ts
- endpoint: METHOD /api/path
- db table: table_name
- service: path/ServiceName.ts
- hook: path/useHookName.ts
- util: path/utilName.ts
- type: path/types.ts

**Implementation**: [Detailed technical instructions including:
- Specific technical requirements
- Implementation approach and patterns
- Data structures and interfaces
- API contracts and request/response formats
- State management strategy
- Error handling requirements
- Integration considerations
- Dependencies and imports
- Configuration requirements
- Security considerations]

**Subtasks**:
- **Subtask 1.1**: [Detailed implementation description with specific technical steps,
  dependencies, configuration details, and integration points. Include what needs to be
  created/modified, how it connects with other components, and any important technical
  considerations for this specific subtask.]
  - **Agent**: [Specific agent for this subtask if different from main task]
- **Subtask 1.2**: [Detailed implementation description with specific technical steps,
  dependencies, configuration details, and integration points. Include what needs to be
  created/modified, how it connects with other components, and any important technical
  considerations for this specific subtask.]
  - **Agent**: [Specific agent for this subtask if different from main task]
- **Subtask 1.3**: [Detailed implementation description with specific technical steps,
  dependencies, configuration details, and integration points. Include what needs to be
  created/modified, how it connects with other components, and any important technical
  considerations for this specific subtask.]
  - **Agent**: [Specific agent for this subtask if different from main task]

**Coding Standards**: [Standards applicable to this specific task with references:
- Pattern reference (e.g., "Follow existing auth pattern in src/lib/auth.ts")
- Style guide section (e.g., "React component naming from .claude/style-guides/react.md")
- Framework conventions (e.g., "Next.js API routes convention")
- Error handling patterns
- Testing requirements]

### Task 2: [Task Name]
**Recommended Agent**: [Specify different agent to diversify expertise]

[Repeat same structure as Task 1]

### Task 3: [Task Name]
**Recommended Agent**: [Specify different agent to diversify expertise]

[Repeat same structure as Task 1]
```

## Format Rules

### Metadata Section

**Task Name**:
- Use slug format: lowercase with hyphens
- Example: `user-authentication-system`
- Must match directory name

**Date**:
- Format: DD/MM/YYYY HH:mm:ss
- Use local timezone
- Example: `01/11/2025 18:41:23`

**Git Branch**:
- Pattern: `[type]/[slug-task-name]`
- Types: feat, fix, doc, core
- Example: `feat/user-authentication-system`

**Feature Plan Reference** (Optional):
- Include when task derives from feature plan
- Format: `Based on Feature Plan: {path-to-feature-plan}`
- Example: `Based on Feature Plan: .dr_ai/features/auth-system/__FeaturePlan.md`

### Task Objectives

- 1-2 comprehensive paragraph (3-5 sentences)
- Answer: What? Why? Value?
- Focus on business value and problem solving
- Avoid implementation details
- Example length: 100-180 words

### Implementation Summary

- Technical overview (3-5 paragraphs)
- Include:
  - Architecture approach and patterns
  - Technologies and framework versions
  - Integration points with existing systems
  - Data flow and state management
  - Security considerations
- Example length: 150-400 words

### UX/UI Details

Required for user-facing features:
- User flows and navigation paths
- Interface states (loading, error, success, empty)
- Responsive behavior breakpoints
- Accessibility requirements (WCAG level, screen readers)
- Visual design specifications
- Animation and transition requirements
- Error handling UX
- Example length: 200-400 words

Optional for backend-only tasks.

### Task Structure

Each task MUST include subsections:

1. **Recommended Agent**: Single agent name from DR_AI catalog
2. **Files to create/change**: Specific paths using standard patterns
3. **Implementation**: Comprehensive technical instructions (300-600 words)
4. **Subtasks**: Hierarchical breakdown with agent recommendations
5. **Coding Standards**: Specific standards with codebase references

### Agent Assignment Rules

1. **Main task agent**: Select based on primary responsibility
2. **Subtask agents**: Can differ when expertise varies
3. **Diversification**: Use different agents across tasks when possible
4. **Specialization**: Match agent to specific technology/framework

Available agent categories:
- Frontend: react-architect, react-forms-specialist, react-hooks-specialist
- Backend: nodejs-specialist, python-specialist, supabase-edge-functions
- Styling: tailwind-specialist, shadcn-ui-specialist, sass-specialist
- Data: sql-query-specialist, react-datatable-specialist
- Integration: openai-responses-specialist, oauth-specialist, supabase-auth
- Testing: testing-specialist, playwright-specialist, e2e-specialist

### Files Specification Patterns

Use type prefix + path format:

```markdown
**Files to create/change**:
- component: src/components/auth/LoginForm.tsx
- component: src/components/auth/RegisterForm.tsx
- page: src/pages/LoginPage.tsx
- lib: src/lib/supabase.ts
- lib: src/lib/validation/auth-schemas.ts
- endpoint: POST /api/v1/auth/login
- endpoint: GET /api/v1/user/profile
- db table: users
- db table: user_sessions
- service: src/services/AuthService.ts
- hook: src/hooks/useAuth.ts
- hook: src/hooks/useUser.ts
- util: src/utils/token.ts
- type: src/types/auth.ts
```

### Implementation Section Requirements

Must include:
- Specific dependencies with versions
- Data structures and TypeScript interfaces
- API contracts (request/response formats)
- State management approach
- Error handling strategy
- Integration points with existing code
- Configuration requirements
- Security considerations
- Performance requirements

Example structure:
```markdown
**Implementation**:
Install dependencies: @supabase/supabase-js ^2.39.0, react-hook-form ^7.48.0,
zod ^3.22.0. Create TypeScript interfaces in src/types/auth.ts for AuthState
(user, session, loading, error), User (id, email, metadata), and AuthContextType.
Configure Supabase client in src/lib/supabase.ts with environment variables
(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Implement AuthContext provider
using React.createContext with auth state management. Use useEffect to subscribe
to onAuthStateChange events for real-time session updates. Configure persistence
mode 'local' and automatic token refresh. Implement error boundaries with retry
functionality. Create custom hooks (useAuth, useUser, useSession) with proper
null checks.
```

### Subtask Requirements

**Format and Structure**:
- Use hierarchical numbering (1.1, 1.2, 1.3)
- 2-10 subtasks per main task
- Specify agent when different from main task
- Focus on logical component breakdown

**Description Detail Level** (50-150 words per subtask):
Subtasks must include comprehensive implementation details:

1. **What to create/modify**: Specific files, components, functions, or configurations
2. **Technical approach**: How to implement (patterns, libraries, methods)
3. **Dependencies**: Required packages, services, or other subtask completions
4. **Integration points**: How this connects with other components or systems
5. **Configuration details**: Environment variables, settings, or initialization
6. **Key considerations**: Important technical decisions, error handling, or edge cases

**Good Example**:
```markdown
- **Subtask 1.1**: Install Supabase client library (@supabase/supabase-js ^2.39.0)
  and configure environment variables in .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
  Create singleton client instance in src/lib/supabase.ts using createClient() with
  auth persistence set to 'local' for session storage. Configure automatic token refresh
  with detectSessionInUrl enabled for OAuth callbacks. Export typed client for use across
  the application. This establishes the foundation for all authentication operations.
  - **Agent**: supabase-auth
```

**Bad Example** (too brief):
```markdown
- **Subtask 1.1**: Install and configure Supabase
  - **Agent**: supabase-auth
```

**Content Requirements**:
- Include specific package names with versions
- Mention exact file paths and function names
- Describe configuration parameters and values
- Explain integration with other subtasks
- Highlight critical technical decisions
- Reference patterns or conventions to follow

### Coding Standards Section

Reference specific patterns:
```markdown
**Coding Standards**:
- Follow React Context pattern from src/contexts/ThemeContext.tsx
- Use functional components with hooks (no class components)
- TypeScript: Enable strict mode, define all types explicitly
- Error handling: Wrap async operations in try-catch, log to console.error
- File organization: One export per file for hooks, types in separate files
- Testing: Write unit tests for all hooks, integration tests for context
```

## Quality Checklist

Before finalizing TaskPlan, verify:

- [ ] Task name uses slug format
- [ ] Git branch follows pattern
- [ ] Task objectives explain "why" (not just "what")
- [ ] Implementation summary includes architecture and technologies
- [ ] UX/UI details present for user-facing features
- [ ] All tasks have all required subsections
- [ ] Agent assignments diversified across tasks
- [ ] File paths use correct type prefixes
- [ ] Implementation sections include all required elements
- [ ] Subtasks have agent recommendations when expertise differs
- [ ] Coding standards reference actual codebase patterns
- [ ] Technical specifications are complete and actionable
