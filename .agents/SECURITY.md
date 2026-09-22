# Code Security Audit

Use this procedure when asked to inspect the codebase for vulnerabilities, unsafe dependency versions, exposed secrets, or exploitable implementation flaws. It complements `DOCTOR.md`, which audits agent context rather than application security.

1. Establish whether the request is to report findings, remediate them, or both. Read `.agents/ARCHITECTURE.md`, `.agents/COMMANDS.md`, manifests, lockfiles, CI, deployment configuration, and the code paths in scope before running or changing anything.
2. Inventory every relevant package ecosystem, container image, operating-system package manifest, infrastructure definition, and generated lockfile. Audit resolved versions from lockfiles or equivalent dependency graphs; a declared version range alone does not establish which version is in use. State the coverage gap when resolution is absent or incomplete.
3. Prefer the repository's existing package-manager audit, static-analysis, secret-scanning, container, and infrastructure checks. Record exact adopted commands in `.agents/COMMANDS.md`. Do not add a scanner, connect a hosted service such as Aikido, upload source, or create credentials without maintainer authorization.
4. Use current vulnerability advisory data when network access is authorized and available. Report when a scan was offline, used stale data, omitted private registries, or could not cover an ecosystem; do not describe an incomplete scan as clean.
5. Check direct and transitive production, development, build, and optional dependencies. For each dependency finding, capture the advisory identifier, affected resolved version, dependency path, fixed version when known, package role, and whether the vulnerable behavior appears reachable.
6. Check first-party code and configuration with applicable existing static analysis plus focused inspection of trust boundaries. Include authentication and authorization, input validation, injection, command or path traversal, SSRF, unsafe deserialization, cryptography, secret exposure, sensitive logging, and insecure deployment defaults where relevant to the system.
7. Do not execute untrusted application code or newly fetched package install scripts merely to inspect it. Keep an audit read-only unless remediation was requested, and never expose secret values in commands, logs, findings, or reports.
8. Normalize findings as critical, high, medium, low, or informational while preserving the source tool's original rating. Assess exploitability separately using reachability, attacker prerequisites, exposed surface, existing controls, and confidence. Treat unknown reachability as unknown rather than silently downgrading it.
9. Report actionable findings with a stable identifier, affected component and location, evidence, impact, exploitability assessment, recommended remediation, and verification status. Deduplicate results that refer to the same root cause. Mark suspected false positives explicitly instead of dropping them.
10. When remediation is authorized, prefer the smallest supported fixed version and the narrowest code change. Update manifests and lockfiles together, inspect breaking or transitive changes, run relevant tests and static checks from `.agents/COMMANDS.md`, then rerun the security check. Do not apply a breaking upgrade or broad automated fix without reviewing its impact.
11. Suppress or accept a finding only under the project's documented policy, with a concrete rationale, owner, and review or expiry condition. Track unresolved actionable work in the canonical issue tracker or `.agents/todos/TODO.md`, according to the repository workflow.
12. Summarize the audited scope, tools and advisory-data date, findings by severity, remediated items, commands actually run, and coverage limitations. A zero-finding scan is evidence about the covered checks, not proof that the codebase is secure.

## W4lkies baseline

- Audit resolved frontend dependencies with `cd frontend && npm audit --omit=dev`; this requires current npm advisory access.
- The Python requirements are unpinned and have no lockfile or adopted vulnerability scanner, so resolved backend dependency audit coverage is currently incomplete.
- No static application-security, secret, container, or infrastructure scanner is configured. Focused review must cover JWT/authentication and role authorization, browser token handling, CORS, request validation, SQL/query construction, file and CSV processing, email content, financial data, logging, and deployment defaults.
- Never include `.env` contents, tokens, customer information, bank statements, or database dumps in findings or commits.
- Track actionable security work in GitHub when available; use `.agents/todos/TODO.md` only for unresolved security-process setup.

The proposed release threshold is no known exploitable critical or high finding, with explicit triage of medium and low findings. It remains a proposal until the maintainer adopts it; do not represent it as an enforced CI policy.
