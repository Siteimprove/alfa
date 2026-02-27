0# Copilot Instructions for Alfa

This document provides guidance for GitHub Copilot coding agents working on the Alfa repository. Alfa is a suite of open and standards-based tools for performing reliable accessibility conformance testing at scale.

## Repository Overview

**Purpose**: Alfa is an open-source accessibility conformance testing engine that tests websites built using HTML, CSS, and JavaScript against accessibility standards such as WCAG (Web Content Accessibility Guidelines). It implements rules based on the Accessibility Conformance Testing (ACT) Rules Format.

**Key Features**:
- Implements DOM and CSSOM interfaces for static analysis
- Contains 110+ accessibility rules (in `packages/alfa-rules`)
- Modular architecture with 80+ packages in a monorepo
- Used by Siteimprove for accessibility testing

## Technology Stack

### Core Technologies
- **Language**: TypeScript >= 5.9.3 with strict mode enabled
- **Runtime**: Node.js >= 20.0.0 (tested on Node 20, 22, 24)
- **Package Manager**: Yarn >= 4.12.0 (Berry)
- **Module System**: ES Modules (ESM) with `"type": "module"`
- **Target**: ES2022 with lib es2022

### Build & Development Tools
- **Build System**: Custom TypeScript solution builder (in `scripts/build.mjs`)
- **Testing**: Vitest >= 4.0.0 with type checking support
- **Coverage**: @vitest/coverage-v8 with thresholds (lines: 75%, branches: 80%)
- **API Documentation**: @microsoft/api-extractor and api-documenter
- **Dependency Analysis**: knip for unused code detection
- **Version Management**: Changesets for managing releases

### Key Dependencies
- Parser combinators via `@siteimprove/alfa-parser`
- Functional programming patterns (Option, Result, Either types)
- Tree structures and traversal utilities
- CSS and DOM manipulation libraries

## Repository Structure

```
. (repository root)
├── .github/              # GitHub workflows and actions
│   ├── workflows/        # CI/CD workflows (integrate.yml, release.yml, etc.)
│   ├── actions/          # Reusable GitHub actions (setup, publish, coverage, etc.)
│   └── CODEOWNERS        # Code ownership definitions
├── config/               # Configuration files
│   ├── vitest.config.ts  # Vitest test configuration
│   ├── knip.ts          # Unused code detection config
│   ├── api-extractor.json
│   └── validate-structure.json
├── docs/                 # Documentation
│   ├── architecture/     # Architecture Decision Reports (ADRs)
│   │   └── decisions/   # ADR-001 through ADR-019+
│   ├── guides/          # Development guides
│   │   ├── changeset.md
│   │   ├── debugging.md
│   │   ├── releasing.md
│   │   └── writing-a-parser.md
│   ├── contributing.md
│   └── process.md       # Internal development process
├── packages/            # 80+ workspace packages (monorepo)
│   ├── alfa-act/        # ACT Rules Format implementation
│   ├── alfa-aria/       # ARIA support
│   ├── alfa-css/        # CSS parsing and evaluation
│   ├── alfa-dom/        # DOM and CSSOM node types
│   ├── alfa-rules/      # 110+ accessibility rules
│   ├── alfa-test/       # Testing utilities
│   └── ...              # Many more packages
├── scratches/           # Scratch files for experimentation (gitignored)
├── scripts/             # Build and utility scripts
│   ├── build.mjs        # Main build script
│   ├── watch.mjs        # File watcher for development
│   └── common/          # Shared build utilities
├── tsconfig.json        # Root TypeScript config
├── package.json         # Root package.json with scripts
└── yarn.lock            # Yarn lockfile
```

### Package Structure
Each package in `packages/` follows this structure:
```
packages/alfa-<name>/
├── src/                 # TypeScript source files
│   └── index.ts        # Main entry point
├── test/               # Test files (*.spec.ts, *.spec.tsx)
├── dist/               # Compiled JavaScript (gitignored)
├── docs/               # Package documentation
├── config/             # Package-specific configs
├── package.json        # Package metadata
└── tsconfig.json       # Package TypeScript config
```

