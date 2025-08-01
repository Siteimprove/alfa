# @siteimprove/alfa-aria

## 0.104.1

## 0.104.0

## 0.103.3

## 0.103.2

## 0.103.1

## 0.103.0

## 0.102.0

## 0.101.0

## 0.100.1

## 0.100.0

## 0.99.0

### Minor Changes

- **Added:** The `<search>` element is now correctly handled. ([#1759](https://github.com/Siteimprove/alfa/pull/1759))

## 0.98.0

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

## 0.96.0

### Minor Changes

- **Added:** Expose `allowedAttributes` on ARIA Element type. ([#1721](https://github.com/Siteimprove/alfa/pull/1721))

  This function takes into account "implicit ARIA semantics" and "ARIA role allowances" from [ARIA in HTML](https://w3c.github.io/html-aria/#docconformance). The logic is moved from rule R18 implementation.

### Patch Changes

- **Fixed:** `<summary>` elements that are not summary for their parent details are now correctly treated as `generic` role. ([#1728](https://github.com/Siteimprove/alfa/pull/1728))

- **Fixed:** `<details>` elements now correctly have an implicit role of `group`. ([#1728](https://github.com/Siteimprove/alfa/pull/1728))

- **Fixed:** `<summary>` elements that are summary for their parent details now correctly have their name computed from content. ([#1728](https://github.com/Siteimprove/alfa/pull/1728))

## 0.95.0

## 0.94.1

## 0.94.0

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

## 0.93.2

## 0.93.1

## 0.93.0

## 0.92.0

### Minor Changes

- **Changed:** Alfa packages are now (also) published on the npmjs registry. ([`5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b`](https://github.com/Siteimprove/alfa/commit/5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b))

## 0.91.2

## 0.91.1

## 0.91.0

### Minor Changes

- **Changed:** Dummy minor version to experiment with publish flow, use the previous or next minor version instead. ([`2a62d8a43e294ee56c18315c8fad29fbdc18c0df`](https://github.com/Siteimprove/alfa/commit/2a62d8a43e294ee56c18315c8fad29fbdc18c0df))

## 0.90.1

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

## 0.87.2

## 0.87.1

## 0.87.0

## 0.86.2

## 0.86.1

### Patch Changes

- **Fixed:** Fix usages of `__dirname` ([#1644](https://github.com/Siteimprove/alfa/pull/1644))

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

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

- **Fixed:** Accessible name computation has been optimized ([#1611](https://github.com/Siteimprove/alfa/pull/1611))

## 0.80.0

### Minor Changes

- **Changed:** `Node.toJSON` now serialises the corresponding DOM node as its path in the **flat tree**, not in the DOM tree. ([#1607](https://github.com/Siteimprove/alfa/pull/1607))

### Patch Changes

- **Changed:** Role computation for `<li>` elements now looks for a parent `<ul>` in the flat tree, not the DOM tree. ([#1607](https://github.com/Siteimprove/alfa/pull/1607))

  Browsers seem to behave differently on that case, but allowing slotted `<li>` makes sense, so taking this interpretation for now.

## 0.79.1

## 0.79.0

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

## 0.74.0

## 0.73.0

### Minor Changes

- **Breaking:** `Name.Source` and `Name.State` are now exported from the top-level of the package. ([#1566](https://github.com/Siteimprove/alfa/pull/1566))

### Patch Changes

- **Fixed:** Alfa now correctly handle spaces in accessible names. ([#1566](https://github.com/Siteimprove/alfa/pull/1566))
  - `<br>` elements add a space to the name.
  - Text nodes with leading or trailing spaces (including space only nodes) keep the space when concatenated.
  - Names of descendants with an `aria-label` are spaced, following browsers' behavior.
  - Names of descendants displayed as `table-cell` are spaced, following browsers' behavior.

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

### Patch Changes

- **Fixed:** The `<hgroup>` element now has an implicit role of `group`. ([#1506](https://github.com/Siteimprove/alfa/pull/1506))

  Following the re-introduction of `<hgroup>`, and subsequent changes to the HTML AAM.

## 0.68.0

## 0.67.0

### Patch Changes

- **Fixed:** Name from content now correctly includes shadow DOM. ([#1470](https://github.com/Siteimprove/alfa/pull/1470))

  When the accessible name is computed from the descendants, slots and descendants inside a shadow DOM are correctly taken into account. This mimic what browsers are doing, and what the accessible name conputation group seems to be moving toward.

## 0.66.0

## 0.65.1

## 0.65.0

### Minor Changes

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
