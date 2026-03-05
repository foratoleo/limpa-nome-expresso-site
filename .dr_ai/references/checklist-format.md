# TaskChecklist Document Format Specification

Format specification for TaskChecklist documents.

**Official format: `__TaskChecklist.json`** - The JSON format is the primary and only format used for checklist tracking. The Markdown template below serves as a reference for the structure and rules that apply to the JSON format.

## Purpose

The TaskChecklist serves as a pure progress tracking tool for development tasks. It provides:
- Hierarchical task structure with unique IDs
- Agent recommendations for task execution
- Status tracking (pending, in_progress, completed, canceled)
- References to detailed TaskPlan specifications

## Document Template

```markdown
# [TASK_NAME] Checklist

- [ ] T0: Create branch [branch-name]

- [ ] T1: [Brief task description] → See TaskPlan §2.1
  - [ ] T1.1: [Brief subtask description]
  - [ ] T1.2: [Brief subtask description]
  - [ ] T1.3: [Brief subtask description]
  Agent: [agent-name]

- [ ] T2: [Brief task description] → See TaskPlan §2.2
  - [ ] T2.1: [Brief subtask description]
  - [ ] T2.2: [Brief subtask description]
  - [ ] T2.3: [Brief subtask description]
  Agent: [agent-name]

- [ ] T3: [Brief task description]
  - [ ] T3.1: [Brief subtask description]
  - [ ] T3.2: [Brief subtask description]
  Agent: [agent-name]
```

## Format Rules

### Mandatory First Task (T0)

ALWAYS start with T0 for git branch creation:
```markdown
- [ ] T0: Create branch feat/task-name
```

Rules:
- Must be first item in checklist
- Uses exact branch name from TaskPlan metadata
- Format: `Create branch [type/slug-name]`
- Types: feat, fix, doc, core

### Hierarchical ID System

Use consistent hierarchical numbering:

**Main tasks**: T0, T1, T2, T3, T4...
**Subtasks**: T1.1, T1.2, T1.3, T2.1, T2.2, T2.3...
**No deeper nesting**: Maximum two levels

Example structure:
```markdown
- [ ] T0: Create branch
- [ ] T1: Main task one
  - [ ] T1.1: Subtask
  - [ ] T1.2: Subtask
  - [ ] T1.3: Subtask
- [ ] T2: Main task two
  - [ ] T2.1: Subtask
  - [ ] T2.2: Subtask
- [ ] T3: Main task three
  - [ ] T3.1: Subtask
```

### Task Description Rules

**Length**: Maximum 10 words per task
**Style**: Action-oriented, imperative form
**Content**: Brief instruction only

Good examples:
```markdown
- [ ] T1: Setup auth provider and context
- [ ] T1.1: Install Supabase dependencies
- [ ] T1.2: Configure environment variables
- [ ] T1.3: Create auth context provider
```

Bad examples (too verbose):
```markdown
- [ ] T1: Setup the authentication provider and context for the application
- [ ] T1.1: Install the Supabase JS client library and other dependencies
```

### Action Verbs

Use consistent action verbs:
- **Create**: New files, components, features
- **Implement**: Logic, functionality, algorithms
- **Configure**: Settings, environment, tools
- **Setup**: Infrastructure, services, connections
- **Build**: UI components, interfaces
- **Add**: Features, capabilities, enhancements
- **Integrate**: Third-party services, APIs
- **Update**: Existing code, dependencies
- **Refactor**: Code structure, patterns

### Agent Recommendations

Format:
```markdown
- [ ] T1: Main task description
  - [ ] T1.1: Subtask
  - [ ] T1.2: Subtask
  Agent: react-architect
```

Rules:
- Place after all subtasks for main task
- Use format: `Agent: [agent-name]`
- Two-space indentation aligned with subtasks
- One agent per main task group
- Agent name from DR_AI catalog

### TaskPlan References

Use when detailed specifications needed:
```markdown
- [ ] T1: Setup component structure → See TaskPlan §2.1
```

Format:
- Arrow notation: `→ See TaskPlan §X.Y`
- Section numbers match TaskPlan task numbers
- Optional, use only when technical details required
- Place at end of main task description

### Indentation

**Main tasks (T0, T1, T2...)**: No indentation
**Subtasks (T1.1, T1.2...)**: Two-space indentation
**Agent line**: Two-space indentation (aligned with subtasks)

```markdown
- [ ] T1: Main task
  - [ ] T1.1: Subtask
  - [ ] T1.2: Subtask
  Agent: agent-name
```

## Content Restrictions

### NEVER Include

