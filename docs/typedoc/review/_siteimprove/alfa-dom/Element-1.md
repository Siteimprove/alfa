# Class: Element\<N\>

## Extends

- `Slotable`\<`"element"`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

## Constructors

### Constructor

```typescript
protected new Element<N extends string = string>(
   namespace: Option<Namespace>, 
   prefix: Option<string>, 
   name: N, 
   attributes: Attribute<string>[], 
   children: Node[], 
   style: Option<Block>, 
   box: Option<Rectangle>, 
   device: Option<Device>, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any
): Element<N>;
```

#### Overrides

```ts
Slotable<"element">.constructor
```

## _attachContent

### \_attachContent()

```typescript
_attachContent(document: Document): boolean;
```

## _attachParent

### \_attachParent()

```typescript
_attachParent(parent: Node<"DOM traversal", 1 | 2 | 4>): boolean;
```

#### Inherited from

```ts
Slotable._attachParent
```

## _attachShadow

### \_attachShadow()

```typescript
_attachShadow(shadow: Shadow): boolean;
```

## _children

### \_children

```ts
protected readonly _children: Node<"DOM traversal", 1 | 2 | 4, string>[];
```

#### Inherited from

```ts
Slotable._children
```

## _displaySize

### \_displaySize

```ts
protected _displaySize: number | undefined;
```

## _frozen

### \_frozen

```ts
protected _frozen: boolean;
```

#### Inherited from

```ts
Slotable._frozen
```

## _inputType

### \_inputType

```ts
protected _inputType: InputType | undefined;
```

## _internalPath

### \_internalPath()

```typescript
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

#### Overrides

```ts
Slotable._internalPath
```

## _optionsList

### \_optionsList

```ts
protected _optionsList: Sequence<Element<"option">> | undefined;
```

## _parent

### \_parent

```ts
protected _parent: Option<Node<"DOM traversal", 1 | 2 | 4, string>>;
```

#### Inherited from

```ts
Slotable._parent
```

## _type

### \_type

```ts
protected readonly _type: "element";
```

#### Inherited from

```ts
Slotable._type
```

## [iterator]

### \[iterator\]()

```typescript
iterator: Iterator<Node<"DOM traversal", 1 | 2 | 4, string>>;
```

#### Inherited from

```ts
Slotable.[iterator]
```

## ancestors

### ancestors()

```typescript
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

#### Inherited from

```ts
Slotable.ancestors
```

## assignedNodes

### assignedNodes()

```typescript
assignedNodes(this: Slot): Iterable<Slotable>;
```

## assignedSlot

### assignedSlot()

```typescript
assignedSlot(): Option<Slot>;
```

#### Overrides

```ts
Slotable.assignedSlot
```

## attribute

### attribute()

#### Call Signature

```typescript
attribute<A extends string = string>(name: A): Option<Attribute<A>>;
```

#### Call Signature

```typescript
attribute<A extends string = string>(predicate: Predicate<Attribute<A>>): Option<Attribute<A>>;
```

## attributes

### attributes

#### Get Signature

```typescript
get attributes(): Sequence<Attribute<string>>;
```

##### Returns

`Sequence`\<[`Attribute`](Attribute-1.md)\<`string`\>\>

## children

### children()

