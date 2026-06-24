export type TemplateCategoryId =
  | "meetings"
  | "engineering"
  | "planning"
  | "personal";

export type NoteTemplate = {
  id: string;
  title: string;
  description: string;
  category: TemplateCategoryId;
  previewFilename: string;
  preview: string;
  tags: readonly string[];
};

export type TemplateCategory = {
  id: TemplateCategoryId;
  label: string;
  headline: string;
  description: string;
};

export const TEMPLATE_CATEGORIES: readonly TemplateCategory[] = [
  {
    id: "meetings",
    label: "Meetings & collaboration",
    headline: "Run better meetings",
    description:
      "Structured notes for syncs, standups, retros, and 1-on-1s — so decisions and action items never get lost.",
  },
  {
    id: "engineering",
    label: "Engineering & code",
    headline: "Ship with clarity",
    description:
      "Templates developers actually use — PRs, RFCs, ADRs, bug reports, and postmortems with the right sections baked in.",
  },
  {
    id: "planning",
    label: "Planning & product",
    headline: "Align before you build",
    description:
      "Briefs, specs, user stories, and roadmaps that keep scope, stakeholders, and success metrics in one place.",
  },
  {
    id: "personal",
    label: "Personal & learning",
    headline: "Grow and reflect",
    description:
      "Journals, reviews, reading lists, and research docs for staying organized outside the sprint cycle.",
  },
] as const;

