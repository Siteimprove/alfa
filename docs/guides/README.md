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

Note that Dependabot is currently used almost everywhere for dependencies updates. It does not, however, update yarn. When a new version is out, yarn will print a message upon invocation of nearly any command. It then needs to be manually updated with `yarn set version latest` (in every repo) (remember to add the new release file to version control). All repos still have a local copy of yarn (rather than relying on Corepack, as recommended by yarn), mostly for historical reasons.

* Shared setup (by most repos if not all):
  * All dependencies are auto-updated by Dependabot. Security updates asap, regular updates on Monday morning (CET). Problems are reported to the latest editor of the workflow (in each repository).
  * Packages are automatically deduped upon installation (through a yarn plugin).
  * API documentation is generated as part of the release workflow.
  * Use a `!pr <command>` comment to issue commands on a PR, e.g. `!pr help`; mostly useful for `!pr extract` when it was not issued before pushing.
  * We mostly try to run the CI/CD with the last 3 node version (LTS, active, current), but some repos only use one version (typically, Alfa ACT-R needs to be run once, not to work with every version). Node versions usually get bumped in April/May. There is an automated reminder in Siteimprove's Slack to update the versions (needs to be done in all workflow in all repos); also remember to update the base image for the CodeSpace in Alfa Examples.


* [Alfa](https://github.com/Siteimprove/alfa) (this repository): The main repository for Alfa code.
  * Uses a merge queue for PRs, reducing friction when several PRs are merged around the same time.
  * Test coverage is generated as part of the release workflow.

* [Alfa integrations](https://github.com/Siteimprove/alfa-integrations) (public): Contains integrations of Alfa with various frameworks, including a Command Line Interface and the Accessibility Code Checker API.
  * The CLI, `alfa-test-utils`, and integrations with browsers automations are actively maintained. The other integrations are more dormant.
  * The packages are published still associated with the Alfa repository for historical reasons.

* [Alfa examples](https://github.com/Siteimprove/alfa-examples) (public): Curated list of examples of Alfa usage.
  * Contains both "unit" examples of integrations, more end-to-end examples of integrations with Siteimprove Accessibility Code Checker, and some advanced usages of Alfa.
  * The Accessibility Code Checker is run on the test page weekly (Monday morning, CET) to ensure it is always working and we always have a Code Checker Page Report available. Problems are reported to the latest editor of the workflow.
  * There is a Codespace with the Accessibility Code Checker pre setup (and correct secrets for members of the Siteimprove organization). This enable anyone (internal or external) to run a demo Code Checker with no local setup, and experiment with it. The Codespace is rebuilt on any change to `main`.
  
* [Alfa ACT-R](https://github.com/Siteimprove/alfa-act-r) (public): Acceptance testing of Alfa rules against the ACT Rules test cases.
  * This mostly contains only tests and fixtures to run them…
  * Test cases are auto-fetched every Monday morning from the W3C website, and implementation reports are automatically updated with the new test cases.
  * The published implementation reports are used to build [the WAI implementation reports](https://www.w3.org/WAI/standards-guidelines/act/implementations/), updated every Thursday (see also [nightly build snapshot](https://wai-wcag-act-rules.netlify.app/standards-guidelines/act/implementations/)).
  * We aim at maintaining the rules on par with the latest ACT Rules changes, so when these tests break and our implementation numbers decrease, we need to update the rules.

* [Alfa companion](https://github.com/Siteimprove/alfa-companion) (private): Incubator for Alfa related projects before they make it to the main repository; and place to host private Alfa related packages.
  * Low overall test coverage, this is mostly an experiment/incubator repo.
  * Auto update of Alfa and other packages via Dependabot.
  * Can be used for experiments, both on code or on tooling, before deploying to the main Alfa repository and to production. 

* [Alfa pre-staging](https://github.com/Siteimprove/alfa-pre-staging) (private): Wrapper for running the Accessibility Code Checker, at a chosen version, on a demo page.
  * Mostly just a workflow that runs the Code Checker, asking for the version to run.
  * Allow to compare audits between different versions of Alfa (and the Code Checker), meant to help testers.
  * The version choosing somewhat relies on all packages having the same version and may break once that changes…

* [Alfa performance benchmarking](https://github.com/Siteimprove/alfa-performance-benchmarking) (private): Set up for testing performance impact of changes.
  * Runs with local Alfa through yarn portals, which allow to measure unreleased code.
  * Used for testing changes that may impact performances. It is possible to work on the Alfa code directly.

* [Sanshikan](https://github.com/Siteimprove/sanshikan) (private): Siteimprove's copy of ACT Rules, plus Siteimprove's own rules.
  * Only markdown (for the rules) and a bit of JSON (for the metadata). No actual code.
  * Metadata is published and used in Siteimprove platform and web extension.

* [Alfa Hub](https://github.com/Siteimprove/alfa-hub) (private): Build a static website to show Sanshikan's rules; plus documentation for the Accessibility Code Checker.
  * Build a static website inside a Docker container.
  * The site is published at [alfa.siteimprove.com](https://alfa.siteimprove.com/), it is publicly available and serves as technical documentation for our rules.
  * Mostly ReactJS, plus processing of the markdown files.

* [Alfa Web extension](https://github.com/Siteimprove/alfa-web-extension) (private): Web extension running Alfa.
  * The extension is available in major browsers' extensions marketplace.
