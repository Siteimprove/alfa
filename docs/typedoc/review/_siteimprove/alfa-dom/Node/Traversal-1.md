# Variable: `Traversal`

```ts
const Traversal: ReplaceFactories<{
(kind: "DOM traversal", value: number): {
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
};
  allFlags: [1, 2, 4];
  empty: {
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
  };
  named: ReplaceFactories<any & KeyedByArray<Shorten<string, A, NonZeroFlags>, Shorten<string, A, NonZeroFlags> extends infer T_1 ? T_1 extends Shorten<..., ..., ...> ? ... extends ... ? ... : ... : never : never[number]>, Shorten<string, A, NonZeroFlags>[number], 
     | 0
     | Shorten<string, A, NonZeroFlags> extends infer T_2 ? T_2 extends Shorten<string, A, NonZeroFlags> ? T_2 extends [..., ...] ? [..., ...] : [] : never : never[number], {
     add: any;
     equals: boolean;
     has: boolean;
     is: boolean;
     isSet: (flag: 
        | 0 | ...[...]
       | Shorten<string, A, NonZeroFlags>[number]) => boolean;
     kind: K;
     remove: any;
     set: (...flags: Array<Shorten<..., ..., ...>[number] | ... | ...>) => any;
     toJSON: JSON<K> & KeyedByArray<A, boolean>;
     toString: string;
     unset: (...flags: Array<Shorten<..., ..., ...>[number] | ... | ...>) => any;
     value: number;
  } & KeyedByArray<Shorten<string, A, NonZeroFlags>, boolean>>;
  nameOf: "composed" | "flattened" | "nested";
  none: 0;
  of: {
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
  };
  reduce: number;
} & KeyedByArray<["composed", "flattened", "nested"], 1 | 2 | 4>, "composed" | "flattened" | "nested", 0 | 1 | 2 | 4, {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>>;
```