export const NOTE_TEMPLATES: readonly NoteTemplate[] = [
  // Meetings & collaboration
  {
    id: "meeting-notes",
    title: "Meeting notes",
    description: "Agenda, discussion notes, decisions, and follow-up tasks in one doc.",
    category: "meetings",
    previewFilename: "meeting-notes.md",
    tags: ["sync", "actions"],
    preview: `# Meeting notes

**Date:**
**Attendees:**
**Facilitator:**

## Agenda
1.
2.

## Discussion
-

## Decisions
-

## Action items
- [ ] **Owner** — task (due: )
`,
  },
  {
    id: "daily-standup",
    title: "Daily standup",
    description: "Yesterday, today, and blockers — quick async updates for the team.",
    category: "meetings",
    previewFilename: "standup.md",
    tags: ["async", "daily"],
    preview: `# Standup — <date>

**Team:**

## Yesterday
-

## Today
-

## Blockers
- None

## Notes for the team
`,
  },
  {
    id: "retrospective",
    title: "Sprint retrospective",
    description: "What went well, what did not, and concrete improvements for next sprint.",
    category: "meetings",
    previewFilename: "retro.md",
    tags: ["sprint", "team"],
    preview: `# Retrospective — Sprint <N>

**Date:**
**Participants:**

## What went well 🎉
-

## What did not go well
-

## What we learned
-

## Action items
- [ ]
`,
  },
  {
    id: "one-on-one",
    title: "1-on-1 notes",
    description: "Talking points, feedback, and growth goals for manager or peer check-ins.",
    category: "meetings",
    previewFilename: "1-on-1.md",
    tags: ["manager", "career"],
    preview: `# 1-on-1 — <name>

**Date:**
**Next meeting:**

## Their updates
-

## My talking points
-

## Feedback shared
-

## Action items
- [ ]

## Growth / goals
`,
  },
  {
    id: "sprint-planning",
    title: "Sprint planning",
    description: "Capacity, sprint goal, committed stories, and risks before kickoff.",
    category: "meetings",
    previewFilename: "sprint-planning.md",
    tags: ["agile", "planning"],
    preview: `# Sprint planning — Sprint <N>

**Dates:**
**Sprint goal:**

## Capacity
| Member | Available days | Notes |
|--------|----------------|-------|
|        |                |       |

## Committed work
- [ ] **Story** — estimate: 

## Stretch / nice-to-have
-

## Risks & dependencies
-
`,
  },

  // Engineering & code
  {
    id: "pull-request",
    title: "Pull request",
    description: "Summary, changes, testing evidence, and a reviewer checklist.",
    category: "engineering",
    previewFilename: "pull-request.md",
    tags: ["git", "review"],
    preview: `# PR: <title>

## Summary
What does this change and why?

## Changes
-

## Testing
- [ ] Unit tests
- [ ] Manual QA

## Checklist
- [ ] No breaking changes
- [ ] Docs updated

## Related
Closes #
`,
  },
  {
    id: "rfc-design-doc",
    title: "RFC / design doc",
    description: "Context, goals, proposed design, alternatives, and open questions.",
    category: "engineering",
    previewFilename: "rfc.md",
    tags: ["architecture", "design"],
    preview: `# RFC: <title>

**Status:** Draft
**Author:**
**Reviewers:**

## Context
Why are we doing this?

## Goals
-

## Non-goals
-

## Proposed design

## Alternatives considered
-

## Open questions
-
`,
  },
  {
    id: "adr",
    title: "Architecture decision",
    description: "Record one decision, its trade-offs, and consequences for the team.",
    category: "engineering",
    previewFilename: "adr-001.md",
    tags: ["ADR", "decisions"],
    preview: `# ADR 001: <decision title>

**Status:** Proposed
**Date:**

## Context

## Decision

## Consequences

### Positive
-

### Negative
-
`,
  },
  {
    id: "bug-report",
    title: "Bug report",
    description: "Repro steps, expected vs. actual behavior, environment, and logs.",
    category: "engineering",
    previewFilename: "bug-report.md",
    tags: ["debug", "QA"],
    preview: `# Bug: <short title>

**Severity:**
**Reporter:**

## Steps to reproduce
1.
2.

## Expected

## Actual

## Environment
- OS:
- Browser / version:
- App version:

## Logs / screenshots
\`\`\`
<stack trace or logs>
\`\`\`
`,
  },
  {
    id: "postmortem",
    title: "Incident postmortem",
    description: "Blameless timeline, root cause, resolution, and follow-up actions.",
    category: "engineering",
    previewFilename: "postmortem.md",
    tags: ["incident", "SRE"],
    preview: `# Postmortem: <incident>

**Date:**
**Severity:**
**Duration:**
**Owner:**

## Impact

## Timeline
- \`00:00\` — 

## Root cause

## Resolution

## Action items
- [ ]

## Lessons learned
`,
  },
  {
    id: "api-spec",
    title: "API specification",
    description: "Endpoints, request/response shapes, auth, and error handling.",
    category: "engineering",
    previewFilename: "api-spec.md",
    tags: ["REST", "backend"],
    preview: `# API: <service name>

**Version:**
**Base URL:**

## Authentication

## Endpoints

### \`GET /resource\`
**Description:**

**Response \`200\`:**
\`\`\`json
{}
\`\`\`

## Error codes
| Code | Meaning |
|------|---------|
| 400  |         |

## Open questions
-
`,
  },
  {
    id: "code-review",
    title: "Code review checklist",
    description: "Structured review notes for correctness, security, and maintainability.",
    category: "engineering",
    previewFilename: "code-review.md",
    tags: ["review", "quality"],
    preview: `# Code review: <PR / branch>

**Reviewer:**
**Author:**

## Summary of change

## Correctness
- [ ] Logic matches requirements
- [ ] Edge cases handled

## Security
- [ ] Input validated
- [ ] No secrets in code

## Maintainability
- [ ] Readable naming
- [ ] Tests added or updated

## Comments
-
`,
  },

  // Planning & product
  {
    id: "project-brief",
    title: "Project brief",
    description: "Goals, scope, stakeholders, timeline, and success metrics.",
    category: "planning",
    previewFilename: "project-brief.md",
    tags: ["kickoff", "scope"],
    preview: `# Project brief: <name>

**Owner:**
**Target date:**

## Problem statement

## Goal

## Scope

### In scope
-

### Out of scope
-

## Stakeholders

## Success metrics
-

## Timeline
| Milestone | Date |
|-----------|------|
|           |      |
`,
  },
  {
    id: "product-spec",
    title: "Product spec",
    description: "User problem, requirements, UX notes, and acceptance criteria.",
    category: "planning",
    previewFilename: "product-spec.md",
    tags: ["PM", "requirements"],
    preview: `# Spec: <feature name>

**Author:**
**Status:** Draft

## Problem
What user pain are we solving?

## Proposed solution

## User stories
- As a **user**, I want **…** so that **…**

## Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| R1 |             | P0       |

## Acceptance criteria
- [ ]

## Out of scope
-
`,
  },
  {
    id: "user-story",
    title: "User story",
    description: "Single story with context, acceptance criteria, and technical notes.",
    category: "planning",
    previewFilename: "user-story.md",
    tags: ["agile", "backlog"],
    preview: `# Story: <title>

**Epic:**
**Priority:**
**Estimate:**

## Story
As a **<role>**, I want **<goal>** so that **<benefit>**.

## Acceptance criteria
- [ ] Given … when … then …
- [ ] 

## Design / UX notes

## Technical notes

## Dependencies
-
`,
  },
  {
    id: "quarterly-okrs",
    title: "Quarterly OKRs",
    description: "Objectives and measurable key results for the quarter.",
    category: "planning",
    previewFilename: "okrs-q1.md",
    tags: ["goals", "metrics"],
    preview: `# OKRs — Q<quarter> <year>

## Objective 1: <headline>

| Key result | Target | Current | Status |
|------------|--------|---------|--------|
| KR 1       |        |         | 🟡     |
| KR 2       |        |         | ⚪     |

## Objective 2: <headline>

| Key result | Target | Current | Status |
|------------|--------|---------|--------|
| KR 1       |        |         | ⚪     |

## Notes & blockers
`,
  },
  {
    id: "feature-roadmap",
    title: "Feature roadmap",
    description: "Now, next, and later buckets with themes and dependencies.",
    category: "planning",
    previewFilename: "roadmap.md",
    tags: ["roadmap", "priorities"],
    preview: `# Roadmap — <product / team>

**Last updated:**

## Now (this sprint / month)
-

## Next (upcoming)
-

## Later (backlog / ideas)
-

## Themes
-

## Dependencies & risks
-
`,
  },

  // Personal & learning
  {
    id: "daily-journal",
    title: "Daily journal",
    description: "Morning intentions, evening reflections, and gratitude.",
    category: "personal",
    previewFilename: "journal.md",
    tags: ["habits", "reflection"],
    preview: `# Journal — <date>

## Morning
**Intention for today:**

## Highlights
-

## Challenges
-

## Evening reflection
What went well? What would I do differently?

## Gratitude
-
`,
  },
  {
    id: "weekly-review",
    title: "Weekly review",
    description: "Wins, blockers, lessons, and priorities for the week ahead.",
    category: "personal",
    previewFilename: "weekly-review.md",
    tags: ["review", "planning"],
    preview: `# Weekly review — Week of <date>

## Wins 🎉
-

## Challenges
-

## Lessons learned
-

## Next week priorities
- [ ]

## Open loops
-
`,
  },
  {
    id: "reading-list",
    title: "Reading list",
    description: "Queue articles and books with key takeaways when finished.",
    category: "personal",
    previewFilename: "reading-list.md",
    tags: ["books", "articles"],
    preview: `# Reading list

## To read
- [ ] **Title** — author / link

## In progress
- **Title** — notes so far

## Finished
- **Title** — key takeaway:

## Want to revisit
-
`,
  },
  {
    id: "research",
    title: "Research doc",
    description: "Hypothesis, sources, findings, and open questions.",
    category: "personal",
    previewFilename: "research.md",
    tags: ["study", "notes"],
    preview: `# Research: <topic>

**Started:**
**Status:**

## Hypothesis / question

## Sources
1. 

## Findings
-

## Open questions
-

## Next steps
- [ ]
`,
  },
  {
    id: "interview-prep",
    title: "Interview prep",
    description: "Company research, STAR stories, questions to ask, and follow-ups.",
    category: "personal",
    previewFilename: "interview-prep.md",
    tags: ["career", "jobs"],
    preview: `# Interview prep — <company / role>

**Date:**
**Format:**

## About the company
-

## Role requirements
-

## My STAR stories
### Story 1: <theme>
- **Situation:**
- **Task:**
- **Action:**
- **Result:**

## Questions to ask them
-

## Follow-up after interview
- [ ]
`,
  },
] as const;

export function getTemplatesByCategory(
  categoryId: TemplateCategoryId,
): readonly NoteTemplate[] {
  return NOTE_TEMPLATES.filter((template) => template.category === categoryId);
}
