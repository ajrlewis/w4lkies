# Next.js Preset

- Prefer the router, data-fetching model, and rendering strategy already used by the app.
- Keep server-only code out of client components.
- Treat route handlers, server actions, environment variables, forms, and external responses as runtime boundaries with validation and clear error behavior. Preserve the established schema library; Zod is a reasonable TypeScript default when none exists.
- Avoid repeatedly validating trusted internal values solely because TypeScript types are erased at runtime.
- Preserve established styling, component organization, and state-management patterns.
- Use framework-native optimizations for images, metadata, caching, and routing where they fit.
- Run the canonical build, lint, typecheck, and focused test commands from `.agents/COMMANDS.md`.
