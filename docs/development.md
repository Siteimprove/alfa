# Development Guide

Alfa is an open-source accessibility conformance testing engine owned by Siteimprove. It tests websites against WCAG by implementing rules based on the W3C ACT (Accessibility Conformance Testing) Rules Format, using DOM/CSSOM implementations for static analysis. It contains 110+ rules across 80+ TypeScript packages in a monorepo.

- Rule documentation: https://alfa.siteimprove.com
- Examples: https://github.com/Siteimprove/alfa-examples
- Integrations: https://github.com/Siteimprove/alfa-integrations

## Technology Stack

| Category | Technology |
|---|---|
| Language | TypeScript ≥ 5.9.3, strict mode |
| Runtime | Node.js ≥ 22.0.0 (tested on 22, 24, 26) |
| Package manager | Yarn ≥ 4.12.0 (Berry) |
| Module system | ES Modules (`"type": "module"`) |
| Build target | ES2022 |
| Test framework | Vitest ≥ 4.0.0 |
| Coverage | @vitest/coverage-v8 |
| API docs | @microsoft/api-extractor + api-documenter |
| Unused code | knip |
| Releases | Changesets |

## Repository Structure

```
.
├── .github/              # CI/CD workflows and reusable actions
├── config/               # vitest.config.ts, knip.ts, api-extractor.json
├── docs/                 # Architecture ADRs, development guides, API docs
├── packages/             # 80+ workspace packages
├── scratches/            # Gitignored scratch files for experimentation
├── scripts/              # build.mjs, watch.mjs, shared build utilities
├── tsconfig.json
└── package.json
```

### Package structure

Each package under `packages/alfa-<name>/` follows:

```
packages/alfa-<name>/
├── src/              # TypeScript source (entry point: src/index.ts)
├── test/             # *.spec.ts, *.spec.tsx, *.spec-d.ts (type tests)
├── dist/             # Compiled output (gitignored)
├── docs/             # Package-level documentation
├── config/           # Package-specific configs
├── package.json
└── tsconfig.json
```

## Key Packages

| Package | Purpose |
|---|---|
| `alfa-act` | ACT Rules Format implementation (core rule engine) |
| `alfa-aria` | ARIA attribute and role handling |
| `alfa-css` | CSS parsing and value type definitions |
| `alfa-style` | CSS computed value calculation for DOM nodes |
| `alfa-dom` | DOM/CSSOM node types with JSX support |
| `alfa-cascade` | CSS cascade computation |
| `alfa-parser` | Parser combinators (used throughout for CSS/HTML parsing) |
| `alfa-rules` | All 110+ accessibility rules |
| `alfa-test` | Custom testing utilities |
| `alfa-toolchain` | Build and validation tools |

## Commands

### Setup

```bash
yarn install --immutable    # Install dependencies (--immutable is required in CI)
```

### Building

```bash
yarn build                          # Build everything (3–4 min first run; uses up to 8 GB)
yarn build --quiet                  # Build silently
yarn build packages                 # Build packages only, not scratches
yarn build packages/alfa-<name>     # Build one package and its dependencies
yarn watch                          # Watch mode — rebuild on file changes
yarn clean                          # Clean build artifacts (avoid after successful tasks)
```

### Testing

```bash
yarn test                           # Run all tests (need to rebuild first in case of cross-package changes)
yarn test packages/alfa-<name>      # Test one package
yarn coverage                       # Run all tests with coverage
yarn workspace @siteimprove/alfa-<name> coverage:package   # Single-package coverage
```

### Code Quality

```bash
yarn knip                           # Find unused dependencies and exports
yarn extract                        # Extract API documentation
yarn workspace @siteimprove/alfa-<name> extract:self  # Single-package API extraction
yarn validate-structure .           # Validate project structure
```

### Scratch Files

```bash
# Create scratches/foo.ts, then:
yarn build scratches && node scratches/foo.js
```

Scratches support JSX via `@siteimprove/alfa-dom` and can import any Alfa package.

## TypeScript Conventions

- Strict mode throughout; no implicit `any`
- ES modules: `.ts` extensions on all imports.
  ```typescript
  import { X } from "./x.ts"           // correct
  import { X } from "./x"              // wrong — omitted extension
  ```
