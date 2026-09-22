# Agent TODO

Persistent engineering-process and agent-context follow-up only. Product work remains in GitHub or root `TODO.md`; move completed entries to `DONE.md`.

## Open Items

- Decide whether solo-maintained `master` should require pull requests without external approval or require an external approving reviewer; then explicitly authorize and configure GitHub protection. As of 2026-09-22 there are no rulesets or branch protection.
- Repair the current frontend lint errors and warnings, establish an explicit TypeScript check, and stop suppressing lint/type failures during production builds when the baseline is clean.
- Add an automated frontend test baseline for critical public, signup, authentication, authorization, booking, and finance flows.
- Establish backend formatting, linting, and type checking, plus separate unit/integration invocations where useful.
- Add CI for the adopted frontend and backend checks after the local baselines are green.
- Triage and remediate the 2026-09-22 production npm audit findings (1 critical, 4 high, 3 moderate, 1 low), including Next.js, PostCSS, lodash, nanoid, `ws`, React Router, and selector-parser advisories.
- Pin/lock backend dependencies and adopt a resolved Python dependency vulnerability audit. Decide whether to add secret, static-code, and container scanning.
- Agree on the proposed security release threshold in `SECURITY.md` and define finding ownership/exception expiry.
