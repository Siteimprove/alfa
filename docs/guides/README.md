# Guides

This section is intended to be a place where developers can add guides on different aspects of working with Alfa so that other developers can benefit from the knowledge shared.

## Adding code

Remember to [Add a change set](changeset.md) to your pull requests if needed.

- [Writing a parser](writing-a-parser.md)

## Investigating

* [Debugging false positive reports](debugging.md)

## Operations

* How to [Release](releasing.md) a new version of Alfa.  

# Alfa structure

List of Alfa repositories, both public and private, and some of their particularities…

* [Alfa](https://github.com/Siteimprove/alfa) (this repository): The main repository for Alfa code.

* [Alfa integrations](https://github.com/Siteimprove/alfa-integrations) (public): Contains integrations of Alfa with various frameworks, including a Command Line Interface and the Accessibility Code Checker API.
  * The CLI, `alfa-test-utils`, and integrations with browsers automations are actively maintained. The other integrations are more dormant.
  * The packages are published still associated with the Alfa repository for historical reasons.
  * Alfa core packages are auto-updated by Renovate. Other dependencies of actively maintained packages also are.
  * Other packages are not auto-updated (except for security updates), notably due to the low amount of tests decreasing confidence in CI results.
  * Has very few tests overall, especially in the non actively maintained packages.

* [Alfa examples](https://github.com/Siteimprove/alfa-examples) (public): Curated list of examples of Alfa usage.
  * Contains both "unit" examples of integrations, more end-to-end examples of integrations with Siteimprove Accessibility Code Checker, and some advanced usages of Alfa.
  * Alfa packages, and the ones needed for actively maintained integration, are automatically updated by Renovate.
  
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

* [Alfa Hub](https://github.com/Siteimprove/alfa-hub) (private): Build a static website to show Sanshikan's rules; plus documentation for the Accessibility Code Checker.
  * Build a static website inside a Docker container.
  * The site is published at [alfa.siteimprove.com](https://alfa.siteimprove.com/), it is publicly available and serves as technical documentation for our rules.
  * Mostly ReactJS, plus processing of the markdown files.
