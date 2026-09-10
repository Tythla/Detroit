# Repository Guidelines

## Project Overview

- This repository is a personal website built with React, TypeScript, and Vite.
- `src/apps/` contains the website's individual web apps.
- Each app must be self-contained under `src/apps/<app-name>/`.

## App Boundaries

- Keep all app-specific code in that app's directory. This includes components,
  hooks, API clients, types, utilities, styles, tests, and assets.
- Do not place app-specific code in shared top-level directories such as
  `src/components/`, `src/features/`, or `src/assets/`.
- Move code to a shared top-level directory only when it is genuinely reused by
  multiple apps or by the personal website shell.
- When adding a new app, create a dedicated `src/apps/<app-name>/` directory and
  keep its internal organization local to that directory.
- Avoid importing one app's internal modules from another app. Extract genuinely
  shared functionality into an appropriate shared directory instead.

## Development Conventions

- Follow the existing React and TypeScript patterns in the repository.
- Prefer focused changes and preserve the separation between the website shell,
  shared code, and individual apps.
- Use the existing npm scripts in `package.json` for development and validation.

## Required Validation

- After every modification, run `npm run lint:fix` from the repository root.
- Treat lint errors that remain after auto-fixing as part of the task and resolve
  them before finishing.
- For changes that can affect compilation or production output, also run
  `npm run build` when practical.
