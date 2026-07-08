# Variable: getTextDescendants

```ts
const getTextDescendants: <N>(textOptions: TextGroupOptions<N>) => (node: Node, options?: {
  add: any;
  equals: boolean;
  has: boolean;
  is: boolean;
  isSet: (flag: 0 | 2 | 1 | 4 | "composed" | "flattened" | "nested") => boolean;
  kind: "DOM traversal";
  remove: any;
  set: (...flags: Array<0 | 2 | 1 | 4 | "composed" | "flattened" | "nested">) => any;
  toJSON: JSON<"DOM traversal"> & KeyedByArray<["composed", "flattened", "nested"], boolean>;
  toString: string;
  unset: (...flags: Array<0 | 2 | 1 | 4 | "composed" | "flattened" | "nested">) => any;
  value: number;
} & KeyedByArray<["composed", "flattened", "nested"], boolean>) => Sequence<Text | TextGroup> = descendants.getTextDescendants;
```

Defined in: [alfa-dom/src/node/query/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

## Type Parameters

### N

`N` *extends* [`Node`](../Node-1.md) = [`Node`](../Node-1.md)

## Parameters

### textOptions?

`TextGroupOptions`\<`N`\> = `defaultTextOptions`

## Returns

(`node`: [`Node`](../Node-1.md), `options?`: \{
  `add`: `any`;
  `equals`: `boolean`;
  `has`: `boolean`;
  `is`: `boolean`;
  `isSet`: (`flag`: `0` \| `2` \| `1` \| `4` \| `"composed"` \| `"flattened"` \| `"nested"`) => `boolean`;
  `kind`: `"DOM traversal"`;
  `remove`: `any`;
  `set`: (...`flags`: `Array`\<`0` \| `2` \| `1` \| `4` \| `"composed"` \| `"flattened"` \| `"nested"`\>) => `any`;
  `toJSON`: `JSON`\<`"DOM traversal"`\> & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>;
  `toString`: `string`;
  `unset`: (...`flags`: `Array`\<`0` \| `2` \| `1` \| `4` \| `"composed"` \| `"flattened"` \| `"nested"`\>) => `any`;
  `value`: `number`;
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>) => `Sequence`\<[`Text`](../Text-1.md) \| `TextGroup`\>
