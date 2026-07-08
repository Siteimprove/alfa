# Variable: getNodesBetween

```ts
const getNodesBetween: (node1, node2, includeOptions, treeOptions) => Sequence<Node> = traversal.getNodesBetween;
```

Defined in: [alfa-dom/src/node/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/index.ts)

## Parameters

### node1

[`Node`](../Node-1.md)

### node2

[`Node`](../Node-1.md)

### includeOptions?

`Options` = `...`

### treeOptions?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.fullTree`

## Returns

`Sequence`\<[`Node`](../Node-1.md)\>
