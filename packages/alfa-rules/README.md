# Alfa Rules

This package contains the implementation of Alfa's Accessibility rules. Most of these are direct implementation of the corresponding [ACT rule](https://www.w3.org/WAI/standards-guidelines/act/rules/), while some are Siteimprove specific rules.

All rules are named "SIA-RXX" with "XX" being a unique number. This is the abbreviation of "SiteImprove Accessibility Rule". Rule numbers are never re-used even if a rule gets removed, … Thus some numbers can be "missing". When rules share significant amount of code, this can be stored in the [`src/common`](./src/common) directory.

## Rule lifecycle

Each rule lives in its own subdirectory of [`src`](./src), named `sia-rXX` with `XX` being sequential numbers without any leading zeros. These directory mostly contain a single `rule.ts` file, sometimes additional helper files. Similarly tests live in a `sia-rXX` subdirectory of [`test`](./test), mostly as a single file `rule.spec.tsx`.

Rules have tags. A rule must at least have a `Scope` and a `Stability` tag, plus an optional `Version` tag (version 1 is assumed if missing).
* Most rules only exist with the `Stability.Stable` tag.
* Rules that make use of new capacities that are not implemented downstream, or newer version with breaking changes, have a `Stability.Experimental` instead. When both a stable and experimental version of a rule need to co-exist, the experimental version lives in a `sia-erXX` sub-directory instead.
* Rules that have been deprecated, or former versions of a rule, have a `Stability.Deprecated` instead. Deprecated rules live in a `sia-drXX` sub-directory instead.

## Adding a new rule

New rules can directly be added in their own `sia-rXX` directory. If the rule doesn't use anything that isn't implemented downstream, it can be set as stable directly, otherwise set it as experimental. Example of breaking changes include a new type of answers for questions, a new type of test target, …

Make sure to record the rule in [`tsconfig.json`](./tsconfig.json) and [the rule list](./src/rules.ts). Set a scope of either component of page depending if the rule makes sense when testing individual components.

Add tests for the rule. The rule tests effectively act as final integration tests for the rest of Alfa's code. Rules are the final code that Alfa uses, so nearly everything else only exists to be used in rules.

## Creating a new version of a rule

Most changes in a rule don't require a new version and can be done directly in the rule. Changes that require a new version are any breaking changes to the API of the rule. Notably, changing the questions asked, non-backward-compatible change in the `Diagnostic`, changing the number of expectations, …

When a new version is added, we need to create it as an experimental rule, so that both versions have time to co-exist while we upgrade the consumers downstream. Create the `sia-erXX` directory and put the new version here. Remember to change the stability to experimental and to increase the version number (or add one at `2` if the old version doesn't have any yet). Add the experimental rule to [the experimental rule list](./src/experimental.ts).

## Deprecating a rule

Rename its directories from `sia-rXX` to `sia-drXX`, update the `tsconfig.json`, remove the rule from 
[the list of rules](./src/rules.ts) and add it to [the list of deprecated rules](./src/deprecated.ts). Update the stability from stable to deprecated, add a `@deprecated` TSdoc tag.

Deprecated rules can be deleted at a later point.

## Promoting rule version 

When downstream consumers are ready (or mostly ready) to consume a rule, it can be promoted to stable.

Deprecate the stable rule. Move the experimental one from `sia-erXX` to `sia-rXX` directories, update the `tsconfig.json`, rules list, deprecated rules list, and experimental rules list. Change the stability of the rule.

