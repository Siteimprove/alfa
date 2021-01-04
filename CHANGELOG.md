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

### Changed

- [@siteimprove/alfa-selector](packages/alfa-selector): The `context` argument in `Selector#matches()` is now optional.

### Fixed

- [@siteimprove/alfa-sequence](packages/alfa-sequence): `Sequence#size` is now stack safe and no longer overflows for long sequences.

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
