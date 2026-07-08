# Variable: Traversal

```ts
const Traversal: ReplaceFactories<{
(kind, value): {
  add: any;
  equals: boolean;
  has: boolean;
  is: boolean;
  isSet: (flag) => boolean;
  kind: "DOM traversal";
  remove: any;
  set: (...flags) => any;
  toJSON: JSON<"DOM traversal"> & KeyedByArray<["composed", "flattened", "nested"], boolean>;
  toString: string;
  unset: (...flags) => any;
  value: number;
};
  allFlags: [1, 2, 4];
  empty: {
     add: any;
     equals: boolean;
     has: boolean;
     is: boolean;
     isSet: (flag) => boolean;
     kind: "DOM traversal";
     remove: any;
     set: (...flags) => any;
     toJSON: JSON<"DOM traversal"> & KeyedByArray<["composed", "flattened", "nested"], boolean>;
     toString: string;
     unset: (...flags) => any;
     value: number;
  };
  named: ReplaceFactories<any & KeyedByArray<Shorten<string, A, NonZeroFlags>, Shorten<string, A, NonZeroFlags> extends infer T_1 ? T_1 extends Shorten<..., ..., ...> ? ... extends ... ? ... : ... : never : never[number]>, Shorten<string, A, NonZeroFlags>[number], 
     | 0
     | Shorten<string, A, NonZeroFlags> extends infer T_2 ? T_2 extends Shorten<string, A, NonZeroFlags> ? T_2 extends [..., ...] ? [..., ...] : [] : never : never[number], {
     add: any;
     equals: boolean;
     has: boolean;
     is: boolean;
     isSet: (flag) => boolean;
     kind: K;
     remove: any;
     set: (...flags) => any;
     toJSON: JSON<K> & KeyedByArray<A, boolean>;
     toString: string;
     unset: (...flags) => any;
     value: number;
  } & KeyedByArray<Shorten<string, A, NonZeroFlags>, boolean>>;
  nameOf: "composed" | "flattened" | "nested";
  none: 0;
  of: {
     add: any;
     equals: boolean;
     has: boolean;
     is: boolean;
     isSet: (flag) => boolean;
     kind: "DOM traversal";
     remove: any;
     set: (...flags) => any;
     toJSON: JSON<"DOM traversal"> & KeyedByArray<["composed", "flattened", "nested"], boolean>;
     toString: string;
     unset: (...flags) => any;
     value: number;
  };
  reduce: number;
} & KeyedByArray<["composed", "flattened", "nested"], 1 | 2 | 4>, "composed" | "flattened" | "nested", 0 | 1 | 2 | 4, {
  add: any;
  equals: boolean;
  has: boolean;
  is: boolean;
  isSet: (flag) => boolean;
  kind: "DOM traversal";
  remove: any;
  set: (...flags) => any;
  toJSON: JSON<"DOM traversal"> & KeyedByArray<["composed", "flattened", "nested"], boolean>;
  toString: string;
  unset: (...flags) => any;
  value: number;
} & KeyedByArray<["composed", "flattened", "nested"], boolean>>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)
