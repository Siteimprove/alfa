# @siteimprove/alfa-dom

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
