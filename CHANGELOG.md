# Changelog

All notable changes to Alfa will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and Alfa adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<details>
<summary><strong>Guidelines for writing changelog entries</strong></summary>

The changelog includes a single entry for every released version of Alfa. Each entry is identified by two pieces of information: The version number and the date, in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format, of the release. The very first entry in the changelog, labelled `[Unreleased]`, includes all upcoming changes for inclusion in the next release.

Each entry may begin with a general description of the changes introduced in the release and must then list each notable change as separate list items. For each item, the following should be included:

- The name of the package affected, as the first point in the item: `[@siteimprove/alfa-<package>](packages/alfa-<package>): <description>`. If more than one package is affected, the package names must be separated by a comma.

- The issue and/or pull request that concerns the change, as the last point in the item and enclosed by parentheses: `<description> ([#<number>](../../issues/<number>))`. If more than one reference is needed, the references must be separated by a comma. All references must be within the same set of parentheses.

Items that are related, such as breaking changes, new features, or changes to existing features, should be grouped under an appropriate heading.

**Note on links:** For all links to repository resources rooted at `https://github.com/<owner>/<repo>`, make sure to use paths relative to `https://github.com/<owner>/<repo>/blob` which is the path from which GitHub [performs autolinking](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/about-readmes#relative-links-and-image-paths-in-readme-files). This helps keeps links short and ensures that they are not tied to a specific owner and repository name in the event that we should move and/or rename the repository. Also, please refrain from using [shortcut reference links](https://github.github.com/gfm/#shortcut-reference-link) as they make it difficult to copy/paste entries to outside the changelog.

</details>

## [Unreleased]

## [0.30.0](../../compare/v0.29.0...v0.30.0) (2022-01-11)

### Breaking

- [@siteimprove/alfa-act](packages/alfa-act), [@siteimprove/alfa-rules](packages/alfa-rules): `Rule`, and associated `alfa-act` types, now use their `QUESTION` type variable to link questions' URI to the expected answer type (instead of just linking the type representation to the type); see the associated Pull Request for details. ([#1018](../issues/1018), [#1020](../pull/1020))

- [@siteimprove/alfa-rules](packages/alfa-rules): Questions now need to be pre-registered by their URI. The parameters of `Question.of` have changed (`type` is not needed, `message` is optional and moved to last). ([#1020](../pull/1020))

- [@siteimprove/alfa-act](packages/alfa-act): Oracles should not anymore wrap their results in `question.answer`; `Interview.conduct` is now doing it automatically. ([#1020](../pull/1020))

- [@siteimprove/alfa-rules](packages/alfa-rules): The `color` type of questions, which was not used, has been removed. ([#1020](../pull/1020))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R82 is now marked as experimental. ([#1020](../pull/1020))


## [0.29.0](../../compare/v0.28.0...v0.29.0) (2022-01-04)

### Added

- [@siteimprove/alfa-assert](packages/alfa-assert): `Assertion.Options` now accepts an `Oracle` to answer questions, and a predicate to filter `cantTell` result (default is to remove all of them). ([#1012](../issues/1012), [#1013](../pull/1013))

## [0.28.0](../../compare/v0.27.0...v0.28.0) (2021-12-14)

### Added

- [@siteimprove/alfa-act](packages/alfa-act): `hasRequirement` now also accepts a predicate as argument. ([#1009](../pull/1009))

- [@siteimprove/alfa-rules](packages/alfa-rules): All rules now have a tag of either `Scope.Component` or `Scope.Page`. ([#993](../issues/993), [#1010](../pull/1010))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-ER62 now considers that a 3:1 contrast ratio between link text and surrounding text is a distinguishing factor. ([#796](../issues/796), [#998](../pull/998))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R109 is now considered as experimental. ([#1006](../pull/1006))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R76 and SIA-R77 are now correctly exported. ([#1006](../pull/1006))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R75 now correctly compares style declarations with reference rather than structural equality. ([#1006](../pull/1006))

## [0.27.0](../../compare/v0.26.0...v0.27.0) (2021-12-08)

### Breaking

- [@siteimprove/alfa-css](packages/alfa-css): The order of horizontal and vertical offsets in the `Shadow` value has been swapped, now matching the order in CSS specifications. ([#1004](../pull/1004))

### Fixed

- [@siteimprove/alfa-aria](packages/alfa-aria): `<input type="image">` elements now accept `title` as a way to provide an accessible name, following specifications and ACT rules test cases. ([#1003](../pull/1003))

## [0.26.0](../../compare/v0.25.0...v0.26.0) (2021-12-03)

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): A family of `Stability` tags has been added, rules tagged with `Stability.Experimental` uses newer features and are subject to change without notice. ([#994](../pull/994))

- [@siteimprove/alfa-wcag](packages/alfa-wcag): A `fromURI` function is now available to retrieve a Success Criterion from its URI. ([#996](../pull/996))

- [@siteimprove/alfa-rules](packages/alfa-rules): Experimental rules ER62 and ER87 have been added. ([#994](../pull/994))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R28 now rejects the default name of "Submit Query" on `<input type="image">` elements. ([#973](../issues/973), [#989](../pull/989))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): The `isClipped` predicate, part of `isVisible`, now correctly jumps to offset parents. ([#887](../issues/887), [#964](../pull/964))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R14 now correctly ignores punctuation. ([#972](../issues/972), [#991](../pull/991))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now accepts differences in `box-shadow` as a distinguishing factor. ([#888](../issues/888), [#967](../pull/967))

- [@siteimprove/alfa-style](packages/alfa-style): Fixed several issues in parsing of `box-shadow`. ([#967](../pull/967))

## [0.25.0](../../compare/v0.24.1...v0.25.0) (2021-11-19)

### Added

- [@siteimprove/alfa-styles](packages/alfa-style): The `cursor` CSS property is now supported. ([#844](../issues/844), [#946](../pull/946))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): Fixed a regression on SIA-R14; it now again consider that non-perceivable text is non-essential and therefore excludes it from labels. ([#983](../pull/983))

## [0.24.1](../../compare/v0.24.0...v0.24.1) (2021-11-12)

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): The extended diagnostic class of SIA-R83 is now `export`ed. ([#981](../pull/981))

## [0.24.0](../../compare/v0.23.2...v0.24.0) (2021-11-12)

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now exports the found clipping ancestors in its diagnostic. ([#976](../pull/976))

- [@siteimprove/alfa-style](packages/alfa-style): The `min-height` and `min-width` CSS properties are now supported. ([#977](../pull/977))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now considers that elements with a font-relative `height`, `width`, `min-height` or `min-width` fully handle the corresponding overflow. ([#977](../pull/977))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 row ignores non-link text which is whitespace only. ([#950](../issues/950), [#965](../pull/965))

- [@siteimprove/alfa-media](packages/alfa-media): Fixed a faulty boundary condition causing inclusive ranges to be matched exclusively and reciprocally. ([#978](../pull/978))

## [0.23.2](../../compare/v0.23.1...v0.23.2) (2021-10-27)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R14 now computes visible labels according to the `innerText` algorithm. ([#833](../issues/833), [#938](../pull/938))

- [@siteimprove/alfa-map](packages/alfa-map): Fixed a rare bug when deleting items in a `Map` could result in some other items becoming unreachable; see the Pull Request for details. ([#962](../pull/962))

## [0.23.1](../../compare/v0.23.0...v0.23.1) (2021-10-15)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R16 now accepts native `<input type="text" list="datalist" />` as valid comboboxes. ([#948](../pull/948))

- [@siteimprove/alfa-style](packages/alfa-style): The `clip` property now correctly computes to `auto` for non absolutely positioned elements. ([#847](../issues/847), [#930](../pull/930))

## [0.23.0](../../compare/v0.22.7...v0.23.0) (2021-10-04)

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): An implementation of SIA-R77 is now available. ([#841](../issues/841), [#923](../pull/923))

- [@siteimprove/alfa-thenable](packages/alfa-thenable): The `Thenable` type now provides the same helper functions as `Promise` and `Future`. ([#935](../pull/935))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now correctly finds clipping ancestors of relatively positioned elements. ([#939](../pull/939))

## [0.22.7](../../compare/v0.22.6...v0.22.7) (2021-09-30)

### Added

- [@siteimprove/alfa-style](packages/alfa-style): The CSS properties `flex-direction` and `flex-flow` are now supported. ([#934](../pull/934))

### Fixed

- [@siteimprove-alfa-rules](packages/alfa-rules): SIA-R91, SIA-R92, and SIA-R93 now correctly handle change of properties between the element containing the declaration and the text. ([#897](../issues/897), [#917](../pull/917))

## [0.22.6](../../compare/v0.22.5...v0.22.6) (2021-09-29)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R21 now targets `role` attributes on elements with no role. ([#895](../issues/895), [#916](../pull/916))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now ignores `overflow` property on `<body>` elements, and consider that containers with `flex-wrap: wrap` definitely handle horizontal overflow. ([#932](../pull/932))

## [0.22.5](../../compare/v0.22.4...v0.22.5) (2021-09-23)

## [0.22.4](../../compare/v0.22.3...v0.22.4) (2021-09-23)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now does not consider that fixed height element can be clipped by an ancestor. ([#928](../pull/928))

## [0.22.3](../../compare/v0.22.2...v0.22.3) (2021-09-20)

## [0.22.2](../../compare/v0.22.1...v0.22.2) (2021-09-20)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now correctly separate detection of horizontal and vertical overflows, correctly considers interposed elements that handle overflow, and correctly restrict text overflow to text nodes parent. ([#908](../issues/908), [#921](../issues/921), [#922](../issues/922), [#924](../pull/924))   

## [0.22.1](../../compare/v0.22.0...v0.22.1) (2021-09-17)

### Fixed

- [@siteimprove/alfa-collection](packages/alfa-collection): The `Indexed#compare()` method is now correctly typed and no longer double wraps its `T` as `Comparable<Comparable<T>>`.

- [@siteimprove/alfa-option](packages/alfa-option), [@siteimprove/alfa-result](packages/alfa-result): The existential methods on `Option<T>` and `Result<T, E>`, such as `#includes()`, `#some()`, and `#every()`, now correctly narrow types.

## [0.22.0](../../compare/v0.21.2...v0.22.0) (2021-09-13)

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R60, SIA-R70, SIA-R76, SIA-R79, and SIA-R109 are now available. ([#869](../../pull/869), [#870](../../pull/870), [#874](../../pull/874), [#901](../../pull/901), [#910](../../pull/910))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `text-align` CSS property. ([#899](../../pull/899))

- [@siteimprove/alfa-act](packages/alfa-act): A type for rhetorical questions, whose answer is contained in the question, is added, together with `Question.answerIf` to conditionally answer questions. ([#903](../../pull/903))

- [@siteimprove/alfa-tuple](packages/alfa-tuple): A package for handling heterogeneous array is now available. ([#894](../../pull/894))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now accepts differences in `text-align` as a distinguishing feature. ([#823](../../issues/823), [#900](../../pull/900))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R10 now isn't applicable on `on`/`off` `autocomplete` attribute; and doesn't check whether the `autocomplete` tokens are appropriate for the `<input>` type. ([#891](../../issues/891), [#911](../../pull/911))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R87 now returns `cantTell` instead of failing automatically when it cannot determine whether the first focusable element is visible on focus. ([#757](../../issues/757), [#902](../../pull/902))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R7 now ignores `lang` attributes that only affect whitespace. ([#892](../../issues/892), [#905](../../pull/905))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R66 and SIA-R69 now return `cantTell` when detecting a non-ancestral background that is asolutely positioned. ([#758](../../issues/758), [#907](../../pull/907))

- [@siteimprove/alfa-aria](packages/alfa-aria): The `value` attribute of `<input>` element is now correctly mapped to `aria-valuenow`. ([#909](../../issues/909), [#913](../../pull/913))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R49 now accepts native `<audio>` and `<video>` control as correct sound control mechanisms. ([#920](../../pull/920))

## [0.21.2](../../compare/v0.21.1...v0.21.2) (2021-08-23)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 no longer fails invisible text nodes, such as whitespace, that it might deem not to wrap properly. ([#898](../../pull/898))

## [0.21.1](../../compare/v0.21.0...v0.21.1) (2021-08-23)

### Changed

- [@siteimprove/alfa-aria](packages/alfa-aria): The role data has been updated based on the WAI-ARIA Editor's Draft of 3 August.

- [@siteimprove/alfa-iana](packages/alfa-iana): The language data has been updated based on the latest version of the IANA language subtag registry.

- [@siteimprove/alfa-wcag](packages/alfa-wcag): The technique and criteria data has been updated based on the WCAG Working Draft of 21 May.

### Fixed

- [@siteimprove/alfa-act](packages/alfa-act): A variance regression in `Rule.Evaluate` has been fixed.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R75 no longer counts empty text nodes as content affected by `font-size`. ([#896](../../pull/896))

## [0.21.0](../../compare/v0.20.0...v0.21.0) (2021-08-20)

### Breaking

- [@siteimprove/alfa-collection](packages/alfa-collection): Previous `Collection<T>` functions that depended on details of `T` are now implemented as methods with constrained `this` types. Please see the associated pull request for more details. ([#865](../../pull/865))

- [@siteimprove/alfa-act](packages/alfa-act): The `Question` class has changed in a backwards incompatible manner to account for the new `Question#context` property. Please see the associated pull request for more details. ([#867](../../pull/867))

### Added

- [@siteimprove/alfa-collection](packages/alfa-collection): `Indexed#takeLastWhile()` and `Indexed#takeWhile()` now accept a `Refinement` for narrowing the type of the taken items. ([#860](../../pull/860))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `text-shadow` CSS property. ([#862](../../pull/862))

- [@siteimprove/alfa-act](packages/alfa-act): The `Question` class now includes a `Question#context` property for cases where a rule want to ask questions about a subject that is different from the associated test target. For these cases, the test target is expected to be passed as `Question#context`. ([#867](../../pull/867))

- [@siteimprove/alfa-act](packages/alfa-act): `Rule#hasRequirement()` and `Rule#hasTag()` are now available in addition to the shared `Scope` tag.

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now accepts distinguishing features on ancestors and descendants of the applicable link. ([#777](../../issues/777), [#860](../../pull/860))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R75 no longers fails elements whose font size does not affect text nodes. ([#810](../../issues/810), [#851](../../pull/851))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R66 and SIA-R69 now yield a `CantTell` outcome when a `text-shadow` is encountered. ([#743](../../issues/743), [#862](../../pull/862))

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` now correctly handles duplicate `id` and `for` attributes. ([#780](../../issues/780), [#781](../../issues/781), [#866](../../pull/866))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now correctly accounts for offset parents when checking for text clipping. ([#824](../../issues/824), [#843](../../pull/843))

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` no longer joins descendant names with a space. ([#889](../../pull/889))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R57 no longer fails text node descendants of the first focusable element in a document. ([#871](../../issues/871), [#880](../../pull/880))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now accepts `background-image` as a distinguishing feature for links. ([#782](../../issues/782), [#875](../../pull/875))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now correctly looks at the inherited `white-space` property of the parent element of text nodes. ([#747](../../issues/747), [#879](../../pull/879))

## [0.20.0](../../compare/v0.19.0...v0.20.0) (2021-07-09)

In addition to the changes listed below, this release adjusts the compile target from `es2018` to `es2020`.

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R54, SIA-R55, and SIA-R78 are now available. ([#834](../../pull/834), [#835](../../pull/835), [#854](../../pull/854))

- [@siteimprove/alfa-scraper](packages/alfa-scraper): The `Scraper#scrape()` methods now accepts an `archive` option for storing an archive of the page scraped. ([#840](../../pull/840))

- [@siteimprove/alfa-cli](packages/alfa-cli): Two new flags, `--archive` and `--archive-format`, are now available in the `alfa scrape` command for storing an archive of the page scraped. ([#840](../../pull/840))

- [@siteimprove/alfa-hash](packages/alfa-hash): `Hash#writeBigInt()`, `Hash#writeBigInt64()`, `Hash#writeBigUint64()`, `Hash#writeUndefined()`, `Hash#writeNull()`,`Hash#writeObject()`, and `Hash#writeSymbol()` are now available. ([#853](../../pull/853))

### Fixed

- [@siteimprove/alfa-aria](packages/alfa-aria): A bug in how names were computed for subtrees and implicitly referenced `<label>` elements has been fixed. ([#808](../../issues/808), [#859](../../pull/859))

- [@siteimprove/alfa-rules](packages/alfa-rules): The contrast ratios output in messages from SIA-R66 and SIA-R69 are now correctly listed as `<bright>:<dark>` rather than `<dark>:<bright>`.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R56 is now correctly exported and available for audits. ([#850](../../pull/850))

- [@siteimprove/alfa-rules](packages/alfa-rules): `isClipped()` now considers elements with a height or width of 0 as clipping if overflow causes scrolling. It now also checks if the ancestors of an element might cause it to clip. ([#731](../../issues/731), [#774](../../issues/774), [#827](../../pull/827), [#848](../../pull/848))

## [0.19.0](../../compare/v0.18.0...v0.19.0) (2021-06-15)

### Breaking

- [@siteimprove/alfa-rules](packages/alfa-rules): The second expectation of SIA-R62 has been removed due to poor accuracy. ([#772](../../pull/772))

- [@siteimprove/alfa-style](packages/alfa-style): The `background-size` property is now specified as and computes to a `Tuple` instance rather than a plain array tuple. ([#788](../../pull/788))

### Added

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `text-decoration-thickness` and `font-variant-*` CSS properties. ([#817](../../pull/817), [#821](../../pull/821))

- [@siteimprove/alfa-rules](packages/alfa-rules): An implementation of SIA-R56 is now available. ([#829](../../pull/829))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now accepts differences in font weight as a valid distinguishing feature for links. ([#779](../../pull/779))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R65 now accepts differences in borders as a valid focus indicator. ([#819](../../pull/819))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R66 and SIA-R69 now return a `CantTell` outcome for targets for which a `background-size` is found. ([#789](../../pull/789))

- [@siteimprove/alfa-rules](packages/alfa-rules): `hasRole()` now uses the role assigned to an element in the accessibility tree rather than just using `Role.from()`. ([#805](../../pull/805))

### Fixed

- [@siteimprove/alfa-css](packages/alfa-css): Functional pseudo-classes and -elements now correctly implement `#equals()` and `#toString()`. ([#773](../../pull/773))

- [@siteimprove/alfa-aria](packages/alfa-aria): The first step of `Name.from()` is now correctly skipped when descending into child nodes. Additionally, descendant names that only consist of whitespace are no longer included. ([#778](../../pull/778), [#831](../../pull/831))

- [@siteimprove/alfa-style](packages/alfa-style): The `background-size` property is now parsed correctly according to specification. ([#788](../../pull/788))

## [0.18.0](../../compare/v0.17.0...v0.18.0) (2021-06-11)

### Breaking

- [@siteimprove/alfa-graph](packages/alfa-graph), [@siteimprove/alfa-network](packages/alfa-network): Several breaking changes have been made to the `Graph` and `Network` types. Please see the associated pull request for more details. ([#765](../../pull/765))

- [@siteimprove/alfa-highlight](packages/alfa-highlight): The `syntax()` function has been removed. ([#764](../../pull/764))

- [@siteimprove/alfa-json-ld](packages/alfa-json-ld): Several unused APIs have been removed. Please see the associated pull request for more details. ([#766](../../pull/766))

### Added

- [@siteimprove/alfa-graph](packages/alfa-graph), [@siteimprove/alfa-network](packages/alfa-network): `Graph#isEmpty()`, `Network#isEmpty()`, `Graph#path()`, `Network#path()`, `Graph#reverse()`, `Network#reverse()`, `Graph#sort()`, and `Network#sort()` are now available. ([#765](../../pull/765))

## [0.17.0](../../compare/v0.16.2...v0.17.0) (2021-04-13)

### Breaking

- [@siteimprove/afa-style](packages/alfa-style): The type of the `display` has changed from a plain tuple to the `Tuple` class. ([#763](../../pull/763))

### Added

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `border-*` shorthand CSS properties. Full support for the new logical CSS properties, such as `border-block-*`, is still an area of investigation. ([#754](../../pull/754))

- [@siteimprove/alfa-thenable](packages/alfa-thenable): A new package is now available with types for modelling values that can be used in `await` expressions.

- [@siteimprove/alfa-css](packages/alfa-css): Radial gradients are now available as a type of `Gradient`. ([#438](../../pull/438))

### Changed

- [@siteimprove/alfa-formatter-earl](packages/alfa-formatter-earl), [@siteimprove/alfa-formatter-sarif](packages/alfa-formatter-sarif): The EARL and SARIF formatters now output additional vendor data. ([#753](../../pull/753))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 is now a fully automated rule and will therefore no longer pose questions during an audit. ([#760](../../pull/760))

### Fixed

- [@siteimprove/alfa-scraper](packages/alfa-scraper): Some previously uncaught exceptions during page navigation are now caught and handled, resolving an issue where the scraper wouldn't terminate in rare cases.

- [@siteimprove/alfa-style](packages/alfa-style): The `display` property now supports the full grammar as specified by CSS. ([#763](../../pull/763))

## [0.16.2](../../compare/v0.16.1...v0.16.2) (2021-03-31)

This release contains only internal API changes.

## [0.16.1](../../compare/v0.16.0...v0.16.1) (2021-03-30)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R6 now correctly checks for structural, not referential, equality of language tags. Prior to v0.16.0, the rule relied on the undocumented implementation detail that language tags were only constructed once.

## [0.16.0](../../compare/v0.15.3...v0.16.0) (2021-03-30)

### Breaking

- [@siteimprove/alfa-assert](packages/alfa-assert): `Handler.persist()` is no longer available as it broke the ability to bundle the package using certain tools due to the dependence on Node.js.

### Added

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `border-*` longhand CSS properties. Full support for the new logical CSS properties, such as `border-block-*`, is still an area of investigation. ([#718](../../pull/718))

### Changed

- [@siteimprove/alfa-aria](packages/alfa-aria): `<p>` elements now have an implicit role of `paragraph`. ([#750](../../pull/750))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now targets links inside an element with a role of `paragraph`; SIA-R71, SIA-R72, SIA-R73, and SIA-R85 now target elements with a role of `paragraph`. ([#750](../../pull/750))

### Fixed

- [@siteimprove/alfa-aria](packages/alfa-aria): Roles that prohibit naming are now correctly considered when referenced by `aria-labelledby`. ([#750](../../pull/750))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R74 and SIA-R80 now only target text inside elements with a role of `paragraph`. ([#750](../../pull/750))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R68 now correctly passes cases where an element contains more than 1 required owned element, but the first owned element is not required.

- [@siteimprove/alfa-aria](packages/alfa-aria), [@siteimprove/alfa-css](packages/alfa-css), [@siteimprove/alfa-dom](packages/alfa-dom), [@siteimprove/alfa-iana](packages/alfa-iana), [@siteimprove/alfa-style](packages/alfa-style): Circular imports between modules in these packages were previously causing some bundlers to hoist the modules in incorrect order, leading to panics at runtime. This has now been fixed.

## [0.15.3](../../compare/v0.15.2...v0.15.3) (2021-03-23)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): `isClipped()` now correctly handles percentage dimensions when combined with `overflow-{x,y}: hidden`.

## [0.15.2](../../compare/v0.15.1...v0.15.2) (2021-03-18)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): Fix a panic in SIA-R66 and SIA-R69 when background colors cannot be determined.

## [0.15.1](../../compare/v0.15.0...v0.15.1) (2021-03-17)

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): `isClipped()` now correctly handles text nodes of clipped elements.

- [@siteimprove/alfa-cypress](packages/alfa-cypress): `Cypress.createPlugin()` no longer creates an asynchronous Chai plugin, which was causing assertion errors to not count as test failures.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R84 now only applies to elements that are possibly scrollable along the x-axis if they also specify `white-space: nowrap`. ([#746](../../pull/746))

- [@siteimprove/alfa-rules](packages/alfa-rules): `isClipped()` now correctly handles cases where only one of `width` or `height` has been set to `0` and only one of `overflow-x` or `overflow-y` set to `hidden`. Either of these cases will cause a block to collapse and its contents be hidden.

- [@siteimprove/alfa-selector](packages/alfa-selector): CSS pseudo-elements are now parsed, thus preventing the parser from entirely dropping declaration containing one of them. ([#745](../../pull/754))

## [0.15.0](../../compare/v0.14.2...v0.15.0) (2021-03-15)

### Breaking

- [@siteimprove/alfa-cypress](packages/alfa-cypress): The Cypress integration now uses a Chai plugin as its main entry point rather than a custom command. For more information, please see the associated pull request. ([#740](../../pull/740))

### Added

- [@siteimprove/alfa-trampoline](packages/alfa-trampoline): `Trampoline<T>` now provides an implementation of `Foldable<T>` and `Applicative<T>`.

- [@siteimprove/alfa-result](packages/alfa-result): `Result<T, E>` now provides an implementation of `Applicative<T>`.

- [@siteimprove/alfa-future](packages/alfa-future): `Future<T>` now provides an implementation of `Applicative<T>`.

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): `isTransparent()` now correctly handles text nodes of transparent elements. ([#741](../../pull/741))

- [@siteimprove/alfa-style](packages/alfa-style): The `font-family` property now correctly parses font families specified as whitespace-separated idents. ([#742](../../pull/742))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R84 no longer considers elements with `overflow: clip` as possibly scrollable. ([#744](../../pull/744))

## [0.14.2](../../compare/v0.14.1...v0.14.2) (2021-03-11)

### Fixed

- [@siteimprove/alfa-dom](packages/alfa-dom): The `@siteimprove/alfa-dom/jsx-runtime` module has been fixed and now correctly exposes the `jsx()`, `jsxs()`, and `jsxDEV()` entries.

## [0.14.1](../../compare/v0.14.0...v0.14.1) (2021-03-10)

### Fixed

- [@siteimprove/alfa-cheerio](packages/alfa-cheerio): The package now compiles correctly when the `esModuleInterop` compiler option is used.

## [0.14.0](../../compare/v0.13.0...v0.14.0) (2021-03-10)

### Breaking

- [@siteimprove/alfa-scraper](packages/alfa-awaiter): The `Awaiter` type has been simplified and now only returns either an error or no error. ([#737](../../pull/737))

### Added

- [@siteimprove/alfa-continuation](packages/alfa-continuation): `Continuation<T, R>` now accepts a third type parameter, `A`, denoting additional arguments passed to the continuation.

- [@siteimprove/alfa-promise](packages/alfa-promise): A new package has been added with funcitonality for working with promises.

- [@siteimprove/alfa-dom](packages/alfa-dom): A new `@siteimprove/alfa-dom/jsx-runtime` module is now available for compatibility with the new importless JSX mode.

- [@siteimprove/alfa-scraper](packages/alfa-scraper): A new awaiter, `Awaiter.animations()`, is now available. This awaiter polls the document for active animations and resolves when no animations are active. Additionally, a new option, `fit: boolean`, is now available in `Scraper#scrape()`. When set, which it is by default, the viewport will expand to fit the contents of the page. This is needed to accurately scrape pages that toggle content depending on scroll position. ([#737](../../pull/737))

- [@siteimprove/alfa-cli](packages/alfa-cli): Two new flags, `--await-animations` and `--[no-]fit` are now available in the `alfa scrape` command. These flags reflect the corresponding features in the scraper. ([#737](../../pull/737))

### Changed

- [@siteimprove/alfa-branched](packages/alfa-branched), [@siteimprove/alfa-future](packages/alfa-future), [@siteimprove/alfa-trampoline](packages/alfa-trampoline): The mapper passed to `Branched.traverse()`, `Future.traverse()`, and `Trampoline.traverse()` is now passed the index of the value being processed.

### Fixed

- [@siteimprove/alfa-array](packages/alfa-array), [@siteimprove/alfa-json](packages/alfa-json), [@siteimprove/alfa-promise](packages/alfa-promise), [@siteimprove/alfa-url](packages/alfa-url): Avoid redefining the `global` variable used in certain environments, such as Jest.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R66 and SIA-R69 now correctly compute foreground colors in presence of an `opacity` attribute. ([#739](../../pull/739))

## [0.13.0](../../compare/v0.12.0...v0.13.0) (2021-03-05)

### Breaking

- [@siteimprove/alfa-aria](packages/alfa-aria): `Role#requiredParent()` now returns `Iterable<Iterable<Role.Name>>` to make it possible to model the nested parent requirements that have been introduced in the Editor's Draft of WAI-ARIA. ([#728](../../pull/728))

### Added

- [@siteimprove/alfa-selective](packages/alfa-selective): `Selective.exhaust()` is now available in addition to an implementation of `Monad<T>` for `Selective<S, T>`.

- [@siteimprove/alfa-css](packages/alfa-css): `Unit.Length.Relative.Font` and `Unit.Length.Relative.Viewport` are now available for distinguishing between font and viewport relative lengths. In addition, `Unit.isFontRelativeLength()`, `Unit.isViewportRelativeLength()`, `Length#isFontRelative()`, and `Length#isViewportRelative()` are now also available. ([#734](../../pull/734))

- [@siteimprove/alfa-selector](packages/alfa-selector): `Selector` subclasses now have type guard functions, and `Selector#type` is now available. ([#732](../../pull/732))

- [@siteimprove/alfa-collection](packages/alfa-collection): `Indexed#reduceWhile()`, `Indexed#reduceUntil()`, and `Indexed#zip()` are now available.

- [@siteimprove/alfa-array](packages/alfa-array): `Array.reduceWhile()`, `Array.reduceUntil()`, and `Array.zip()` are now available.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.reduceWhile()`, `Iterable.reduceUntil()`, and `Iterable.zip()` are now available.

- [@siteimprove/alfa-playwright](packages/alfa-playwright): A new package has been added with conversion functions for the Playwright browser automation framework.

### Changed

- [@siteimprove/alfa-aria](packages/alfa-aria): We now track the latest Editor's Draft of WAI-ARIA, which contains several fixes already implemented by browsers and assistive technologies. ([#728](../../pull/728))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 has been limited to testing cases where a non-inline, non-font relative `height` is likely to cause text to clip when text scale is increased. This was, based on much feedback, the most common case for true positives. Cases with `white-space: nowrap` are also still tested. ([#734](../../pull/734))

- [@siteimprove/alfa-selector](packages/alfa-selector): `Selector#equals()` avoids narrowing to `never` when used on a different `Selector`. ([#732](../../pull/732))

- [@siteimprove/alfa-scraper](packages/alfa-scraper): `Scraper.scrape()` now correctly sets the viewport height to the specified device height instead of its width.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R87 now automatically passes if a skip link references an element "at the start" of an element with a role of `main`. ([#735](../../pull/735))

## [0.12.0](../../compare/v0.11.0...v0.12.0) (2021-02-26)

### Breaking

- [@siteimprove/alfa-media](packages/alfa-media): A new `Media.Value` type has been introduced and is now used for the `Feature#value` property. The new type is used for modelling both discrete and range values which was not previously possible. Additionally, the `Media.Condition` type has been split into `Media.And` and `Media.Or`, and `Media.Negation` has been renamed `Media.Not`. `Media.Condition` is now an alias for `Media.And | Media.Or | Media.Not`. ([#722](../../pull/722))

- [@siteimprove/alfa-act](packages/alfa-act): The `Oracle<Q>` type has now become `Oracle<I, T, Q>`. As such, the input type `I` and test target type `T` must now be declared up front. Additionally, the `Question<Q, A, S, T>` type has now become `Question<Q, S, A, T>` to ensure alignment with the remaining types of the package. ([#699](../../pull/699))

- [@siteimprove/alfa-cli](packages/alfa-cli): The `--interactive` flag of the `alfa audit` command has been removed. A new `--interviewer` flag has instead been made available which allows callers to point to an `Interviewer` implementation for answering questions during an audit. ([#255](../../issues/255), [#699](../../pull/699))

- [@siteimprove/alfa-hash](packages/alfa-hash): The `Hash` type is now an abstract class with methods for hashing specific types of input. Additionally, `Hashable.hash()` has been removed and `Hash#writeUnknown()` introduced as a replacement. ([#670](../../pull/670))

### Added

- [@siteimprove/alfa-media](packages/alfa-media): The new range syntax for media features, such as `100px < width <= 900px`, is now supported. ([#109](../../issue/109), [#722](../../pull/722))

- [@siteimprove/alfa-css](packages/alfa-css): The `Dimension` and `Numeric` types now provide implementations of `Comparable`. The `Dimension#canonicalUnit` property is now also available to facilitate comparisons between units of same dimensional type. ([#722](../../pull/722))

- [@siteimprove/alfa-interviewer](packages/alfa-interviewer): A new package has been added with types for modelling ACT rule interviewers and functionality for loading these from external and local modules. ([#699](../../pull/699))

### Fixed

- [@siteimprove/alfa-media](packages/alfa-media): Several issues related to parsing and matching of media queries have been fixed. ([#722](../../pull/722))

- [@siteimprove/alfa-rules](packages/alfa-rules): Accessible names are now also considered empty when they consist exclusively of whitespace.

- [@siteimprove/alfa-style](packages/alfa-style): `var()` functions now accept spaces around variable names. ([#725](../../pull/725))

- [@siteimprove/alfa-style](packages/alfa-style): The source of inherited property values are no longer overwritten by the source of the `inherit` declaration.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R41 and SIA-R81 now correctly normalize computed accessible names.

## [0.11.0](../../compare/v0.10.0...v0.11.0) (2021-02-23)

### Breaking

- [@siteimprove/alfa-css](packages/alfa-css): `Lexer.lex()` now returns `Slice<Token>` as the returned array would always be wrapped in a slice by the caller.

- [@siteimprove/alfa-selector](packages/alfa-selector): `Selector.parse()` is now an instance of `Parser<Slice<Token>, Selector, string>` to allow it being used in parser combinators.

- [@siteimprove/alfa-media](packages/alfa-media): `Media.parse()` is now an instance of `Parser<Slice<Token>, Media.List, string>` to allow it being used in parser combinators.

- [@siteimprove/alfa-cache](packages/alfa-cache): `Cache<K, V>` now requires that `K` be an object type.

### Added

- [@siteimprove/alfa-predicate](packages/alfa-predicate): `Predicate.tee()` is now available.

- [@siteimprove/alfa-result](packages/alfa-result): `Result#tee()` and `Result#teeErr()` are now available.

- [@siteimprove/alfa-parser](packages/alfa-parser): `Parser.Infallible<I, T, A>`, `Parser.teeErr()`, `Parser.reject()`, `Parser.end()`, `Parser.takeBetween()`, `Parser.takeAtLeast()`, and `Parser.takeAtMost()` are now available. Additionally, `Parser.eof()` has been deprecated.

- [@siteimprove/alfa-array](packages/alfa-array): `Array.forEach()`, `Array.map()`, `Array.flatMap()`, `Array.flatten()`, `Array.filter()`, `Array.reject()`, `Array.includes()`, `Array.collect()`, `Array.collectFirst()`, `Array.some()`, `Array.none()`, `Array.every()`, `Array.count()`, `Array.distinct()`, `Array.allocate()`, `Array.apply()`, `Array.get()`, `Array.set()`, `Array.has()`, `Array.concat()`, `Array.subtract()`, `Array.intersect()`, `Array.first()`, `Array.last()`, and `Array.iterator()` are now available.

- [@siteimprove/alfa-json](packages/alfa-json): `JSON.parse()` and `JSON.stringify()` are now available.

- [@siteimprove/alfa-trampoline](packages/alfa-trampoline): `Trampoline#tee()` and `Trampoline.empty()` are now available.

- [@siteimprove/alfa-either](packages/alfa-either): `Either<L, R>` now provides an implementation of `Hashable`.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-sequence](packages/alfa-sequence): `Indexed#takeLastWhile()`, `Indexed#takeLastUntil()`, `Indexed#skipLastWhile()`, `Indexed#skipLastUntil()`, `Indexed#trim()`, `Indexed#trimLeading()`, and `Indexed#trimTrailing()` are now available and implemented by `List` and `Sequence`.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-map](packages/alfa-map), [@siteimprove/alfa-sequence](packages/alfa-sequence), [@siteimprove/alfa-set](packages/alfa-set), [@siteimprove/alfa-slice](packages/alfa-slice): `Keyed#subtract()`, `Keyed#intersect()`, `Unkeyed#subtract()`, `Unkeyed#intersect()`, `Indexed#subtract()`, and `Indexed#intersect()` are now available and implemented by `List`, `Map`, `Sequence`, `Set`, and `Slice`.

- [@siteimprove/alfa-slice](packages/alfa-slice): `Slice<T>` now provides an implementation of `Collection.Indexed<T>`

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.apply()`, `Iterable.set()`, `Iterable.insert()`, `Iterable.append()`, `Iterable.prepend()`, and `Iterable.iterator()` are now available.

- [@siteimprove/alfa-comparable](packages/alfa-comparable): `Comparable.isLessThan()`, `Comparable.isLessThanOrEqual()`, `Comparable.isGreaterThan()`, and `Comparable.isGreaterThanOrEqual()` are now available.

- [@siteimprove/alfa-network](packages/alfa-network): A package has been added with an implementation of an immutable, directed graph that allows for multiple, unique edges. ([#696](../../pull/696))

- [@siteimprove/alfa-sarif](packages/alfa-sarif): A package has been added with types for working with SARIF serialisable structures. ([#694](../../pull/694))

### Changed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R65 now automatically accepts difference in `background-color` or `color`, and presence/absence of a `box-shadow` as a valid focus indicator. ([#658](../../issues/658), [#713](../../pull/713), [#714](../../pull/714), [#715](../../pull/715))

### Fixed

- [@siteimprove/alfa-css](packages/alfa-css): `Linear.parse()` now correctly parses gradient sides and corners specified as `bottom`.

- [@siteimprove/alfa-rules](packages/alfa-rules): `isVisible()` now correctly considers elements with large negative text indents and no `white-space: nowrap` as hidden.

- [@siteimprove/alfa-aria](packages/alfa-aria): `Node.from()` now correctly handles children of elements with roles that designate their children as presentational.

- [@siteimprove/alfa-cascade](packages/alfa-cascade): The user agent styles now include previously missing definitions for form controls.

- [@siteimprove/alfa-url](packages/alfa-url): `URL#toString()` now correctly serializes URLs that cannot be used as base URLs. ([#459](../../issues/459), [#676](../../pull/676))

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` now gives priority to the subtree over the `title` attribute for `<a>` elements. ([#669](../../issues/669), [#716](../../pull/716))

- [@siteimprove/alfa-style](packages/alfa-style): The `display` property now correctly parses the `inline-block`, `inline-table`, `inline-flex`, and `inline-grid` values.

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` now correctly handles self-referencing `aria-labelledby` attributes. ([#717](../../issues/717))

## [0.10.0](../../compare/v0.9.0...v0.10.0) (2021-01-29)

### Breaking

- [@siteimprove/alfa-assert](packages/alfa-assert): The package has been reworked to solve several long-standing issues in its design. This also affects all the integration packages that make use of this package. For more information, please see the associated issue and pull request. ([#270](../../issues/270), [#287](../../pull/287))

### Added

- [@siteimprove/alfa-array](packages/alfa-array): `Array.reduce()` is now available.

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R66 and SIA-R96 are now available. ([#665](../../pull/665), [#666](../../pull/666))

- [@siteimprove/alfa-protractor](packages/alfa-protractor): A new package has been added with conversion functions for the Protractor browser automation framework. ([#428](../../pull/428))

### Changed

- [@siteimprove/alfa-css](packages/alfa-css): The `Value.JSON` type is now optionally parametric. ([#667](../../pull/667))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): The `isVisible()` function now correctly accounts for content and text hidden by offscreening and text indents that cause full clipping. ([#519](../../issues/519), [#524](../../issues/524), [#616](../../pull/616))

## [0.9.0](../../compare/v0.8.0...v0.9.0) (2021-01-21)

In addition to the changes listed below, this release adjusts the compile target from `es2017` to `es2018`.

### Breaking

- [@siteimprove/alfa-dom](packages/alfa-dom): `Attribute#hasName()` has been removed in favor of `Attribute.hasName()`.

- [@siteimprove/alfa-array](packages/alfa-array), [@siteimprove/alfa-branched](packages/alfa-branched), [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-either](packages/alfa-either), [@siteimprove/alfa-iterable](packages/alfa-iterable), [@siteimprove/alfa-lazy](packages/alfa-lazy), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-map](packages/alfa-map), [@siteimprove/alfa-option](packages/alfa-option), [@siteimprove/alfa-record](packages/alfa-record), [@siteimprove/alfa-result](packages/alfa-result), [@siteimprove/alfa-sequence](packages/alfa-sequence), [@siteimprove/alfa-set](packages/alfa-set), [@siteimprove/alfa-slice](packages/alfa-slice): The `#toJSON()` methods of all container types, `Type<T>`, are now parametric, ensuring deep strongly typed JSON serialisation. ([#644](../../pull/644))

- [@siteimprove/alfa-css](packages/alfa-css): The `Position` value type has been reworked to fix some outstanding issues with `Position.parse()`. This has resulted in a few breaking API changes, such as reordered type parameters (`Position<V, H>` is now `Position<H, V>`). For more information, please see the associated pull request. ([#650](../../pull/650))

### Added

- [@siteimprove/alfa-array](packages/alfa-array): `Array.find()`, `Array.findLast()`, `Array.insert()`, `Array.append()`, and `Array.prepend()` are now available.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.findLast()` is now available.

- [@siteimprove/alfa-future](packages/alfa-future): `Future#tee()` and `Future.empty()` are now available.

- [@siteimprove/alfa-callback](packages/alfa-callback): `Callback.contraMap()` is now available.

- [@siteimprove/alfa-functor](packages/alfa-functor): `Functor.Invariant<T>` is now available.

- [@siteimprove/alfa-emitter](packages/alfa-emitter): A new package has been added with an implementation of a strongly typed event emitter.

- [@siteimprove/alfa-dom](packages/alfa-dom): `Element#qualifiedName` and `Attribute#qualifiedName` are now available.

- [@siteimprove/alfa-cli](packages/alfa-cli): Two new flags, `--cpu-profile` and `--heap-profile`, are now available in the `alfa audit` command. ([#640](../../pull/640))

- [@siteimprove/alfa-performance](packages/alfa-performance): A new package has been added with functionality for working with performance measurements. ([#643](../../pull/643))

- [@siteimprove/alfa-rules](packages/alfa-rules): An implementation of SIA-R95 is now available. ([#654](../../pull/654))

- [@siteimprove/alfa-act](packages/alfa-act): `Audit#evaluate()` now accepts a `Performance` instance for measuring rule durations. ([#656](../../pull/656))

### Fixed

- [@siteimprove/alfa-style](packages/alfa-style): The `display` property now correctly parses the `flow`, `flow-root`, `table`, `flex`, `grid`, and `ruby` values.

- [@siteimprove/alfa-xpath](packages/alfa-xpath): The `evaluate()` function now correctly respects passed `Node.Traversal` options.

- [@siteimprove/alfa-json](packages/alfa-json): Drop `undefined` property values when serializing JSON objects rather than convert them to `null` values.

- [@siteimprove/alfa-table](packages/alfa-table): `Table.from()` no longer panics when tables contain invalid elements.

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` now behaves correctly when computing names of elements that are named by their contents, but contain children that aren't.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): The `index` parameter in `Iterable.map()` now correctly increments.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R14 now correctly assumes that non-essential text is imperceivable. ([#648](../../pull/648))

- [@siteimprove/alfa-rules](packages/alfa-rules): `isRendered()` now behaves correctly in the presence of embedded documents. ([#653](../../pull/653))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R48 and SIA-R49 now correctly assume that `<audio>` elements have audio. ([#662](../../pull/662))

## [0.8.0](../../compare/v0.7.0...v0.8.0) (2021-01-06)

### Breaking

- [@siteimprove/alfa-table](packages/alfa-table): The package has been reworked to solve several long-standing issues in its design. For more information, please see the associated pull request. ([#581](../../pull/581))

### Added

- [@siteimprove/alfa-array](packages/alfa-array): A new package has been added with functionality for working with arrays.

- [@siteimprove/alfa-callback](packages/alfa-callback): `Callback<T, R>` now accepts a third type parameter, `A`, denoting additional arguments passed to the callback.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.forEach()`, `Iterable.none()`, `Iterable.compare()`, `Iterable.compareWith()`, and `Iterable.toJSON()` are now available.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-branched](alfa-branched), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-map](packages/alfa-map), [@siteimprove/alfa-set](packages/alfa-set), [@siteimprove/alfa-sequence](packages/alfa-sequence): `Collection#forEach()` and `Collection#none()` are now available and implemented by `Branched`, `List`, `Map`, `Set`, and `Sequence`.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-sequence](packages/alfa-sequence): `Indexed#compareWith()` is now available and implemented by `List` and `Sequence`. In addition, `Collection.sort()`, `Collection.compare()`, `List.compare()`, and `Sequence.compare()` are also available.

- [@siteimprove/alfa-option](packages/alfa-option): `Option.compare()` is now available.

- [@siteimprove/alfa-clone](packages/alfa-clone): `Clone.clone()` is now available.

- [@siteimprove/alfa-json](packages/alfa-json): `Serializable` now accepts a type parameter, `T extends JSON`, denoting the precise JSON type that implementations serialize to.

- [@siteimprove/alfa-earl](packages/alfa-earl): `Serializable` now accepts a type parameter, `T extends EARL`, denoting the precise EARL type that implementations serialize to.

- [@siteimprove/alfa-comparable](packages/alfa-comparable): `Comparable.compare()` now provides overloads for `string`, `number`, `bigint`, and `boolean` in addition to `Comparable<T>`.

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R90, SIA-R91, SIA-R92, SIA-R93, and SIA-R94 are now available. ([#586](../../pull/586), [#592](../../pull/592), [#609](../../pull/609))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `letter-spacing` and `word-spacing` CSS properties. ([#587](../../pull/587))

- [@siteimprove/alfa-act](packages/alfa-act), [@siteimprove/alfa-rules](packages/alfa-rules), [@siteimprove/alfa-wcag](packages/alfa-wcag): ACT rules may now list their requirements and a new package has been added that models WCAG success criteria and techniques. Existing rules now list associated success criteria and techniques. ([#299](../../pull/299))

### Changed

- [@siteimprove/alfa-selector](packages/alfa-selector): The `context` argument in `Selector#matches()` is now optional.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R62 now requires that all link states (unset, `:hover`, and `:focus`) be distinguishable.

- [@siteimprove/alfa-rules](packages/alfa-rules): The second expectation of SIA-R87 has been merged with the first. ([#629](../../pull/629))

### Fixed

- [@siteimprove/alfa-sequence](packages/alfa-sequence): `Sequence#size` is now stack safe and no longer overflows for long sequences.

- [@siteimprove/alfa-rules](packages/alfa-rules): `isVisible()` no longer considers elements with no visible children as visible. ([#549](../../pull/549), [#624](../../pull/624))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R41 and SIA-R81 now automatically passes links with references that resolve to the same URL. ([#567](../../pull/567))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now assumes a used value of `1.2` for `line-height: normal`. ([#566](../../pull/566))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R53 and SIA-R61 now correctly ignore headings not in the accessibility tree. ([#577](../../pull/577), [#589](../../pull/589))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R84 now more accurately determines if elements are possibly scrollable. ([#588](../../pull/588), [#618](../../pull/618))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R46 now accepts header cells that are themselves assigned to other header cells. ([#607](../../pull/607))

- [@siteimprove/alfa-selector](packages/alfa-selector): Matching of `:nth-*` selectors no longer degrades to quadratic complexity for certain input. ([#600](../../pull/600))

- [@siteimprove/alfa-style](packages/alfa-style): Explicit `initial` property values are now correctly assigned a source declaration. ([#637](../../pull/637))

## [0.7.0](../../compare/v0.6.0...v0.7.0) (2020-11-20)

### Breaking

- [@siteimprove/alfa-formatter](packages/alfa-formatter): The list of relevant rules are now expected to be passed as the second argument to the `Formatter<I, T, Q>` type. ([#439](../../pull/439))

### Added

- [@siteimprove/alfa-rules](packages/alfa-rules): Implementations of SIA-R62 and SIA-R65 are now available. ([#497](../../pull/497), [#538](../../pull/538))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `text-decoration-*`, `text-indent`, `position`, `top`, `right`, `bottom`, `left`, `inset-line-*`, and `inset-block-*` CSS properties. ([#511](../../pull/511), [#539](../../pull/539), [#541](../../pull/541), [#542](../../pull/542))

### Fixed

- [@siteimprove/alfa-cascade](packages/alfa-cascade): Fix faulty ancestor filtering that resulted in complex selectors never matching when computing cascade.

- [@siteimprove/alfa-aria](packages/alfa-aria): Elements, and descendants of elements, with `aria-hidden=true` are no longer included when computing accessible names unless explicitly referenced through `aria-labelledby`. ([#527](../../pull/527))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 now checks overflow handling of the clipping ancestor rather than the immediate parent of each applicable text node. ([#540](../../pull/540))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R10 no longer applies to disabled form controls. ([#516](../../issues/516), [#554](../../pull/554))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R16 no longer applies to elements not in the accessibility tree. ([#523](../../issues/523), [#555](../../pull/555))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R45 no longer applies to elements with a presentational role. ([#521](../../issues/521), [#556](../../pull/556))

## [0.6.0](../../compare/v0.5.0...v0.6.0) (2020-10-30)

### Breaking

- [@siteimprove/alfa-predicate](packages/alfa-predicate): The `Predicate<T>` type now no longer duals as a refinement type. This behavior has instead been split out into the new `Refinement<T, U extends T>` type. This also means that none of the functions on the `Predicate` namespace will perform type narrowing. Instead, an equivalent function on the `Refinement` namespace should be used if type narrowing is desired. ([#415](../../pull/415))

- [@siteimprove/alfa-http](packages/alfa-http): `Request#url` and `Response#url` now return `URL` instances rather than strings. ([#421](../../pull/421))

- [@siteimprove/alfa-frontier](packages/alfa-frontier), [@siteimprove/alfa-scraper](packages/alfa-scraper): `Frontier` and `Scraper` now work on `URL` instances from the @siteimprove/alfa-url package rather than WHATWG URL instances. ([#421](../../pull/421))

### Added

- [@siteimprove/alfa-refinement](packages/alfa-refinement): A new package has been added with functionality for working with refinement types, also known as type guards in TypeScript. ([#415](../../pull/415))

- [@siteimprove/alfa-url](packages/alfa-url): A new package has been added with an implementation of an immutable URL representation. ([#421](../../pull/421))

- [@siteimprove/alfa-result](packages/alfa-result): `Result` now provides an implementation of `Hashable`. `Result#includes()`, `Result#includesErr()`, `Result#some()`, `Result#someErr()`, `Result#none()`, `Result#noneErr()`, `Result#every()`, and `Result#everyErr()` are now also available.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.takeLastWhile()`, `Iterable.takeLastUntil()`, `Iterable.skipLastWhile()`, `Iterable.skipLastUntil()`, `Iterable.trimLeading()`, `Iterable.trimTrailing()`, `Iterable.trim()`, `Iterable.hash()`, `Iterable.sort()`, and `Iterable.sortWith()` are now available.

- [@siteimprove/alfa-comparable](packages/alfa-comparable): A `Comparer` type is now available for modelling functions that do comparisons. A new function `Comparable.isComparable()` is now also available.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-sequence](packages/alfa-sequence): `Indexed#sortWith()` is now available and implemented by `List` and `Sequence`. Additionally, `List.sort()` and `Sequence.sort()` are now also available.

- [@siteimprove/alfa-option](packages/alfa-option): `Option#compareWith()` is now available.

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the `box-shadow` and `outline-*` CSS properties. ([#481](../../pull/481), [#496](../../pull/496))

- [@siteimprove/alfa-style](packages/alfa-style): `Value#includes()`, `Value#some()`, and `Value#none()` are now available. ([#468](../../pull/468))

- [@siteimprove/alfa-rules](packages/alfa-rules): An implementation of SIA-R87 is now available. ([#468](../../pull/468))

- [@siteimprove/alfa-dom](packages/alfa-dom): `Node#tabOrder()` is now available. ([#468](../../pull/468))

- [@siteimprove/alfa-css](packages/alfa-css): `Color.isTransparent()` and `Length.isZero()` are now available.

### Changed

- [@siteimprove/alfa-option](packages/alfa-option): `Some#hash()` and `None#hash()` now write a marker byte to prevent some avoidable collisions.

- [@siteimprove/alfa-sequence](packages/alfa-sequence): `Nil#hash()` now writes a size of 0 to prevent some avoidable collisions.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R57 now only applies when at least one landmark is found one the page. ([#414](../../pull/414))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R15 now automatically passes `<iframe>` elements that definitely point to the same resource. ([#406](../../pull/406))

### Fixed

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R14 now only applies to focusable widgets with either an `aria-label` or `aria-labelledby` attribute, as intended. ([#409](../../pull/409))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R68 now correctly excludes descendants of containers with an `aria-busy=true` attribute. ([#418](../../pull/418))

- [@siteimprove/alfa-rules](packages/alfa-rules): Rules that target sets of nodes now make use of the new `Group` class, which provides an EARL serializable wrapper around iterables. Previously, pointers for these targets were not included in EARL output. ([#427](../../pull/427))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R83 no longer fails cases where a top-level `overflow: hidden` declaration would cause deep descendants to fail due to them not handling text overflow. ([#482](../../pull/482))

- [@siteimprove/alfa-thunk](packages/alfa-thunk): `Thunk.flatMap()` now correctly defers evaluation of the passed thunk.

- [@siteimprove/alfa-aria](packages/alfa-aria): The `placeholder` attribute is now correctly accepted for `<input type="email">` elements when computing accessible names.

## [0.5.0](../../compare/v0.4.1...v0.5.0) (2020-09-22)

### Breaking

- [@siteimprove/alfa-dom](packages/alfa-dom): The `mode` argument in the `Shadow.of()` constructor has been moved last in the argument list. Additionally, the first child `Document` and `Shadow` node passed to `h.element()` is no longer included in the list of child nodes but instead used as the content document and shadow root, respectively, of the constructed element. ([#398](../../pull/398))

### Added

- [@siteimprove/alfa-crawler](packages/alfa-crawler): A new package has been added with an implementation of a simple crawler based on the existing scraper. ([#309](../../pull/309))

- [@siteimprove/alfa-css](packages/alfa-css), [@siteimprove/alfa-selector](packages/alfa-selector): Tree-structural pseudo-selectors (`:nth-child()`, `:last-child`, `:nth-of-type()`, etc.) are now supported. ([#367](../../pull/367))

- [@siteimprove/alfa-css](packages/alfa-css), [@siteimprove/alfa-style](packages/alfa-style): `calc()` expressions are now supported for the `font-size` property. ([#376](../../pull/376))

- [@siteimprove/alfa-media](packages/alfa-media): The `min-width`, `max-width`, `min-height`, and `max-height` media query features are now supported. ([#403](../../pull/403))

- [@siteimprove/alfa-dom](packages/alfa-dom): `h.shadow()` is now available. Additionally, `h.element()` now uses the first child `Document` and `Shadow` node as the content document and shadow root, respectively, of the constructed element. ([#398](../../pull/398))

### Fixed

- [@siteimprove/alfa-aria](packages/alfa-aria): Ensure that ownership is only resolved once per `Document` context.

- [@siteimprove/alfa-aria](packages/alfa-aria): Elements with neither a `role`, explicit or implicit, nor `aria-` attributes are now correctly excluded from the accessibility tree and instead map to `Container` instances. ([#356](../../pull/356))

- [@siteimprove/alfa-aria](packages/alfa-aria): The `Name` class now correctly implements a `#toString()` method to ensure correct stringification of `Node` instances. ([#380](../../pull/380))

- [@siteimprove/alfa-aria](packages/alfa-aria): `<select>` elements now correctly get their name from connected `<label>` elements. ([#380](../../pull/380))

- [@siteimprove/alfa-aria](packages/alfa-aria): The last step of `Name.from()` has been removed as it was causing very poor performance for certain inputs and had no noticeable effect on computed names. ([#360](../../pull/360))

- [@siteimprove/alfa-aria](packages/alfa-aria): `Name.from()` now correctly computes names for `<input>` and `<textarea>` elements, adding the previously missing name computation steps. ([#394](../../pull/394))

- [@siteimprove/alfa-aria](packages/alfa-aria): Children of `<iframe>` are now no longer incorrectly included in the accessibility tree. ([#383](../../pull/383))

- [@siteimprove/alfa-lazy](packages/alfa-lazy): Fix a bug where `#map()` and `#flatMap()` could cause a `Lazy` to be evaluated more than once. ([#355](../../pull/355))

- [@siteimprove/alfa-map](packages/alfa-map): Fix a bug where `#size` was incorrectly reported for certain combinations of keys. ([#361](../../pull/361))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R86 is now exported from the package.

- [@siteimprove/alfa-rules](packages/alfa-rules): `isPerceivable()` now correctly accounts for nodes that aren't themselves included in the accessibility, but have descendants that are. ([#356](../../pull/356))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R16 now correctly handles the `separator` role and only fails elements with missing required attributes when the element is focusable. The rule now also pulls attributes from the accessibility tree to ensure that implicit attributes are correctly accounted for. ([#371](../../pull/371))

- [@siteimprove/alfa-rules](packages/alfa-rules): `isVisible()` now correctly accounts for elements that have been hidden by giving them a size <= 1px and clipping overflow, as commonly done by `.sr-only`-like utility classes. ([#387](../../pull/387))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R46 now correctly ignores header cells in presentational tables. ([#400](../../pull/400))

- [@siteimprove/alfa-dom](packages/alfa-dom): `Element#tabIndex()` now correctly considers `<object>` elements with embedded documents as browsing context containers and assigns them a default tab index of 0. ([#399](../../pull/399))

## [0.4.1](../../compare/v0.4.0...v0.4.1) (2020-08-27)

### Changed

- [@siteimprove/alfa-parser](packages/alfa-parser): The `eof()` combinator now passes the last element of the input iterable to the error thunk.

### Fixed

- [@siteimprove/alfa-cypress](packages/alfa-cypress), [@siteimprove/alfa-puppeteer](packages/alfa-puppeteer), [@siteimprove/alfa-webdriver](packages/alfa-webdriver): Fix conversion of native CSS `@import` rules to ensure correct import conditions.

- [@siteimprove/alfa-css](packages/alfa-css): Fix parsing of square bracket (`[]`) blocks which incorrectly used the open square bracket, not the closed square bracket, as their terminator.

- [@siteimprove/alfa-selector](packages/alfa-selector): The `:is()`, `:not()`, and `:has()` functional pseudo-class selectors are now correctly parsed. Additionally, non-namespaced universal selectors are now correctly matched against elements.

## [0.4.0](../../compare/v0.3.1...v0.4.0) (2020-08-25)

### Breaking

- [@siteimprove/alfa-dom](packages/alfa-dom): Parent pointers are now handled internally to `Node` instances to separate the construction of parent nodes and their children. This means that the constructors of all `Node` subclasses have changed slightly and now no longer need children to be passed in a closure. The `h()` and `jsx()` APIs now also operate on actual `Node` instances instead of a JSON representation. ([#283](../../pull/283))

- [@siteimprove/alfa-act](packages/alfa-act): Rules are now passed to the `Audit` class during construction rather than after. This removes the need to explicitly pass type parameters during construction as inference now works. ([#286](../../pull/286))

- [@siteimprove/alfa-aria](packages/alfa-aria): The package has been reworked to solve several long-standing issues in its design. For more information, please see the associated pull request. ([#300](../../pull/300))

- [@siteimprove/alfa-css](packages/alfa-css): Several CSS value types have changed slightly to ensure better alignment across the various value types. ([#301](../../pull/301))

### Added

- [@siteimprove/alfa-option](packages/alfa-option): `Option#none()` is now available as a negation of `Option#some()`.

- [@siteimprove/alfa-dom](packages/alfa-dom): `Block#size` and `Block#isEmpty()` are now available.

- [@siteimprove/alfa-collection](packages/alfa-collection), [@siteimprove/alfa-branched](alfa-branched), [@siteimprove/alfa-list](packages/alfa-list), [@siteimprove/alfa-map](packages/alfa-map), [@siteimprove/alfa-set](packages/alfa-set), [@siteimprove/alfa-sequence](packages/alfa-sequence): `Collection#distinct()`, `Collection#collect()`, and `Collection#collectFirst()` are now available and implemented by `Branched`, `List`, `Map`, `Set`, and `Sequence`.

- [@siteimprove/alfa-iterable](packages/alfa-iterable): `Iterable.distinct()`, `Iterable.collect()`, and `Iterable.collectFirst()` are now available.

- [@siteimprove/alfa-option](packages/alfa-option): `Option#reject()` is now available.

- [@siteimprove/alfa-branched](packages/alfa-branched): `Branched#from()` is now available.

- [@siteimprove/alfa-rules](packages/alfa-rules): An implementation of SIA-R86 is now available. ([#284](../../pull/284))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports CSS Custom Properties for Cascading Variables. ([#295](../../pull/295), [#302](../../pull/302))

- [@siteimprove/alfa-style](packages/alfa-style): The style system now supports the full set of `background-*` long- and shorthand properties. ([#301](../../pull/301))

### Fixed

- [@siteimprove/alfa-cascade](packages/alfa-cascade): Style sheets referenced through `@import` rules are now correctly included when computing cascade.

- [@siteimprove/alfa-cli](packages/alfa-cli): Avoid exiting prematurely on buffered socket writes.

- [@siteimprove/alfa-dom](packages/alfa-dom): Conversion from JSON to `Node` subclasses has been trampolined and therefore no longer causes a stack overflow. ([#283](../../pull/283))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R69 now correctly determines contrasts involving linear gradients. ([#289](../../pull/289))

- [@siteimprove/alfa-css](packages/alfa-css): Function and block components used in CSS declarations are now correctly parsed. ([#296](../../pull/296), [#302](../../pull/302))

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R68 now correctly only requires that at least one required child be present and not that every child be a required child. ([#304](../../pull/304))

- [@siteimprove/alfa-aria](packages/alfa-aria): Relations defined through the `aria-owns` attribute are now correctly resolved when constructing the accessibility tree. ([#306](../../pull/306))

## [0.3.1](../../compare/v0.3.0...v0.3.1) (2020-07-03)

### Fixed

- [@siteimprove/alfa-cli](packages/alfa-cli): Newlines are now correctly appended to the output, not the filename, when using the `--output` flag.

- [@siteimprove/alfa-rules](packages/alfa-rules): SIA-R47 now correctly handles negative `maximum-scale` values. SIA-R67 now only applies to `<object>` elements that are in the accessibility tree.

- [@siteimprove/alfa-scraper](packages/alfa-scraper): `Scraper#scrape()` now correctly scrapes pages whose URL contains a hash fragment. ([#288](../../pull/288))

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
