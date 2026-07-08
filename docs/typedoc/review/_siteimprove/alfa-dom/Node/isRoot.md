# Variable: isRoot

```ts
isRoot: (options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>) => Predicate<Node>;
```

Defined in: [alfa-dom/src/node/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/index.ts)

## Parameters

### options?

\{
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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

## Returns

`Predicate`\<[`Node`](../Node-1.md)\>