- Explanations or technical details
- Notes & Considerations sections
- Completion Criteria sections
- Deployment steps
- Testing tasks (use ValidationTasks.md)
- Documentation tasks (use ValidationTasks.md)
- Emojis or decorative elements
- Comments or annotations
- Multiple paragraphs
- Code snippets
- Long descriptions

### ONLY Include

- Task IDs (T0, T1, T1.1...)
- Checkboxes `- [ ]`
- Brief task descriptions (max 10 words)
- Agent recommendations
- TaskPlan references (when needed)

## Task Scope

### INCLUDE (Implementation Tasks)

- Component creation
- API endpoint implementation
- Database schema creation
- Service implementation
- Hook development
- Utility function creation
- Configuration setup
- Integration work
- State management setup

### EXCLUDE (Validation Tasks)

Move to __ValidationTasks.md:
- Unit tests
- Integration tests
- E2E tests
- Documentation updates
- README updates
- API documentation
- Deployment tasks
- Quality assurance
- Code review requirements

## Example Checklists

### Authentication System

```markdown
# user-authentication-system Checklist

- [ ] T0: Create branch feat/user-authentication-system

- [ ] T1: Setup authentication provider → See TaskPlan §2.1
  - [ ] T1.1: Install Supabase dependencies
  - [ ] T1.2: Configure environment variables
  - [ ] T1.3: Create auth context
  - [ ] T1.4: Implement custom hooks
  Agent: react-architect

- [ ] T2: Build authentication forms → See TaskPlan §2.2
  - [ ] T2.1: Create zod schemas
  - [ ] T2.2: Build login form
  - [ ] T2.3: Build register form
  - [ ] T2.4: Create password reset
  - [ ] T2.5: Integrate Supabase auth
  Agent: react-forms-specialist

- [ ] T3: Implement protected routes
  - [ ] T3.1: Create route guard component
  - [ ] T3.2: Add auth state listener
  - [ ] T3.3: Setup redirect logic
  - [ ] T3.4: Integrate with router
  Agent: react-router-specialist
```

### API Integration

```markdown
# openai-api-integration Checklist

- [ ] T0: Create branch feat/openai-api-integration

- [ ] T1: Setup OpenAI client → See TaskPlan §2.1
  - [ ] T1.1: Install OpenAI SDK
  - [ ] T1.2: Configure API keys
  - [ ] T1.3: Create client singleton
  Agent: openai-responses-specialist

- [ ] T2: Implement chat endpoint
  - [ ] T2.1: Create API route
  - [ ] T2.2: Add streaming support
  - [ ] T2.3: Implement error handling
  Agent: nodejs-implementation

- [ ] T3: Build chat interface
  - [ ] T3.1: Create chat component
  - [ ] T3.2: Add message list
  - [ ] T3.3: Implement input form
  Agent: react-chat-specialist
```

## Quality Checklist

Before finalizing TaskChecklist, verify:

- [ ] T0 is first task for branch creation
- [ ] All main tasks use T-prefix (T1, T2, T3...)
- [ ] All subtasks use hierarchical IDs (T1.1, T1.2...)
- [ ] Task descriptions are max 10 words
- [ ] Action verbs used consistently
- [ ] Agent recommendations present for all main tasks
- [ ] **Agents are specific, not generic** (use react-forms-specialist not react-architect for forms)
- [ ] Agent names from DR_AI catalog
- [ ] Two-space indentation for subtasks
- [ ] TaskPlan references use arrow notation
- [ ] NO testing tasks present
- [ ] NO documentation tasks present
- [ ] NO explanations or technical details
- [ ] NO emojis or decorative elements

## Common Mistakes

**Mistake**: Starting without T0
```markdown
❌ - [ ] T1: Setup authentication
```
```markdown
✓ - [ ] T0: Create branch feat/auth-system
  - [ ] T1: Setup authentication
```

**Mistake**: Verbose descriptions
```markdown
❌ - [ ] T1: Setup the complete authentication provider with context
```
```markdown
✓ - [ ] T1: Setup auth provider and context
```

**Mistake**: Including test tasks
```markdown
❌ - [ ] T4: Write unit tests for components
```
```markdown
✓ Move to __ValidationTasks.md:
  - [ ] V1: Unit tests for auth components
```

**Mistake**: Missing agent recommendations
```markdown
❌ - [ ] T1: Setup auth provider
  - [ ] T1.1: Install dependencies
  - [ ] T1.2: Create context
```
```markdown
✓ - [ ] T1: Setup auth provider
  - [ ] T1.1: Install dependencies
  - [ ] T1.2: Create context
  Agent: react-architect
```

**Mistake**: Wrong indentation
```markdown
❌ - [ ] T1: Main task
- [ ] T1.1: Subtask
Agent: agent
```
```markdown
✓ - [ ] T1: Main task
  - [ ] T1.1: Subtask
  Agent: agent
```
