<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (MINOR — material new constraint added to Frontend Tech Stack)
Modified principles:
  - IV. Frontend Tech Stack: added explicit state management mandate (Jotai MUST be used;
    Zustand and other global state libraries are not permitted)
Added sections: none
Removed sections: none
Templates updated:
  ✅ .specify/memory/constitution.md (this file)
  ✅ .specify/templates/plan-template.md (Constitution Check — Frontend Stack gate updated)
  ⚠  .specify/templates/spec-template.md — no structural changes required
  ⚠  .specify/templates/tasks-template.md — no structural changes required
  ⚠  CLAUDE.md — auto-generated; will be refreshed on next /speckit.plan run
Deferred TODOs: none
-->

# Smart Basket Constitution

## Core Principles

### I. Hexagonal Architecture (NON-NEGOTIABLE)

Both the frontend and backend MUST follow Hexagonal Architecture strictly, with no exceptions.
Every feature MUST be separated into three explicit layers: **domain**, **application**, and
**infrastructure**. Both frontend and backend MUST include use cases for every operation, even
when a use case does nothing more than delegate to a port implementation. The full architectural
structure MUST be present at all times, even at the cost of boilerplate. Shortcuts that collapse
layers or bypass the port/adapter pattern are not permitted.

- Domain layer: entities, value objects, domain events — no framework or infrastructure dependencies
- Application layer: use cases, port interfaces — orchestrates domain, calls ports only
- Infrastructure layer: port implementations, ORM models, HTTP adapters, external service clients
- No cross-layer imports in the wrong direction (infrastructure MUST NOT be imported by domain)

### II. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory with no exceptions. The enforced cycle is:
**Write test → Confirm test fails → Implement → Confirm test passes → Refactor.**

- Unit tests MUST mock ALL external dependencies. A test that touches a real database,
  filesystem, or network is not a unit test and MUST be reclassified or rewritten.
- All tests MUST follow the **AAA pattern** (Arrange / Act / Assert) with no exceptions.
- Test descriptions MUST follow **Given / When / Then** format.
- Libraries may be used in tests but MUST be approved before adoption. A library MUST NOT
  be introduced if the required functionality is simple enough to implement inline without
  materially raising complexity.

### III. Error Handling & Observability

All API errors MUST conform to the following response contracts. No custom error shapes
are permitted outside these definitions.

**Standard error:**
```json
{
  "statusCode": "<HttpStatus>",
  "errorCode": "<string>",
  "message": "<string>"
}
```

**Validation error** (extends standard error):
```json
{
  "statusCode": "<HttpStatus>",
  "errorCode": "ValidationError",
  "message": "<string>",
  "details": {
    "issues": [
      {
        "field": "<string>",
        "rules": [
          {
            "rule": "<string>",
            "message": "<string>",
            "params": { "<key>": "<value>" }
          }
        ]
      }
    ]
  }
}
```

All errors MUST be logged. Sensitive data (passwords, tokens, PII) MUST be redacted
before logging. Silent failures are not permitted — every caught error MUST produce a
log entry with sufficient context to diagnose the root cause.

### IV. Frontend Tech Stack

The frontend MUST be a Progressive Web App (PWA) built with **React** and **TypeScript**.

- **UI library**: MUI (Material UI) with styled-components for all visual components.
- **Styling rule**: Components with more than 3 style properties MUST externalize styles
  to a dedicated `[ComponentName].styles.ts` file. Fewer than 3 properties may be inline.
- **State management**: **Jotai** MUST be used for all frontend global and shared state.
  Zustand, Redux, MobX, and other global state libraries are not permitted. Local component
  state (`useState`) remains acceptable for purely local, non-shared state.
- **Date handling**: All date formatting and timezone operations MUST use `date-fns`.
  Raw `Date` manipulation without `date-fns` is not permitted.
- **Testing**: All non-style components MUST be tested using React Testing Library.
  Components that are purely styled wrappers (no logic, no behaviour) MUST NOT be tested.
- **Mock-first**: When a backend endpoint does not yet exist, a realistic API mock MUST
  be created so frontend features can be fully developed and tested in isolation.
- **Linting**: ESLint rules for `react` and `react-hooks` are mandatory on all frontend code.
- **Accessibility & UX**: All components MUST comply with WCAG 2.1 AA. Semantic HTML,
  ARIA attributes, and keyboard navigation MUST be implemented as first-class concerns,
  not retrofitted.

### V. Backend Tech Stack

The backend MUST be implemented using **Fastify** and **TypeScript**.

- All API responses MUST return JSON unless an endpoint explicitly specifies otherwise
  with documented justification.
- All APIs MUST follow RESTful conventions (resource-based URIs, correct HTTP verbs,
  idempotency where applicable).
- **Database**: PostgreSQL MUST be used as the storage engine. No other database engines
  are permitted without a constitution amendment.
- **ORM**: Lucid ORM (Laravel Eloquent-inspired) MUST be used for all database interactions.
  Raw SQL is permitted only for queries that Lucid cannot express, and MUST be documented
  with justification in the implementation plan.

## Tech Stack Reference

| Concern | Frontend | Backend |
|---|---|---|
| Language | TypeScript | TypeScript |
| Framework | React (PWA) | Fastify |
| UI | MUI + styled-components | — |
| State management | Jotai | — |
| Date handling | date-fns | — |
| Testing | React Testing Library | Jest (unit), Supertest (integration) |
| Database | — | PostgreSQL |
| ORM | — | Lucid ORM |
| Linting | ESLint (react, react-hooks) | ESLint (TypeScript) |

## Branching Strategy

This project MUST follow **Git Flow**.

- `main`: production-ready code only. Direct commits are not permitted.
- `develop`: integration branch. All completed work merges here before release.
- **Epics**: create a branch from `develop` named `epic/<name>`. All feature branches
  belonging to that epic MUST branch from and merge back into the epic branch.
- **Features (no epic)**: branch from `develop` and merge back into `develop` via PR.
- **Branch naming**: `epic/<name>`, `feature/<name>`, `fix/<name>`, `chore/<name>`.
- All merges MUST go through a pull request. No fast-forward merges are permitted on
  `develop` or `main` — merge commits are required to preserve history.

## Governance

- This constitution supersedes all other practices, guidelines, and conventions.
- Amendments MUST be documented in the PR that introduces the change, including:
  the rationale, the ratification date, and a migration plan for existing code if needed.
- All PRs MUST include a constitution compliance check before merge approval.
- Violations block merges until resolved. No bypass is permitted.
- Use `GUIDANCE.md` for runtime development decisions that do not rise to the level
  of a constitutional amendment.
- Version policy: MAJOR for incompatible governance changes or principle removals;
  MINOR for new principles or material expansions; PATCH for clarifications or wording.

**Version**: 1.1.0 | **Ratified**: 2026-03-27 | **Last Amended**: 2026-03-27