```typescript
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

#### Overrides

```ts
Slotable.children
```

## classes

### classes

#### Get Signature

```typescript
get classes(): Sequence<string>;
```

##### Returns

`Sequence`\<`string`\>

## closest

### closest()

#### Call Signature

```typescript
closest<T extends Node>(refinement: Refinement<Node, T>, options?: {
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

##### Inherited from

```ts
Slotable.closest
```

#### Call Signature

```typescript
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

##### Inherited from

```ts
Slotable.closest
```

## content

### content

#### Get Signature

```typescript
get content(): Option<Document>;
```

##### Returns

`Option`\<[`Document`](Document-1.md)\>

## descendants

### descendants()

```typescript
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

#### Inherited from

```ts
Slotable.descendants
```

## displaySize

### displaySize()

```typescript
displaySize(this: Element<"select">): number;
```

## equals

### equals()

#### Call Signature

```typescript
equals(value: BaseNode): boolean;
```

##### Inherited from

```ts
Slotable.equals
```

#### Call Signature

```typescript
equals(value: unknown): value is Element<N>;
```

##### Inherited from

```ts
Slotable.equals
```

## externalId

### externalId

#### Get Signature

```typescript
get externalId(): string | undefined;
```

##### Returns

`string` \| `undefined`

#### Inherited from

```ts
Slotable.externalId
```

## extraData

### extraData

#### Get Signature

```typescript
get extraData(): any;
```

##### Returns

`any`

#### Inherited from

```ts
Slotable.extraData
```

## first

### first()

```typescript
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

#### Inherited from

```ts
Slotable.first
```

## following

### following()

```typescript
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

#### Inherited from

```ts
Slotable.following
```

## freeze

### freeze()

```typescript
freeze(): this;
```

#### Inherited from

```ts
Slotable.freeze
```

## frozen

### frozen

#### Get Signature

```typescript
get frozen(): boolean;
```

##### Returns

`boolean`

#### Inherited from

```ts
Slotable.frozen
```

## getBoundingBox

### getBoundingBox()

```typescript
getBoundingBox(device: Device): Option<Rectangle>;
```

## hash

### hash()

```typescript
hash(hash: Hash): void;
```

#### Inherited from

```ts
Slotable.hash
```

## id

### id

#### Get Signature

```typescript
get id(): Option<string>;
```

##### Returns

`Option`\<`string`\>

## inclusiveAncestors

### inclusiveAncestors()

```typescript
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

#### Inherited from

```ts
Slotable.inclusiveAncestors
```

## inclusiveDescendants

### inclusiveDescendants()

```typescript
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

#### Inherited from

```ts
Slotable.inclusiveDescendants
```

## inclusiveSiblings

### inclusiveSiblings()

```typescript
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

#### Inherited from

```ts
Slotable.inclusiveSiblings
```

## index

### index()

```typescript
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

#### Inherited from

```ts
Slotable.index
```

## inputType

### inputType()

```typescript
inputType(this: Element<"input">): InputType;
```

## internalId

### internalId

#### Get Signature

```typescript
get internalId(): string;
```

##### Returns

`string`

#### Inherited from

```ts
Slotable.internalId
```

## isAncestorOf

### isAncestorOf()

```typescript
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

#### Inherited from

```ts
Slotable.isAncestorOf
```

## isChildOf

### isChildOf()

```typescript
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

#### Inherited from

```ts
Slotable.isChildOf
```

## isDescendantOf

### isDescendantOf()

```typescript
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

#### Inherited from

```ts
Slotable.isDescendantOf
```

## isInclusiveAncestorOf

### isInclusiveAncestorOf()

```typescript
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

#### Inherited from

```ts
Slotable.isInclusiveAncestorOf
```

## isInclusiveDescendantsOf

### isInclusiveDescendantsOf()

```typescript
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

#### Inherited from

```ts
Slotable.isInclusiveDescendantsOf
```

## isInclusiveSiblingOf

### isInclusiveSiblingOf()

```typescript
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

#### Inherited from

```ts
Slotable.isInclusiveSiblingOf
```

## isInert

### isInert()

```typescript
isInert(): boolean;
```

## isParentOf

### isParentOf()

```typescript
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

#### Inherited from

```ts
Slotable.isParentOf
```

## isRootOf

### isRootOf()

```typescript
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

#### Inherited from

```ts
Slotable.isRootOf
```

## isSiblingOf

### isSiblingOf()

```typescript
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

#### Inherited from

```ts
Slotable.isSiblingOf
```

## isSummaryForItsParentDetails

### isSummaryForItsParentDetails()

```typescript
isSummaryForItsParentDetails(this: Element<"summary">): boolean;
```

## isVoid

### isVoid()

```typescript
isVoid(): boolean;
```

## last

### last()

```typescript
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

#### Inherited from

```ts
Slotable.last
```

## name

### name

#### Get Signature

```typescript
get name(): N;
```

##### Returns

`N`

## namespace

### namespace

#### Get Signature

```typescript
get namespace(): Option<Namespace>;
```

##### Returns

`Option`\<[`Namespace`](Namespace-1.md)\>

## next

### next()

```typescript
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

#### Inherited from

```ts
Slotable.next
```

## of

### of()

```typescript
static of<N extends string = string>(
   namespace: Option<Namespace>, 
   prefix: Option<string>, 
   name: N, 
   attributes?: Iterable<Attribute<string>>, 
   children?: Iterable<Node>, 
   style?: Option<Block>, 
   box?: Option<Rectangle>, 
   device?: Option<Device>, 
   externalId?: string, 
   internalId?: string, 
   extraData?: any
): Element<N>;
```

## optionsList

### optionsList()

```typescript
optionsList(this: Element<"select">): Sequence<Element<"option">>;
```

## parent

### parent()

#### Call Signature

```typescript
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

##### Inherited from

```ts
Slotable.parent
```

#### Call Signature

```typescript
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

##### Inherited from

```ts
Slotable.parent
```

## path

### path()

```typescript
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

#### Inherited from

```ts
Slotable.path
```

## preceding

### preceding()

```typescript
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

#### Inherited from

```ts
Slotable.preceding
```

## prefix

### prefix

#### Get Signature

```typescript
get prefix(): Option<string>;
```

##### Returns

`Option`\<`string`\>

## previous

### previous()

```typescript
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

#### Inherited from

```ts
Slotable.previous
```

## qualifiedName

### qualifiedName

#### Get Signature

```typescript
get qualifiedName(): string;
```

##### Returns

`string`

## root

### root()

```typescript
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

#### Inherited from

```ts
Slotable.root
```

## serializationId

### serializationId

#### Get Signature

```typescript
get serializationId(): string | undefined;
```

##### Returns

`string` \| `undefined`

#### Inherited from

```ts
Slotable.serializationId
```

## shadow

### shadow

#### Get Signature

```typescript
get shadow(): Option<Shadow>;
```

##### Returns

`Option`\<[`Shadow`](Shadow-1.md)\>

## siblings

### siblings()

```typescript
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

#### Inherited from

```ts
Slotable.siblings
```

## slotableName

### slotableName()

```typescript
slotableName(): string;
```

#### Overrides

```ts
Slotable.slotableName
```

## slotName

### slotName()

```typescript
slotName(this: Slot): string;
```

## style

### style

#### Get Signature

```typescript
get style(): Option<Block>;
```

##### Returns

`Option`\<[`Block`](Block-1.md)\>

## tabIndex

### tabIndex()

```typescript
tabIndex(): Option<number>;
```

## tabOrder

### tabOrder()

```typescript
tabOrder(this: Node): Sequence<Element<string>>;
```

#### Inherited from

```ts
Slotable.tabOrder
```

## textContent

### textContent()

```typescript
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

#### Inherited from

```ts
Slotable.textContent
```

## toEARL

### toEARL()

```typescript
toEARL(): EARL;
```

#### Inherited from

```ts
Slotable.toEARL
```

## toJSON

### toJSON()

#### Call Signature

```typescript
toJSON(options: SerializationOptions & {
  verbosity: Minimal | Low;
}): MinimalJSON;
```

##### Overrides

```ts
Slotable.toJSON
```

#### Call Signature

```typescript
toJSON(options: SerializationOptions & {
  verbosity: High;
}): JSON<string> & {
  assignedSlot: MinimalJSON | null;
};
```

##### Overrides

```ts
Slotable.toJSON
```

#### Call Signature

```typescript
toJSON(options?: SerializationOptions): JSON<N>;
```

##### Overrides

```ts
Slotable.toJSON
```

## toSARIF

### toSARIF()

```typescript
toSARIF(): Location;
```

#### Inherited from

```ts
Slotable.toSARIF
```

## toString

### toString()

```typescript
toString(): string;
```

## type

### type

#### Get Signature

```typescript
get type(): T;
```

##### Returns

`T`

#### Inherited from

```ts
Slotable.type
```
