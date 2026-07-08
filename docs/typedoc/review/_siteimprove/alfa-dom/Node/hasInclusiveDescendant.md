# Variable: hasInclusiveDescendant

```ts
const hasInclusiveDescendant: (predicate, options) => Predicate<Node> = predicate.hasInclusiveDescendant;
```

Defined in: [alfa-dom/src/node/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/index.ts)

## Parameters

### predicate

`Predicate`\<[`Node`](../Node-1.md)\>

### options?

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

## Returns

`Predicate`\<[`Node`](../Node-1.md)\>
