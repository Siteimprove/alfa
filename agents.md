# Agent Instructions

Behavioral guidelines for AI coding agents working in this repository. For commands, architecture, conventions, and tooling, see [docs/development.md](docs/development.md).

## Rules

1. **Always build before testing** — tests import their own package's source from `src/`, but all cross-package dependencies resolve through `dist/`; stale `dist/` produces wrong results
2. **Use watch mode for active development** — `yarn watch` instead of repeated `yarn build`
3. **Make minimal changes** — this is a well-established codebase with strict conventions; avoid cleanup or refactoring outside the task scope
4. **Follow existing patterns** — read similar packages or rules before introducing new approaches
5. **Use scratches for experiments** — `scratches/` is gitignored; never pollute packages with throwaway code
6. **Never publish** — `release.yml` and the `publish` action are human-only; do not trigger them

## Before Submitting

- Run `yarn knip` to verify no unused exports or dependencies were introduced
- Create a changeset (`yarn changeset`) for any API or behavior change
- Maintain or improve the 75% line / 80% branch coverage thresholds; aim for 90%+ on new code
- Workspace dependencies require entries in **both** `package.json` and `tsconfig.json`

## Architecture Guidance

- All packages share a single version number — a change in one package may require updates in dependents
- Check `docs/architecture/decisions/` before making significant architectural choices
- The `integrate.yml` CI workflow (build + test + coverage + knip + structure validation + API extraction) is the gate for all changes
