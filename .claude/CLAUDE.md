# CLAUDE.md

Alfa is an accessibility conformance testing engine (110+ rules, 80+ TypeScript packages in a monorepo). See [docs/development.md](../docs/development.md) for commands, architecture, and conventions. See [agents.md](../agents.md) for behavioral guidelines that apply to all agents.

## Quick Reference

```bash
yarn build packages/alfa-<name>     # Build one package and its dependencies
yarn test packages/alfa-<name>      # Test one package (always build first)
yarn watch                          # Watch mode for active development
yarn changeset                      # Create a changeset (required for API/behavior changes)
yarn knip                           # Find unused exports/dependencies before submitting
```

## Notes

- Strict TypeScript throughout: no implicit `any`, `.ts` extensions on all imports, type imports preferred
- When in doubt about patterns — rule structure, parser usage, functional types — read existing source in `packages/` before introducing new approaches
- `yarn clean` destroys incremental build state; avoid it unless diagnosing stale-artifact issues
