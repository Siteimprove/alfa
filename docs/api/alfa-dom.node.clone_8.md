<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-dom](./alfa-dom.md) &gt; [Node](./alfa-dom.node.md) &gt; [clone](./alfa-dom.node.clone_8.md)

## Node.clone() function

Creates a new `Node` instance with the same value as the original and deeply referentially non-equal. Optionally replaces child elements based on a predicate.

**Signature:**

```typescript
function clone(node: Node, options?: ElementReplacementOptions, device?: Device): Node;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  node | [Node](./alfa-dom.node.md) |  |
|  options | [ElementReplacementOptions](./alfa-dom.node.elementreplacementoptions.md) | _(Optional)_ |
|  device | Device | _(Optional)_ |

**Returns:**

[Node](./alfa-dom.node.md)

## Remarks

The clone will have the same `externalId` as the original. The clone will \*not\* get `extraData` from the original, instead it will be `undefined`<!-- -->.

