# Changelog

All notable changes to Alfa will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and Alfa adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<details>
<summary><strong>Guidelines for writing changelog entries</strong></summary>

The changelog includes a single entry for every released version of Alfa. Each entry is identified by two pieces of information: The version number and the date, in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format, of the release. The very first entry in the changelog, labelled `[Unreleased]`, includes all upcoming changes for inclusion in the next release.

Each entry may begin with an general description of the changes introduced in the release and must then list each notable change as separate list items. For each item, the following should be included:

- The name of the package affected, as the first point in the item: `[@siteimprove/alfa-<package>](packages/alfa-<package>): <description>`. If more than one package is affected, the package names must be separated by a comma.

- The issue and/or pull request that concerns the change, as the last point in the item and enclosed by parentheses: `<description> ([#<number>](../../issues/<number>))`. If more than one reference is needed, the references must be separated by a comma. All references must be within the same set of parentheses.

Items that are related, such as breaking changes, new features, or changes to existing features, should be grouped under an appropriate heading.

**Note on links:** For all links to repository resources rooted at `https://github.com/<owner>/<repo>`, make sure to use paths relative to `https://github.com/<owner>/<repo>/blob` which is the path from which GitHub [performs autolinking](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-readmes#relative-links-and-image-paths-in-readme-files). This helps keeps links short and ensures that they are not tied to a specific owner and repository name in the event that we should move and/or rename the repository. Also, please refrain from using [shortcut reference links](https://github.github.com/gfm/#shortcut-reference-link) as they make it difficult to copy/paste entries to outside the changelog.

</details>

## [Unreleased]

### Fixed

- [@siteimprove/alfa-cli](packages/alfa-cli): Newlines are now correctly appended to the output, not the filename, when using the `--output` flag.

## [0.3.0](../../compare/v0.2.0...v0.3.0) (2020-07-01)

### Breaking

- [@siteimprove/alfa-act](packages/alfa-act): The way expectations are handled in rules has been reworked to allow for additional information to be passed through the new `Diagnostic` class. This means that the type of expectations has changed from `Option<Result<string>>` to `Option<Result<Diagnostic>>`; to get the status message, one therefore has to extract the `Diagnostic#message` property. ([#246](../../pull/246))

- [@siteimprove/alfa-scraper](packages/alfa-scraper): The `Awaiter` class now expects an instance of `Timeout`, rather than a `number`, for its `timeout` argument ([#254](../../pull/254))

- [@siteimprove/alfa-device](packages/alfa-device), [@siteimprove/alfa-scraper](packages/alfa-scraper), [@siteimprove/alfa-cli](packages/alfa-cli): Scripting and user preferences, such as `prefers-reduced-motion`, are now included in the `Device` class. This also means that the `javascript` option in `Scraper#scrape()` has been removed as this is now dealt with in the `Device` class. Lastly, the `--javascript` flag used by the `scrape` and `audit` CLI commands has been renamed `--scripting` to align with these changes.

- [@siteimprove/alfa-highlight](packages/alfa-highlight): Syntax definitions are now lazy loaded and so the `syntax()` function has become asynchronous and returns a `Promise<string>` rather than a `string`. ([#263](../../pull/263))

- [@siteimprove/alfa-math](packages/alfa-math): The package has been rewritten to remove its dependence on the `mathjs` library as it was the source of a performance bottleneck. ([#268](../../pull/268))

- [@siteimprove/alfa-formatter](packages/alfa-formatter): The `Formatter.load()` function now uses dynamic imports rather than `require()` for loading formatters, removing the dependence on Node.js. This also means that the `Formatter.load()` function has become asynchronous. ([#278](../../pull/278))

- [@siteimprove/alfa-dom](packages/alfa-dom): The `jsx()` now requires that the `style` attribute be passed as property-value record, `Record<string, string>`. ([#281](../../pull/281))

- [@siteimprove/alfa-cli](packages/alfa-cli): The CLI has been reworked to make use of the new [@siteimprove/alfa-command](packages/alfa-command) package. This has however required a breaking change to the `--headers`, `--cookies`, and `--outcomes` flags as outlined in the associated pull request. Make sure to check out the `--help` output for up-to-date documentation on these flags. ([#265](../../pull/265))

### Added

- [@siteimprove/alfa-parser](packages/alfa-parser): Additional arguments can now be defined for `Parser<I, T, E, A>` instances through a fourth type parameter, `A`.

- [@siteimprove/alfa-style](packages/alfa-style): The `background` shorthand property is now supported, albeit with a limited scope as it only supports a single `<color>` layer. ([#277](../../pull/277))

- [@siteimprove/alfa-future](packages/alfa-future): The `Future#get()` method has been added for synchronously resolving non-deferred futures, which was the very reason for implementing and using futures over native promises. ([#279](../../pull/279))

- [@siteimprove/alfa-dom](packages/alfa-dom): A HyperScript-like DSL is now available to ease the construction of DOM. ([#281](../../pull/281))

- [@siteimprove/alfa-command](packages/alfa-command): A new package has been added with functionality for modelling command line applications, removing the previous dependence on the oclif framework. ([#265](../../pull/265))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R67 has been updated to reflect the latest version of the rule in Sanshikan. ([#272](../../pull/272))

### Fixed

- [@siteimprove/alfa-scraper](packages/alfa-scraper): `Awaiter.loaded()` is not used as the default awaiter in `Scraper#scrape()` to fix a bug where stylesheets were not ready at the time of scraping. ([#253](../../pull/253))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R69 now correctly uses automatically determined background or foreground colors when only one of the two cannot be determined automatically. Previously, both would be deferred to `Oracle` when either couldn't be determined. ([#256](../../pull/256))

- [@siteimprove/alfa-cascade](packages/alfa-cascade), [@siteimprove/alfa-media](packages/alfa-media): User agent styles have been added for the `<noscript>` element and the associated `scripting` media feature is now matched by `Media.Query#matches()`. ([#260](../../pull/260))

- [@siteimprove/alfa-act](packages/alfa-act): The `Interview` type is now limited to a fixed recursion depth which fixes type inference in TypeScript 3.8 and below and avoids a stack overflow in TypeScript 3.9 and above. ([#266](../../pull/266))

- [@siteimprove/alfa-rules](packages/alfa-rules): The `kind` attribute of the `<video>` element is now correctly treated as an enumerable attribute. ([#269](../../pull/269))

- [@siteimprove/alfa-aria](packages/alfa-aria): Presentional roles conflict resolution is now correctly accounted for in the ARIA feature mappings. ([#264](../../pull/264))

- [@siteimprove/alfa-cascade](packages/alfa-cascade): Rules with identical selectors are no longer incorrectly deduplicated when added to the rule tree, which lead to rules being discarded. ([#274](../../pull/274))

## [0.2.0](../../compare/v0.1.0...v0.2.0) (2020-06-08)

### Breaking

- [@siteimprove/alfa-table](packages/alfa-table): The internals of how tables are built have changed to improve performance. As a side effect, several properties of various table related classes are now exposed as `Iterable` rather than `Array`. ([#237](../../237))

- [@siteimprove/alfa-dom](packages/alfa-dom): The type of the `content` argument in `Element.of()` has changed from `Option<Document>` to `Option<Mapper<Element, Document>>` to accomodate the new `Document#frame` property. ([#244](../../pull/244))

- [@siteimprove/alfa-cli](packages/alfa-cli): The `Formatter<I, T, Q>` type has moved to [@siteimprove/alfa-formatter](packages/alfa-formatter). ([#248](../../pull/248))

- [@siteimprove/alfa-scraper](packages/alfa-scraper): The `Headers` class has changed substantially to align with the new `Cookies`, `Cookie`, and `Header` classes. ([#249](../../pull/249))

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R81, SIA-R83, SIA-R84, and SIA-R85 are now available. ([#232](../../pull/232), [#239](../../pull/239), [#241](../../pull/241), [#242](../../pull/242))

- [@siteimprove/alfa-dom](packages/alfa-dom): The `Document#frame` property has been added to better model embedded documents. ([#244](../../pull/244))

- [@siteimprove/alfa-dom](packages/alfa-dom): `Node#path()` now accepts `Node.Traversal` options to make it possible to construct XPath expressions for various traversal modes. ([#245](../../pull/245))

- [@siteimprove/alfa-scraper](packages/alfa-scraper), [@siteimprove/alfa-cli](packages/alfa-cli): Both the `Scraper#scrape()` method and the `scrape` and `audit` CLI commands now accept additional HTTP headers and cookies. For more information, please see the associated pull request. ([#249](../../pull/249))

- [@siteimprove/alfa-formatter-sarif](packages/alfa-formatter-sarif): A SARIF formatter is now available. ([#250](../../pull/250))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R57 no longer applies to text nodes that only consist of whitespace.

### Fixed

- [@siteimprove/alfa-style](packages/alfa-style): Styles set via the `style` attribute are now correctly applied.

- [@siteimprove/alfa-dom](packages/alfa-dom): `Node.fromNode()` now correctly parses `Fragment.JSON` to `Fragment`.

- [@siteimprove/alfa-dom](packages/alfa-dom): `Fragment` nodes now correctly disallow passing a parent `Node` during construction. ([#243](../../pull/243))

## [0.1.0](../../compare/v0.0.1...v0.1.0) (2020-05-26)

### Breaking

- [@siteimprove/alfa-scraper](packages/alfa-scraper), [@siteimprove/alfa-cli](packages/alfa-cli): The `Scraper` class has received a much-needed overhaul which has resulted in a couple of breaking changes. The changes also carry over to the CLI; for more information, please see the associated pull requests. ([#226](../../pull/226), [#235](../../pull/235))

- [@siteimprove/alfa-dom](packages/alfa-dom): The `Sheet.JSON` interface now requires a `condition` property. ([#220](../../pull/220))

- [@siteimprove/alfa-highlight](packages/alfa-highlight): The function `highlight()` has been renamed `syntax()` and the `Markers` namespace has been merged with the `Marker` interface. ([#225](../../pull/225))

### Added

- [@siteimprove/alfa-dom](packages/alfa-dom): The `Sheet` class now includes information about media conditions, which can be added to style sheets through `<link rel="stylesheet" media="condition">`. ([#220](../../pull/220))

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R69 and SIA-R82 are now available. ([#228](../../pull/228), [#231](../../pull/231))

- [@siteimprove/alfa-selector](packages/alfa-selector): Support for the pseudo-classes `:hover`, `:active`, `:focus`, and `:root` in addition to the pseudo-elements `::before` and `::after` has been added. ([#238](../../pull/238))

### Changed

- [@siteimprove/alfa-rules](packages/alfa/rules): For rules that deal with `<video>` and `<audio>` elements, the `is-streaming` question has been split into `is-video-streaming` and `is-audio-streaming` to better facilitate messaging. ([#181](../../pull/181))

### Fixed

- [@siteimprove/alfa-cascade](packages/alfa-cascade): Style sheet media conditions are now considered when computing cascade and disabled style sheets are no longer included. ([#220](../../pull/220))

- [@siteimprove/alfa-rules](packages/alfa-rules): Only look for `Element` nodes when determining ownership in SIA-R68. ([#222](../../pull/222))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R45 now fails table cells that reference themselves in the `headers` attribute. ([#224](../../pull/224))

- [@siteimprove/alfa-css](packages/alfa-css): Property declarations that specify the `!important` flag are now correctly parsed. ([#233](../../pull/233))

## [0.0.1](../../compare/v0.0.0...v0.0.1) (2020-04-27)

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R21 now applies to elements with explicit _and_ implicit semantic roles, but no longer applies to elements with `role` values that consist solely of ASCII whitespace. ([#218](../../pull/218))

## [0.0.0](../../releases/tag/v0.0.0) (2020-04-22)

This is the first public of release of Alfa, available for download through [GitHub Packages](../../packages). This release is focused on providing a solid foundation of tools for people and organisations to start testing within their own workflows. Do be aware that as we are still not at a level of API stability where we feel confident in providing compatibility guarantees for future releases, this release, and the ones that follow it throughout this initial version 0, will not be considered stable.

For instructions on how to get up and running with Alfa, be sure to check out the ["Usage" section](../../#usage) of the README.
