# @siteimprove/alfa-dom

## 0.111.0

## 0.110.0

### Patch Changes

- **Added:** The `inert` attribute is now supported. ([#1964](https://github.com/Siteimprove/alfa/pull/1964))

## 0.109.0

### Patch Changes

- **Added:** A new function `getTextDescendants` has been added to the `Query` namespace. It retrieves all text descendants of a node, with an option to group text under matching sub-trees into labeled `TextGroup` objects. ([#1972](https://github.com/Siteimprove/alfa/pull/1972))

- **Changed:** The `index()` method on nodes now accepts an optional predicate parameter to filter siblings when calculating the node's index position. ([#1980](https://github.com/Siteimprove/alfa/pull/1980))

## 0.108.2

## 0.108.1

## 0.108.0

## 0.107.0

## 0.106.1

## 0.106.0

## 0.105.0

### Minor Changes

- **Added:** `Text.is` predicate is now available. ([#1896](https://github.com/Siteimprove/alfa/pull/1896))

### Patch Changes

- **Added:** Test coverage data is now included in all packages, as well as at global level. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

## 0.104.1

## 0.104.0

## 0.103.3

## 0.103.2

## 0.103.1

### Patch Changes

- **Fixed:** Imported style sheets are now serialized. ([#1789](https://github.com/Siteimprove/alfa/pull/1789))

## 0.103.0

### Patch Changes

- **Fixed:** `Native.fromNode` can now handle `document.adoptedStyleSheets` where `length` property is missing. ([#1786](https://github.com/Siteimprove/alfa/pull/1786))

  This addresses what is probably incorrect behavior of the `adoptedStyleSheets` in some browser implementations.

## 0.102.0

### Minor Changes

- **Added:** `Native.fromNode` returned value now contains a `logs` field, with an array of logs. ([#1781](https://github.com/Siteimprove/alfa/pull/1781))

- **Breaking:** The `withCrossOrigin` option of `dom.Native.fromNode` has been renamed `ensureAnonymousCrossOrigin`. ([#1779](https://github.com/Siteimprove/alfa/pull/1779))

  The old `withCrossOrigin` option is kept as a deprecated legacy alias and will be removed in a later release.

  The new name better reflects the meaning of the option.

## 0.101.0

## 0.100.1

### Patch Changes

- **Fixed:** Optional parameters `box` and `device` of `Text.of` now defaults to `None`. ([#1774](https://github.com/Siteimprove/alfa/pull/1774))

## 0.100.0

### Minor Changes

- **Breaking:** The `hasBox` predicate has been moved from `Element` to `Node`. ([#1768](https://github.com/Siteimprove/alfa/pull/1768))

  To migrate, replace `Element.hasBox` with `Node.hasBox`.
  If `Node` is not imported, add it to the import statement:

  ```
  import { Element, Node } from "@siteimprove/alfa-dom";
  ```

- **Added:** `Text.of` now accepts `Option<Rectangle>` and `Option<Device>`. A rectangle can also be passed through the `box` JSON property when using `Text.fromText`. ([#1768](https://github.com/Siteimprove/alfa/pull/1768))

  The rectangle represents the layout of the text node. If a rectangle is passed in, a device must be be supplied, otherwise the rectangle won't be set.

## 0.99.0

### Minor Changes

- **Added:** The `<search>` element is now correctly handled. ([#1759](https://github.com/Siteimprove/alfa/pull/1759))

## 0.98.0

### Minor Changes

- **Changed:** Node serialization with `Low` verbosity now also include the `Node#path`. ([#1748](https://github.com/Siteimprove/alfa/pull/1748))

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

## 0.96.0

### Minor Changes

- **Added:** An `Element<"summary">#isSummaryForItsParentDetails` predicate is now available. ([#1728](https://github.com/Siteimprove/alfa/pull/1728))

- **Added:** An `Attribute.Autocomplete` namespace is now available, grouping functionalities around the `autocomplete` attribute. ([#1724](https://github.com/Siteimprove/alfa/pull/1724))

## 0.95.0

## 0.94.1

## 0.94.0

### Minor Changes

- **Breaking:** `#serializationId` has been replaced with `#internalId`. ([#1705](https://github.com/Siteimprove/alfa/pull/1705))

  The old `#serializationId` is now deprecated and acts as an alias to `#internalId`. It will be removed in a future version.

- **Added:** A `Query.descendants` helper is now available, to filter DOM descendants by a predicate. ([#1709](https://github.com/Siteimprove/alfa/pull/1709))

  Results are cached by predicate and node.

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

### Patch Changes

- **Changed:** `Node.from` and `Page.from` are now cached. ([#1703](https://github.com/Siteimprove/alfa/pull/1703))

  This makes multiple de-serialisation inexpensive as long as the JSON object is not discarded, thus simplifying logic for callers.

## 0.93.2

## 0.93.1

## 0.93.0

### Minor Changes

- **Breaking:** `Element.hasDisplaySize()` now builds a `Predicate<Element<"select">>` instead of a `Predicate<Element>`. ([#1683](https://github.com/Siteimprove/alfa/pull/1683))

  That is, it can only be applied to elements that have been typed as `<select>` elements, where it makes sense. If the type of element cannot be narrowed in TypeScript (e.g. because it is the result of a direct test on `Element#name`), a type assertion is needed; in general, using the `Element.hasName` refinement is recommended over testing `Element#name`.

- **Added:** A method `Element<"select">#displaySize()` is now available. ([#1683](https://github.com/Siteimprove/alfa/pull/1683))

- **Breaking:** The helper `Element.inputType(element)` has been replaced by a method `element.inputType()`. ([#1683](https://github.com/Siteimprove/alfa/pull/1683))

  It can still only be called if `element` has been typed as `Element<"input">`, i.e. is an `<input>` HTML element.

- **Added:** An `Element<"select">#optionsList()` helper is now available. ([#1683](https://github.com/Siteimprove/alfa/pull/1683))

## 0.92.0

### Minor Changes

- **Changed:** Alfa packages are now (also) published on the npmjs registry. ([`5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b`](https://github.com/Siteimprove/alfa/commit/5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b))

## 0.91.2

## 0.91.1

## 0.91.0

### Minor Changes

- **Changed:** Dummy minor version to experiment with publish flow, use the previous or next minor version instead. ([`2a62d8a43e294ee56c18315c8fad29fbdc18c0df`](https://github.com/Siteimprove/alfa/commit/2a62d8a43e294ee56c18315c8fad29fbdc18c0df))

## 0.90.1

### Patch Changes

- **Added:** `Navive.fromNode` can now be called with no argument, in which case it will default to `window.document`. ([#1678](https://github.com/Siteimprove/alfa/pull/1678))

  It is not possible to provide options this way.

  This is useful in settings where the serialisation must be injected into another context (e.g. headless browser), to avoid specifically fetching the document or using a bundler to inject `() => Native.fromNode(window.document)` to read it from inside the other context.

## 0.90.0

## 0.89.3

## 0.89.2

### Patch Changes

- **Changed:** Trying to fix a problem in generating provenance statements ([#1674](https://github.com/Siteimprove/alfa/pull/1674))

## 0.89.1

### Patch Changes

- **Added:** Trying to publish Alfa packages on the npm registry ([#1673](https://github.com/Siteimprove/alfa/pull/1673))

## 0.89.0

## 0.88.0

### Minor Changes

- **Fixed:** The publish flow was updated to a new version. ([`a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2`](https://github.com/Siteimprove/alfa/commit/a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2))

  Some 0.87.\* versions were generating uninstallable package. This should be fixed now.

## 0.87.12

## 0.87.11

## 0.87.10

## 0.87.7

## 0.87.6

## 0.87.5

## 0.87.4

## 0.87.3

### Patch Changes

- **Fixed:** Workaround for when adopted style sheets are missing has been added. ([#1656](https://github.com/Siteimprove/alfa/pull/1656))

## 0.87.2

## 0.87.1

## 0.87.0

### Minor Changes

- **Added:** A new function `getInclusiveElementDescendants` was added to the `Query` namespace. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

- **Breaking:** Optional serialization type parameters have been removed. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

- **Added:** `Element` serialised with high verbosity now include the serialisation ID of their assigned slot, if any. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

  This help de-serialise the shadow trees for tools that do not want to re-compute slot assignement.

## 0.86.2

## 0.86.1

## 0.86.0

### Minor Changes

- **Breaking:** TS resolution has been changed to `Node16`, target to `es2022`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

- **Breaking:** Alfa is now distributed as ESM rather than CJS modules; projects using it must be ESM or use dynamic `import()`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

  ⚠️ This is the last of a series of changes on the internal structure and build process of distributed packages that was started with v0.85.0.

## 0.85.1

## 0.85.0

### Minor Changes

- **Breaking:** The .js files are now built in the `dist` folder rather than in `src`. ([#1628](https://github.com/Siteimprove/alfa/pull/1628))

  ⚠️ This is the first of a series of changes on the internal structure and build process of distributed packages. It is probably better to not use this version and wait until more of these internal changes have been done to jump directly to the final result. We are internally releasing these changes for validation purpose only.

  This should not impact consumers, the `package.json` files should be set correctly to consume these files.

## 0.84.0

## 0.83.1

## 0.83.0

## 0.82.0

### Minor Changes

- **Added:** DOM node builders like `Element.of` etc. now optionally accept `serializationId` which will be used when serializing depending on the verbosity chosen. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

  If one is not supplied it will be randomly generated as an UUID.

- **Added:** Verbosity option has been added to JSON serialization of alfa-tree `Node` and to `Outcome` and `Group`. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

- **Fixed:** `Native.fromWindow` now behaves better in case when injected in content scripts. ([#1619](https://github.com/Siteimprove/alfa/pull/1619))

  Some browsers make content scripts live in different worlds than the actual page. This causes `.constructor.name` to fail when run from the content script on object created in the page (typically, all DOM objects), in turn crashing the CSS rule type detection.

  This introduces a heuristic to catch this case and fall back on other solutions.

## 0.80.0

### Patch Changes

- **Fixed:** `Native.fromNode` now correctly handles sheets without conditions. ([#1608](https://github.com/Siteimprove/alfa/pull/1608))

## 0.79.1

### Patch Changes

- **Fixed:** Correctly encapsulated sub-functions of `Native.fromNode`. ([#1606](https://github.com/Siteimprove/alfa/pull/1606))

## 0.79.0

### Minor Changes

- **Breaking:** `ImportRule.queries` has been renamed `ImportRule.mediaQueries`. ([#1603](https://github.com/Siteimprove/alfa/pull/1603))

  This allows support queries in import rules in a unified naming scheme.

- **Breaking:** `Native.fromNode()` is now asynchronous. ([#1600](https://github.com/Siteimprove/alfa/pull/1600))

  This allows to perform asynchronous operations on the page being scraped.

- **Added:** CSS `import` rules now support `layer`, and `supports` condition. ([#1603](https://github.com/Siteimprove/alfa/pull/1603))

### Patch Changes

- **Added:** `Native.fromNode()` now includes an option to enforce `crossorigin: anonymous` on `<link>` elements missing a CORS. ([#1600](https://github.com/Siteimprove/alfa/pull/1600))

  This can help solve some problems encountered during scraping, when they are tied to missing CORS policy.

- **Fixed:** `Native.fromNode()` now correctly handles CSS shorthands whose value is a `var(…)`. ([#1600](https://github.com/Siteimprove/alfa/pull/1600))

- **Fixed:** Bug where boxes where not being serialized due to device not being passed down when recursing has been fixed. ([#1605](https://github.com/Siteimprove/alfa/pull/1605))

- **Fixed:** `Node.tabOrder()` now correctly inserts shadow tree content in its place, instead of at the start. ([#1599](https://github.com/Siteimprove/alfa/pull/1599))

- **Added:** `Native.fromNode` now parses `@layer` rules. ([#1600](https://github.com/Siteimprove/alfa/pull/1600))

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

### Minor Changes

- **Added:** Most CSS conditional rules now have a `.matches(device)` helper, checking against the parsed queries. ([#1581](https://github.com/Siteimprove/alfa/pull/1581))

- **Added:** CSS `@layer` rules are now handled when building cascades. ([#1574](https://github.com/Siteimprove/alfa/pull/1574))

## 0.74.0

## 0.73.0

### Patch Changes

- **Fixed:** Parents of `Comment` inside a shadow tree now correctly skip over the shadow root when traversing the flat tree. ([#1547](https://github.com/Siteimprove/alfa/pull/1547))

- **Fixed:** Nested style rules now correctly get their sheet as owner. ([#1560](https://github.com/Siteimprove/alfa/pull/1560))

- **Fixed:** `Node.toString()` now stops dropping text nodes with only spaces. ([#1566](https://github.com/Siteimprove/alfa/pull/1566))

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

### Minor Changes

- **Added:** New functions `Node.clone` for cloning nodes and optionally replacing child elements based on a predicate. ([#1523](https://github.com/Siteimprove/alfa/pull/1523))

## 0.69.0

### Minor Changes

- **Added:** Tree `Node`, and DOM `Node` can now have an `externalId` (`string`) and some `extraData` (`any`). ([#1498](https://github.com/Siteimprove/alfa/pull/1498))

  These are intended for callers that need to record some extra data during audits and retrieve it afterward. Especially, the `externalId` is intended for callers who already have an identifier for nodes and do not want to lose it during audits, nor maintain a map between these identifiers and Alfa nodes.

  Alfa is guaranteed to never interact with the `extraData` in any way; except that it will be typed as `any`, so any type guard or assertions must be re-applied afterward.

  Alfa may, in the future, decide that `Node` with the same `externalId` can be identified in some way, e.g., because they represent two versions of the same object that were turned into two different Alfa object. This can for example happen when two copies of the same page in different states (e.g., different tab opened) are audited; this creates two Alfa `Document`, but the external caller may have the extra knowledge that some of the nodes should be identified.

  It is up to the callers to ensure that the `externalId` are unique, since they are meant to carry knowledge that Alfa cannot infer.

  The `externalId`, if any, is included in the serialisation of nodes. The `extraData` is never included because Alfa does not ensure it is serializable (it may contain circular references, …)

  `extraData` can only be provided when building DOM nodes with the `#of` methods, or the `h.*` functions. `externalId` for `Element` can also be provided by a key with the same name in the JSX syntax.

## 0.68.0

### Minor Changes

- **Breaking:** `Element#of` now requires the device used when scraping a page in order to store a box. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  This ensures that the boxes of the elements will be stored with and only be accessible for the same device instance. If no device is provided, no box is stored with the element.

- **Added:** `Document#toJSON` now optionally accepts serialization options containing device. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  The options will be passed down to all children of the document and used by `Element` to serialize the box corresponding to the device.

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

### Minor Changes

- **Added:** Support for optional `box` everywhere when constructing an `Element`. ([#1440](https://github.com/Siteimprove/alfa/pull/1440))

  Boxes are expected to be the result of `getBoundingClientRect`, i.e. contain adding and border.

  It is up to the caller to ensure that the boxes were generated on the same `Device` that is used for audits. Alfa does not (and cannot) verify this.

  Alfa assumes that the boxes where generated with an empty `Context`. It is up to the caller to ensure that this is the case.

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

- **Breaking:** Renamed public property `rectangle` to `box` which was overlooked in the last version ([#1440](https://github.com/Siteimprove/alfa/pull/1440))

- **Added:** A `Element.hasBox` predicate builder is now available. ([#1450](https://github.com/Siteimprove/alfa/pull/1450))

## 0.64.0

### Minor Changes

- **Added:** Optional `Rectangle` property on `Element`. ([#1427](https://github.com/Siteimprove/alfa/pull/1427))

  The new property can optionally be set when constructing an element, but it doesn't do anything yet.

- **Breaking:** The method `.elementDescendants()` on the classes `Document` and `Node` has been removed. In stead the function `Query.getElementDescendants()` should be used. ([#1425](https://github.com/Siteimprove/alfa/pull/1425))

- **Added:** `Query` namespace with functions for querying element descendants and elements by id. ([#1413](https://github.com/Siteimprove/alfa/pull/1413))

  The result of the queries are cached.

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** `hasUniqueId` is now directly a `Predicate` ([#1408](https://github.com/Siteimprove/alfa/pull/1408))

  It used to a be `() => Predicate`, the useless void parameter has now been removed. To migrate, simply replace any call to `hasUniqueId()` by `hasUniqueId` (remove the useless empty parameter).

- **Added:** `hasTabIndex` now also accepts number values ([#1409](https://github.com/Siteimprove/alfa/pull/1409))

  `hasTabIndex` accepts numbers and will be satisfied if the tabindex is any of these numbers. It still alternatively accepts a `Predicate<number>`.

## 0.62.2

## 0.62.1
