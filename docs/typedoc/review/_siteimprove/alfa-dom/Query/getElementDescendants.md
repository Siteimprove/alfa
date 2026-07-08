# Variable: getElementDescendants

```ts
const getElementDescendants: (node, options?) => Sequence<Element<string>> = descendants.getElementDescendants;
```

Defined in: [alfa-dom/src/node/query/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

## Parameters

### node

[`Node`](../Node-1.md)

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

## Returns

`Sequence`\<[`Element`](../Element-1.md)\<`string`\>\>
