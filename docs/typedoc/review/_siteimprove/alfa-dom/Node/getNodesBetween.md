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

\{
  `add`: `any`;
  `equals`: `boolean`;
  `has`: `boolean`;
  `is`: `boolean`;
  `isSet`: (`flag`) => `boolean`;
  `kind`: `"DOM traversal"`;
  `remove`: `any`;
  `set`: (...`flags`) => `any`;
  `toJSON`: `JSON`\<`"DOM traversal"`\> & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>;
  `toString`: `string`;
  `unset`: (...`flags`) => `any`;
  `value`: `number`;
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.fullTree`

## Returns

`Sequence`\<[`Node`](../Node-1.md)\>
