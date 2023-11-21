---
"@siteimprove/alfa-dom": minor
"@siteimprove/alfa-tree": minor
---

**Added:** Tree `Node`, and DOM `Node` can now have an `externalId` (`string`) and some `extraData` (`any`).

These are intended for callers that need to record some extra data during audits and retrieve it afterward. Especially, the `externalId` is intended for callers who already have an identifier for nodes and do not want to lose it during audits, nor maintain a map between these identifiers and Alfa nodes.

Alfa is guaranteed to never interact with the `extraData` in any way; except that it will be typed as `any`, so any type guard or assertions must be re-applied afterward.

Alfa may, in the future, decide that `Node` with the same `externalId` can be identified in some way, e.g., because they represent two version of the same object that were turned into two different Alfa object. This can for example happen when two copies of the same page in different states (e.g., different tab opened) are audited; this creates two Alfa `Document`, but the external caller may have the extra knowledge that some of the nodes should be identified.

It is up to the callers to ensure that the `externalId` are unique, since they are meant to carry knowledge that Alfa cannot infer.

The `externalId`, if any, is included in the serialisation of nodes. The `extraData` is never included because Alfa does not ensure it is serializable (it may contain circular references, …)

`extraData` can only be provided when building DOM nodes with the `#of` methods, or the `h.*` functions. `externalId` for `Element` can also be provided by a key with the same name in the JSX syntax.
