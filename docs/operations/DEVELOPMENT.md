# Development environment — Phase 1

## Reproducible setup

The repository pins Node and pnpm exactly in `.node-version`, `.nvmrc`, `package.json`, and `pnpm-lock.yaml`. Task is a repository dependency so a global installation is optional.

1. Select Node `24.20.0` with the team's approved version manager.
2. Run `corepack enable` and `corepack install`.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm exec task setup`.
5. Run `pnpm dev` for the localized foundation application.

`task setup` is idempotent and read-only. It classifies Node, pnpm, Task, and Git as mandatory. Docker and Trivy are optional for the primary application gate but mandatory for their container gates. The script emits platform-specific guidance and exits non-zero when a mandatory version is absent or wrong.

## Local browser dependencies

Browser binaries are deliberately stored under the ignored repository cache rather than silently installed on the workstation:

```bash
pnpm exec task browser:install
```

This download requires explicit network access. CI performs the equivalent installation on its ephemeral runner.

## Environment data

No runtime secret or provider configuration is required in Phase 1. `.env*` is ignored except for an eventual reviewed `.env.example`. Never use patient data, real contact data, credentials, or production payloads in local work, tests, screenshots, logs, or AI prompts.
