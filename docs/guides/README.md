# Guides

This section is intended to be a place where developers can add guides on different aspects of working with Alfa so that other developers can benefit from the knowledge shared.

## Adding code

* [Writing a parser](writing-a-parser.md)

## Investigating

* [Debugging false positive reports](debugging.md)

## Operations

* How to [Release](releasing.md) a new version of Alfa.  

# Alfa structure

List of Alfa repositories, both public and private, and some of their particularities…

* [Alfa](https://github.com/Siteimprove/alfa) (this repository): The main repository for Alfa code.

* [Alfa integrations](https://github.com/Siteimprove/alfa-integrations) (public): Contains integrations of Alfa with various frameworks, including a Command Line Interface.
  * This is effectively not actively developed and not used much internally, apart from the CLI.
  * The packages are published still associated with the Alfa repository for historical reasons.
  * Alfa core packages are auto-updated by Renovate.
  * Has very few tests overall.
  * Non-Alfa packages are not auto-updated (except for security updates), notably due to the low amount of tests decreasing confidence in CI results.
  * Note: Cypress has problem with ES2020, we don't want to lower target to ES2019 as it would degrade performances. We need to figure out a way to solve this.

* [Alfa examples](https://github.com/Siteimprove/alfa-examples) (public): Curated list of examples of Alfa usage.
  * Currently no automatic update of Alfa (or other) packages.
  * Note: Cypress has problem with ES2020, we don't want to lower target to ES2019 as it would degrade performances. We need to figure out a way to solve this.
  
* [Alfa ACT-R](https://github.com/Siteimprove/alfa-act-r) (public): Acceptance testing of Alfa rules against the ACT Rules test cases.
  * This mostly contains only tests and fixtures to run them…
  * All dependencies are auto updated by Renovate.
  * Test cases are auto-fetched every Monday morning from the W3C website, and implementation reports are automatically updated with the new test cases.
  * The published implementation reports are used to build [the WAI implementation reports](https://www.w3.org/WAI/standards-guidelines/act/implementations/), updated every Thursday (see also [nightly build snapshot](https://wai-wcag-act-rules.netlify.app/standards-guidelines/act/implementations/)).
  * We aim at maintaining the rules on par with the latest ACT Rules changes, so when these tests break and our implementation numbers decrease, we need to update the rules.

* [Alfa companion](https://github.com/Siteimprove/alfa-companion) (private): Incubator for Alfa related projects before they make it to the main repository.
  * Low overall test coverage, this is mostly an experiment/incubator repo.
  * Auto update of Alfa and other packages via Renovate.
  * Can be used for experiments, both on code or on tooling, before deploying to the main Alfa repository and to production. 

* [Alfa performance benchmarking](https://github.com/Siteimprove/alfa-performance-benchmarking) (private): Set up for testing performance impact of changes.
  * Runs with a git submodule for Alfa, which allow to measure unreleased code. But must therefore live in its own repository.
  * Used for testing changes that may impact performances. It is possible to work on the Alfa submodule directly.

* [Sanshikan](https://github.com/Siteimprove/sanshikan) (private): Siteimprove's copy of ACT Rules, plus Siteimprove's own rules.
  * Only markdown (for the rules) and a bit of JSON (for the metadata). No actual code.
  * Metadata is published and used in Siteimprove platform and web extension.

* [Alfa Hub](https://github.com/Siteimprove/alfa-hub) (private): Build a static website to show Sanshikan's rules.
  * Includes Sanshikan as a submodule. Could be changed to packages…
  * Build a static website inside a Docker container.
  * The site is published at [alfa.siteimprove.com](https://alfa.siteimprove.com/), it is publicly available and serves as technical documentation for our rules.
  * Mostly ReactJS, plus processing of the markdown files.
