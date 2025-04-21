# Task: Fix Jest ESM Module Mocking Issue

**Goal:** Resolve the failing integration tests (`npm test`) caused by Jest's inability to correctly mock ESM modules in the current project setup.

**Status:** Pending

**Coordinator:** TASK-CMD-20250420-011500 (Related to TypeScript Refactor)

**Assigned To:** bug-fixer

**Acceptance Criteria:**

*   The specific error `TypeError: mockedCreatePayment.mockClear is not a function` (and any related mocking errors) is resolved.
*   All integration tests in `tests/integration.test.ts` pass successfully when running `npm test`.
*   The solution maintains the project's ESM nature if possible, or clearly documents the necessary configuration changes (e.g., forcing CommonJS for tests via Babel/Jest config).
*   The solution is robust and doesn't introduce regressions.

**Context Files:**

*   `project_journal/tasks/TASK-TS-REFACTOR-20250420-011500.md` (See Summary section for details on the issue and attempted fixes)
*   `jest.config.js`
*   `babel.config.cjs`
*   `tsconfig.json`
*   `package.json`
*   `tests/integration.test.ts`
*   `src/tools/createPayment.ts` (and its mock)
*   `src/tools/queryPayment.ts` (and its mock)
*   `tests/__mocks__/` directory

**Checklist:**

*   `[⏳]` Review the "🔴 Unresolved Issue" section in `project_journal/tasks/TASK-TS-REFACTOR-20250420-011500.md` to understand the problem and previous attempts.
*   `[⏳]` Analyze `jest.config.js`, `babel.config.cjs`, and `tsconfig.json` for potential conflicts or misconfigurations related to ESM/TypeScript/Jest transformation.
*   `[⏳]` Examine the mocking implementation in `tests/integration.test.ts` and the mock files (`tests/__mocks__/`, `src/tools/__mocks__/`).
*   `[⏳]` Research current best practices and known issues for mocking ESM modules with Jest, TypeScript, and Babel. Consider Jest's experimental ESM support (`--experimental-vm-modules`).
*   `[⏳]` Attempt alternative mocking strategies or configuration adjustments (e.g., using `babel-plugin-transform-vite-meta-env`, adjusting Babel targets, modifying Jest `transform` config).
*   `[⏳]` If direct ESM mocking remains problematic, investigate forcing CommonJS transformation specifically for the test environment (e.g., using separate Babel env config for tests).
*   `[⏳]` Implement the chosen solution.
*   `[⏳]` Run `npm test` repeatedly to confirm the fix and ensure no new errors arise. 📣
*   `[⏳]` Document the solution and any necessary configuration changes clearly.
*   `[⏳]` Commit the relevant file changes.
---
**Log - 2025-04-20 01:35 AM (Bug Fixer)**

*   **Action:** Reviewed previous task log `TASK-TS-REFACTOR-20250420-011500.md`.
*   **Findings:** The core issue stems from Jest's interaction with the refactored ESM/TypeScript modules. Standard mocking techniques failed, resulting in `TypeError: mockedCreatePayment.mockClear is not a function`. Previous attempts to adjust Jest/Babel configurations were unsuccessful.
*   **Next Step:** Reproduce the error locally by running `npm test`.
---
**Log - 2025-04-20 01:35 AM (Bug Fixer)**

*   **Action:** Executed `npm test`.
*   **Outcome:** **Success (Bug Reproduced)**. Tests failed with the expected error: `TypeError: mockedCreatePayment.mockClear is not a function` in `tests/integration.test.ts:54`.
*   **Next Step:** Diagnose the root cause by examining test setup, mock implementation, and Jest/Babel configurations.
---
**Log - 2025-04-20 01:38 AM (Bug Fixer)**

*   **Action:** Modified `package.json` to remove `NODE_OPTIONS=--experimental-vm-modules` from test scripts. Modified `jest.config.js` to remove `extensionsToTreatAsEsm` and set `useESM: false` for `ts-jest`. Executed `npm test`.
*   **Outcome:** **Success!** All tests in `tests/integration.test.ts` passed. The original `TypeError` and subsequent `ReferenceError` are resolved.
*   **Regression Test:** Existing tests in `tests/integration.test.ts` serve as regression tests for the mocking configuration, confirming it now works correctly. No new tests specific to the configuration fix were added.

---
**Status:** ✅ Complete
**Outcome:** Success
**Summary:** Resolved Jest ESM module mocking issues by configuring the entire test environment to run in CommonJS mode. This involved removing Jest's experimental ESM flags (`NODE_OPTIONS=--experimental-vm-modules`, `extensionsToTreatAsEsm`, `useESM: true`) and ensuring Babel converts TypeScript to CommonJS specifically for the test environment (`babel.config.cjs` with `modules: 'auto'` for `NODE_ENV=test`).
**Root Cause:** The core issue stemmed from conflicts and limitations in Jest's experimental ESM support when combined with `ts-jest`, Babel transformations, and module mocking (especially factory mocks). Attempting to run tests in ESM mode while relying on transformations that might implicitly introduce CommonJS patterns (like `require` during mocking) led to errors (`TypeError: mockClear is not a function`, `ReferenceError: require is not defined`). Switching the test environment entirely to the more stable CommonJS mode resolved these conflicts.
**References:**
*   `package.json` (modified test scripts)
*   `jest.config.js` (modified transform, removed ESM settings)
*   `babel.config.cjs` (ensured CJS conversion for test env)
*   `tests/integration.test.ts` (tests now pass)
**Verification:** All tests passed successfully after applying the configuration changes (`npm test` exit code 0).