## Build, Test, and Development Workflows

### Initial Setup

```bash
# Install dependencies (use --immutable for CI)
yarn install --immutable

# Build entire project (takes 3-4 minutes on first run)
# Uses up to 8GB memory (--max-old-space-size=8192)
yarn build

# Or build quietly
yarn build --quiet

# Build specific packages
yarn build packages/alfa-dom
```

### Development Workflow

```bash
# Start watch mode (rebuilds on changes)
yarn watch

# Build just packages (not scratches)
yarn build packages

# Build single package (and its dependencies)
yarn build packages/alfa-<name>

# Clean build artifacts (do not use this after successful tasks)
yarn clean
```

### Testing

```bash
# Run all tests (requires build first)
yarn test

# Test specific package
yarn test packages/alfa-array

# Run with coverage
yarn coverage

# Run coverage for single package (must build first)
yarn workspace @siteimprove/alfa-<name>> coverage:package
```

**Test Configuration**:
- Test files: `packages/alfa-*/test/**/*.spec.ts?(x)`
- Type check tests: `packages/alfa-*/test/**/*.spec-d.ts?(x)`
- Framework: Vitest with describe/test from `@siteimprove/alfa-test`
- Coverage thresholds: 75% lines, 80% branches, 65% functions

### Code Quality Checks

```bash
# Check for unused dependencies/exports
yarn knip

# Extract API documentation
yarn extract

# For specific package
yarn workspace @siteimprove/alfa-<name> extract:self

# Generate API documentation (this happens automatically at published time and should not be part of individual PRs).
yarn document

# Validate project structure (run from repository root)
yarn validate-structure .

# Check for duplicate dependencies (this should happen automatically on install)
yarn dedupe --check
```

### Scratch Files (Experimentation)

The `scratches/` directory is for quick experiments:
```bash
# Create scratches/foo.ts or scratches/foo.tsx
yarn build scratches

# Run the compiled output
node scratches/foo.js
```

**Note**: Scratches support JSX via `@siteimprove/alfa-dom` and can use any Alfa package.

## Code Style and Conventions

### TypeScript Configuration
- **Strict mode**: Enabled (`"strict": true`)
- **Module**: Node18 with verbatimModuleSyntax
- **Composite projects**: All packages use `"composite": true`
- **Target**: ES2022
- **No default types**: Use explicit imports

### Editor Configuration (.editorconfig)
- **Indent**: 2 spaces
- **Line endings**: LF
- **Charset**: UTF-8
- **Trim trailing whitespace**: Yes (except Markdown)
- **Insert final newline**: Yes

### Naming Conventions
- **Packages**: `@siteimprove/alfa-<name>` with kebab-case
- **Files**: Lowercase with hyphens (e.g., `ancestor-filter.ts`)
- **Test files**: `*.spec.ts` or `*.spec.tsx` or `*.spec-d.ts` for type tests
- **Exported types**: PascalCase
- **Functions**: camelCase

### Import Conventions
- Use ES module imports: `import { foo } from "..."`
- Use `.js` extensions in imports (even for `.ts` files): `import { X } from "./x.js"`
- Use type imports where possible: `import type { Foo } from "..."` or `import { bar, type Foo } from "..."`.
- Workspace dependencies: `"workspace:^"` in package.json
- Import from `dist/` in tests: `import { Array } from "../dist/array.js"`

### Testing Patterns
```typescript
import { test } from "@siteimprove/alfa-test";

test("Feature does something", (t) => {
  t.equal(actual, expected);
  t.deepEqual(actual, expected);
  t(condition); // Assert truthy
});
```

### Common Patterns
- **Functional programming**: Heavy use of Option, Result, Either, Sequence types
- **Immutability**: Data structures are immutable
- **Parser combinators**: Use `@siteimprove/alfa-parser` for parsing
- **Tree traversal**: Use utilities from `@siteimprove/alfa-tree`
- **Type guards**: Use refinements from `@siteimprove/alfa-refinement`

