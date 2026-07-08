# Class: Shadow

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

## Extends

- `BaseNode`\<`"shadow"`\>

## Constructors

### Constructor

```ts
protected new Shadow(
   children: Node[], 
   style: Sheet[], 
   mode: Mode, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any): Shadow;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Parameters

##### children

[`Node`](Node-1.md)[]

##### style

[`Sheet`](Sheet-1.md)[]

##### mode

[`Mode`](Shadow/Mode.md)

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Shadow`

#### Overrides

```ts
BaseNode<"shadow">.constructor
```

## _attachHost

### \_attachHost()

```ts
_attachHost(host: Element): boolean;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Parameters

##### host

[`Element`](Element-1.md)

#### Returns

`boolean`

## _attachParent

### \_attachParent()

```ts
_attachParent(): boolean;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Returns

`boolean`

#### Overrides

```ts
BaseNode._attachParent
```

## _children

### \_children

```ts
protected readonly _children: Node<"DOM traversal", 1 | 2 | 4, string>[];
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
BaseNode._children
```

## _frozen

### \_frozen

```ts
protected _frozen: boolean;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
BaseNode._frozen
```

## _internalPath

### \_internalPath()

```ts
protected _internalPath(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): string;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Parameters

##### options?

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`string`

#### Overrides

```ts
BaseNode._internalPath
```

## _parent

### \_parent

```ts
protected _parent: Option<Node<"DOM traversal", 1 | 2 | 4, string>>;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
BaseNode._parent
```

## _type

### \_type

```ts
protected readonly _type: "shadow";
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
BaseNode._type
```

## [iterator]

### \[iterator\]()

```ts
iterator: Iterator<Node<"DOM traversal", 1 | 2 | 4, string>>;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Returns

`Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

#### Inherited from

```ts
BaseNode.[iterator]
```

## ancestors

### ancestors()

```ts
ancestors(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.ancestors
```

## children

### children()

```ts
children(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.children
```

## closest

### closest()

#### Call Signature

```ts
closest<T>(refinement: Refinement<Node, T>, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<T>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Type Parameters

###### T

`T` *extends* [`Node`](Node-1.md)

##### Parameters

###### refinement

`Refinement`\<[`Node`](Node-1.md), `T`\>

###### options?

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

##### Returns

`Option`\<`T`\>

##### Inherited from

```ts
BaseNode.closest
```

#### Call Signature

```ts
closest(predicate: Predicate<Node>, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### predicate

`Predicate`\<[`Node`](Node-1.md)\>

###### options?

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

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

```ts
BaseNode.closest
```

## descendants

### descendants()

```ts
descendants(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.descendants
```

## empty

### empty()

```ts
static empty(): Shadow;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Returns

`Shadow`

## equals

### equals()

#### Call Signature

```ts
equals(value: BaseNode): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### value

`BaseNode`

##### Returns

`boolean`

##### Inherited from

```ts
BaseNode.equals
```

#### Call Signature

```ts
equals(value: unknown): value is Shadow;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Shadow`

##### Inherited from

```ts
BaseNode.equals
```

## externalId

### externalId

#### Get Signature

```ts
get externalId(): string | undefined;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`string` \| `undefined`

#### Inherited from

```ts
BaseNode.externalId
```

## extraData

### extraData

#### Get Signature

```ts
get extraData(): any;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`any`

#### Inherited from

```ts
BaseNode.extraData
```

## first

### first()

```ts
first(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.first
```

## following

### following()

```ts
following(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.following
```

## freeze

### freeze()

```ts
freeze(): this;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Returns

`this`

#### Inherited from

```ts
BaseNode.freeze
```

## frozen

### frozen

#### Get Signature

```ts
get frozen(): boolean;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`boolean`

#### Inherited from

```ts
BaseNode.frozen
```

## hash

### hash()

```ts
hash(hash: Hash): void;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Parameters

##### hash

`Hash`

#### Returns

`void`

#### Inherited from

```ts
BaseNode.hash
```

## host

### host

#### Get Signature

```ts
get host(): Option<Element<string>>;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## inclusiveAncestors

### inclusiveAncestors()

```ts
inclusiveAncestors(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.inclusiveAncestors
```

## inclusiveDescendants

### inclusiveDescendants()

```ts
inclusiveDescendants(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.inclusiveDescendants
```

## inclusiveSiblings

### inclusiveSiblings()

```ts
inclusiveSiblings(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.inclusiveSiblings
```

## index

### index()

```ts
index(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>, predicate?: Predicate<Node>): number;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

##### predicate?

`Predicate`\<[`Node`](Node-1.md)\>

#### Returns

`number`

#### Inherited from

```ts
BaseNode.index
```

## internalId

### internalId

#### Get Signature

```ts
get internalId(): string;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`string`

#### Inherited from

```ts
BaseNode.internalId
```

## isAncestorOf

### isAncestorOf()

```ts
isAncestorOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isAncestorOf
```

## isChildOf

### isChildOf()

```ts
isChildOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isChildOf
```

## isDescendantOf

### isDescendantOf()

```ts
isDescendantOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isDescendantOf
```

## isInclusiveAncestorOf

### isInclusiveAncestorOf()

```ts
isInclusiveAncestorOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isInclusiveAncestorOf
```

## isInclusiveDescendantsOf

### isInclusiveDescendantsOf()

```ts
isInclusiveDescendantsOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isInclusiveDescendantsOf
```

## isInclusiveSiblingOf

### isInclusiveSiblingOf()

```ts
isInclusiveSiblingOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isInclusiveSiblingOf
```

## isParentOf

### isParentOf()

```ts
isParentOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isParentOf
```

## isRootOf

### isRootOf()

```ts
isRootOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isRootOf
```

## isSiblingOf

### isSiblingOf()

```ts
isSiblingOf(node: Node, options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

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

#### Returns

`boolean`

#### Inherited from

```ts
BaseNode.isSiblingOf
```

## last

### last()

```ts
last(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.last
```

## mode

### mode

#### Get Signature

```ts
get mode(): Mode;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

##### Returns

[`Mode`](Shadow/Mode.md)

## next

### next()

```ts
next(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.next
```

## of

### of()

```ts
static of(
   children: Iterable<Node>, 
   style?: Iterable<Sheet>, 
   mode?: Mode, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any): Shadow;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Parameters

##### children

`Iterable`\<[`Node`](Node-1.md)\>

##### style?

`Iterable`\<[`Sheet`](Sheet-1.md)\> = `[]`

##### mode?

[`Mode`](Shadow/Mode.md) = `Shadow.Mode.Open`

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Shadow`

## parent

### parent()

```ts
parent(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Parameters

##### options?

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Overrides

```ts
BaseNode.parent
```

## path

### path()

```ts
path(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): string;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`string`

#### Inherited from

```ts
BaseNode.path
```

## preceding

### preceding()

```ts
preceding(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.preceding
```

## previous

### previous()

```ts
previous(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.previous
```

## root

### root()

```ts
root(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Node;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

[`Node`](Node-1.md)

#### Inherited from

```ts
BaseNode.root
```

## serializationId

### serializationId

#### Get Signature

```ts
get serializationId(): string | undefined;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`string` \| `undefined`

#### Inherited from

```ts
BaseNode.serializationId
```

## siblings

### siblings()

```ts
siblings(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
BaseNode.siblings
```

## style

### style

#### Get Signature

```ts
get style(): Iterable<Sheet>;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

##### Returns

`Iterable`\<[`Sheet`](Sheet-1.md)\>

## tabOrder

### tabOrder()

```ts
tabOrder(this: Node): Sequence<Element<string>>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### this

[`Node`](Node-1.md)

#### Returns

`Sequence`\<[`Element`](Element-1.md)\<`string`\>\>

#### Inherited from

```ts
BaseNode.tabOrder
```

## textContent

### textContent()

```ts
textContent(options?: {
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
} & KeyedByArray<["composed", "flattened", "nested"], boolean>): string;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

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
\} & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`string`

#### Inherited from

```ts
BaseNode.textContent
```

## toEARL

### toEARL()

```ts
toEARL(): EARL;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Returns

`EARL`

#### Inherited from

```ts
BaseNode.toEARL
```

## toJSON

### toJSON()

#### Call Signature

```ts
toJSON(options: SerializationOptions & {
  verbosity: Minimal | Low;
}): MinimalJSON;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

##### Parameters

###### options

`SerializationOptions` & \{
  `verbosity`: `Minimal` \| `Low`;
\}

##### Returns

[`MinimalJSON`](Shadow/MinimalJSON.md)

##### Overrides

```ts
BaseNode.toJSON
```

#### Call Signature

```ts
toJSON(options?: SerializationOptions): JSON;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

##### Parameters

###### options?

`SerializationOptions`

##### Returns

[`JSON`](Shadow/JSON.md)

##### Overrides

```ts
BaseNode.toJSON
```

## toSARIF

### toSARIF()

```ts
toSARIF(): Location;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Returns

`Location`

#### Inherited from

```ts
BaseNode.toSARIF
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/node/shadow.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts)

#### Returns

`string`

## type

### type

#### Get Signature

```ts
get type(): T;
```

Defined in: alfa-tree/dist/tree.d.ts

##### Returns

`T`

#### Inherited from

```ts
BaseNode.type
```