- Type imports where possible: `import type { Foo }` or `import { bar, type Foo }`
- Workspace deps use `"workspace:^"` in `package.json` and must also appear as project references in `tsconfig.json`
- Composite builds: all packages use `"composite": true`

### Naming

| Item | Convention |
|---|---|
| Packages | `@siteimprove/alfa-<name>` (kebab-case) |
| Files | lowercase with hyphens (`ancestor-filter.ts`) |
| Exported types | PascalCase |
| Functions | camelCase |
| Test files | `*.spec.ts`, `*.spec.tsx`, `*.spec-d.ts` |

## Testing Patterns

```typescript
import { test } from "@siteimprove/alfa-test";

test("does something", (t) => {
  t.equal(actual, expected);
  t.deepEqual(actual, expected);
  t(condition);   // assert truthy
});
```

- Tests import same package content from `src/`
- Type-level tests use `*.spec-d.ts` files
- Coverage thresholds: 75% lines, 80% branches, 65% functions
- Aim for 90%+ on new code

## Code Patterns

- **Functional style**: heavy use of `Option`, `Result`, `Either`, `Sequence`; data structures are immutable
- **Parser combinators**: `@siteimprove/alfa-parser` for CSS and HTML parsing — see `docs/guides/writing-a-parser.md`
- **Tree traversal**: `alfa-tree` utilities; `alfa-dom` for DOM node operations
- **Type guards**: `alfa-refinement` for type refinements

## Package Management

```bash
yarn workspace @siteimprove/alfa-<name> add <dep>       # Add a dependency
yarn workspace @siteimprove/alfa-<name> add -D <dep>    # Add a dev dependency
```

- All packages share a single version number
- Published to GitHub Packages (`https://npm.pkg.github.com/`), scope `@siteimprove` (requires authentication token)
- Published to npm Packages (`https://npmjs.com/`), scope `@siteimprove` (publicly available)
- Publication is human-triggered only — never automate it
- Publication is triggered by a Github workflow that runs many secondary operations

## Changesets

Required for any API or behavior change; not needed for docs or pure refactoring.

```bash
yarn changeset
```

### Format

```markdown
**[kind]:** [title]

[details]
```

| Kind | Bump in 0.x | Bump in 1.x+ |
|---|---|---|
| `Breaking` | minor | major |
| `Removed` | minor | major |
| `Added` | minor | minor |
| `Changed` | patch or minor | patch or minor |
| `Fixed` | patch | patch |

- Title goes to the global changelog; details go to the per-package changelog
- One PR can have multiple changesets; one changeset can affect multiple packages

## CI/CD

`integrate.yml` runs on every push and PR:

- Builds and tests on Ubuntu + Windows, Node.js 22 / 24 / 26
- Steps: build, test, coverage, knip, structure validation, API extraction

`release.yml` is human-triggered only. Never run it from automation; never use the `publish` action directly.

Reusable actions in `.github/actions/`: `setup`, `coverage`, `documentation`, `dependency-graphs`.

## Working with Accessibility Rules

- Each rule lives in `packages/alfa-rules/src/<rule-id>/`
- Rules are indexed in `packages/alfa-rules/src/rules.ts`
- Tests in `packages/alfa-rules/test/<rule-id>/`
- Implements the ACT Rules Format — look at existing rules for structural patterns

## Documentation

- Architecture Decision Reports: `docs/architecture/decisions/adr-*.md`
- Development guides: `docs/guides/` — changeset, debugging, releasing, writing-a-parser
- API docs: `docs/api/` — auto-generated at release time, not manually maintained

## Troubleshooting

**Build runs out of memory** — already configured with `--max-old-space-size=8192`; close other applications if still hitting limits.

**Build is slow** — use `yarn watch` during development instead of repeated full builds.

**Stale build artifacts** — `yarn clean && yarn build`.

**Tests fail after dependency changes** — rebuild first: `yarn build && yarn test`.

**"Cannot find module" errors** — check that imports use the `.ts` extension; verify `tsconfig.json` project references match `package.json` dependencies.