## Package Management

### Workspace Dependencies
- **Internal dependencies**: Use `"workspace:^"` in package.json
- **Version synchronization**: All packages share the same version number
- **Package references**: Must be declared in both package.json and tsconfig.json

### Publishing
- **Registry**: GitHub Packages (https://npm.pkg.github.com/)
- **Access**: Public
- **Scope**: `@siteimprove`

Package publication happens only when humans trigger the workflow. Coding agents working on this project must never publish it.

### Adding Dependencies
```bash
# Add to specific package
yarn workspace @siteimprove/alfa-<name> add <dependency>

# Add dev dependency
yarn workspace @siteimprove/alfa-<name> add -D <dependency>
```

## Changesets and Releases

Alfa uses [changesets](https://github.com/changesets/changesets) for version management.

### Creating a Changeset
```bash
yarn changeset
```

### Changeset Format
```markdown
**[kind]:** [title]

[details]
```

**Kinds**:
- `Breaking`: Breaking changes (use minor bump in 0.x versions, major in 1.x+)
- `Removed`: Removed features (use minor bump in 0.x, major in 1.x+)
- `Added`: New features (minor bump)
- `Changed`: Changes to existing features (patch or minor)
- `Fixed`: Bug fixes (patch bump)

**Guidelines**:
- Use full editor for both title and details
- Title goes to global changelog, details to package changelog
- Not all PRs need changesets (docs, refactoring don't need them)
- One PR can have multiple changesets
- One changeset can affect multiple packages

## Documentation

### Structure
- **Architecture Decision Reports**: In `docs/architecture/decisions/adr-*.md`
- **Guides**: In `docs/guides/`
- **Package docs**: In `packages/alfa-*/docs/`
- **API docs**: Generated in `docs/api/`

### ADR Format
See `docs/architecture.md` for the required format:
- Title (H1)
- Context (H2)
- Decision (H2)
- Status (H2)
- Consequences (H2)

### Guides Available
- `changeset.md`: How to create changesets
- `debugging.md`: How to debug Alfa results
- `writing-a-parser.md`: How to write parsers
- `releasing.md`: Release process

## CI/CD

### Workflows
- **integrate.yml**: Runs on push/PR - builds, tests, coverage, validation, API extraction, knip
- **release.yml**: Publishes packages on main branch - Coding agents must never run this workflow.
- **coverage.yml**: Reports test coverage - This happens automatically at publish time and doesn't need to be run by coding agents.
- **codeql.yml**: Security analysis

### CI Environment
- **OS**: Ubuntu-latest and Windows-latest
- **Node versions**: 20, 22, 24
- **Build**: Uses `--quiet` flag
- **Coverage threshold**: 75% line coverage required, aim for at least 90% when working on new code; no need to add tests for existing code when working on unrelated tasks.

### GitHub Actions
Reusable actions in `.github/actions/`:
- `setup`: Sets up Alfa (install, build toolchain, configure git)
- `publish`: Publishes packages to GitHub Packages - Coding agents must never use this action.
- `coverage`: Handles coverage reporting - This happens automatically at publish time and doesn't need to be run by coding agents.
- `documentation`: Generates and uploads docs - This happens automatically at publish time and doesn't need to be run by coding agents.
- `dependency-graphs`: Generates dependency graphs

## Common Issues and Troubleshooting

### Build Issues

**Issue**: Build runs out of memory
```bash
# Already configured in package.json with --max-old-space-size=8192
# If still hitting limits, close other applications
```

**Issue**: Build is slow
```bash
# Use watch mode during development instead of repeated builds
yarn watch

# Or build only what you need
yarn build packages/alfa-<specific-package>
```

**Issue**: Stale build artifacts
```bash
yarn clean
yarn build
```

### Test Issues

**Issue**: Tests fail after dependency changes
```bash
# Rebuild before testing
yarn build && yarn test
```

**Issue**: Type check tests fail
```bash
# Type check tests are in *.spec-d.ts files
# Make sure TypeScript version matches
```

### Dependency Issues

**Issue**: Yarn install fails with authentication error
```bash
# Configure token for @siteimprove scope
yarn config set npmScopes.siteimprove.npmAuthToken <token>

# Or add to .npmrc:
# @siteimprove:registry=https://npm.pkg.github.com/siteimprove
```

**Issue**: Duplicate dependencies
```bash
yarn dedupe
```

### TypeScript Issues

**Issue**: "Cannot find module" errors
- Check that imports use `.js` extension: `import { X } from "./x.js"`
- Verify package references in tsconfig.json match dependencies in package.json
- Ensure `"type": "module"` is in package.json

**Issue**: Incremental build issues
```bash
# Clean .tsbuildinfo files
yarn clean
```

## Working with Rules

The `packages/alfa-rules` package contains all accessibility rules.

### Rule Structure
- Each rule is in `packages/alfa-rules/src/<rule-id>/`
- Rules are indexed in `packages/alfa-rules/src/rules.ts`
- Test for each rule in `packages/alfa-rules/test/<rule-id>/`

### Rule Implementation
Rules implement the ACT Rules Format. See existing rules for patterns.

## Key Packages to Know

- `alfa-act`: ACT Rules Format implementation
- `alfa-aria`: ARIA attribute and role handling
- `alfa-cascade`: CSS cascade computation
- `alfa-css`: CSS parsing and value types definitions
- `alfa-style`: Computing styles (CSS computed value of each property) for DOM nodes
- `alfa-dom`: DOM and CSSOM implementations, JSX support
- `alfa-parser`: Parser combinators library
- `alfa-rules`: All accessibility rules
- `alfa-test`: Testing utilities
- `alfa-toolchain`: Build and validation tools

## Best Practices for Coding Agents

1. **Always build before testing**: Tests depend on compiled output in `dist/`
2. **Use watch mode for active development**: `yarn watch` rebuilds on changes
3. **Make minimal changes**: This is a well-established codebase with strict conventions
4. **Follow existing patterns**: Look at similar packages/rules for guidance
5. **Run knip**: Check for unused code before submitting changes
6. **Create changesets**: For any API or behavior changes
7. **Update tests**: Maintain or improve the 75% coverage threshold
8. **Respect the monorepo**: Changes may affect multiple packages
9. **Use scratches for experiments**: Don't pollute packages with test code
10. **Check ADRs**: Major decisions are documented in architecture/decisions

## Additional Resources

- **Main README**: `README.md`
- **Contributing Guide**: `docs/contributing.md` (external contributors only)
- **Architecture Docs**: `docs/architecture/`
- **Alfa Hub**: https://alfa.siteimprove.com (rule documentation)
- **Examples Repo**: https://github.com/Siteimprove/alfa-examples
- **Integrations Repo**: https://github.com/Siteimprove/alfa-integrations

## Quick Command Reference

```bash
# Setup
yarn install --immutable

# Development
yarn build                           # Build all
yarn build --quiet                   # Build silently
yarn build packages                  # Build packages only
yarn build packages/alfa-<name>      # Build specific package and its dependencies
yarn watch                           # Watch mode
yarn clean                           # Clean build artifacts

# Testing
yarn test                            # Run all tests
yarn test packages/alfa-<name>       # Test specific package
yarn coverage                        # Run with coverage

# Quality
yarn knip                            # Find unused code
yarn extract                         # Extract API docs
yarn dedupe --check                  # Check duplicates

# Changesets
yarn changeset                       # Create changeset

# Scratch files
yarn build scratches                 # Build experiments
node scratches/foo.js                # Run experiment
```

## Notes on Code Organization

- **Strict TypeScript**: All code uses strict mode, no implicit any
- **Functional style**: Prefer immutable data structures and pure functions
- **Explicit exports**: Each package has clear public API
- **Composite builds**: TypeScript project references for fast rebuilds
- **Test isolation**: Tests import from `dist/`, not `src/`
- **Version sync**: All 80+ packages share one version number
