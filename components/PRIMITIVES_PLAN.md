Design system primitives plan

Goal

Create a small, typed design system of UI primitives (Button, Input, Modal, Card, Toast) to be used across the app.

Approach
- Start with Button and Input components as wrappers around existing styles.
- Add a theme token mapping in styles/ and a global provider in components/theme-provider.tsx.
- Migrate one existing component (e.g., copy-button) to use the Button primitive as proof of concept.

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>