# Class: Element\<N\>

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Extends

- `Slotable`\<`"element"`\>

## Type Parameters

### N

`N` *extends* `string` = `string`

## Constructors

### Constructor

```ts
protected new Element<N>(
   namespace, 
   prefix, 
   name, 
   attributes, 
   children, 
   style, 
   box, 
   device, 
   externalId?, 
   internalId?, 
extraData?): Element<N>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### namespace

`Option`\<[`Namespace`](Namespace-1.md)\>

##### prefix

`Option`\<`string`\>

##### name

`N`

##### attributes

[`Attribute`](Attribute-1.md)\<`string`\>[]

##### children

[`Node`](Node-1.md)[]

##### style

`Option`\<[`Block`](Block-1.md)\>

##### box

`Option`\<`Rectangle`\>

##### device

`Option`\<`Device`\>

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Element`\<`N`\>

#### Overrides

```ts
Slotable<"element">.constructor
```

## _attachContent

### \_attachContent()

```ts
_attachContent(document): boolean;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### document

[`Document`](Document-1.md)

#### Returns

`boolean`

## _attachParent

### \_attachParent()

```ts
_attachParent(parent): boolean;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Parameters

##### parent

`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable._attachParent
```

## _attachShadow

### \_attachShadow()

```ts
_attachShadow(shadow): boolean;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### shadow

[`Shadow`](Shadow-1.md)

#### Returns

`boolean`

## _children

### \_children

```ts
protected readonly _children: Node<"DOM traversal", 1 | 2 | 4, string>[];
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
Slotable._children
```

## _displaySize

### \_displaySize

```ts
protected _displaySize: number | undefined;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## _frozen

### \_frozen

```ts
protected _frozen: boolean;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
Slotable._frozen
```

## _inputType

### \_inputType

```ts
protected _inputType: InputType | undefined;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## _internalPath

### \_internalPath()

```ts
protected _internalPath(options?): string;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`string`

#### Overrides

```ts
Slotable._internalPath
```

## _optionsList

### \_optionsList

```ts
protected _optionsList: Sequence<Element<"option">> | undefined;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## _parent

### \_parent

```ts
protected _parent: Option<Node<"DOM traversal", 1 | 2 | 4, string>>;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
Slotable._parent
```

## _type

### \_type

```ts
protected readonly _type: "element";
```

Defined in: alfa-tree/dist/tree.d.ts

#### Inherited from

```ts
Slotable._type
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
Slotable.[iterator]
```

## ancestors

### ancestors()

```ts
ancestors(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.ancestors
```

## assignedNodes

### assignedNodes()

```ts
assignedNodes(this): Iterable<Slotable>;
```

Defined in: [alfa-dom/src/node/slotable/slot.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/slot.ts)

#### Parameters

##### this

`Slot`

#### Returns

`Iterable`\<[`Slotable`](Slotable-1.md)\>

## assignedSlot

### assignedSlot()

```ts
assignedSlot(): Option<Slot>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Returns

`Option`\<`Slot`\>

#### Overrides

```ts
Slotable.assignedSlot
```

## attribute

### attribute()

#### Call Signature

```ts
attribute<A>(name): Option<Attribute<A>>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Type Parameters

###### A

`A` *extends* `string` = `string`

##### Parameters

###### name

`A`

##### Returns

`Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

#### Call Signature

```ts
attribute<A>(predicate): Option<Attribute<A>>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Type Parameters

###### A

`A` *extends* `string` = `string`

##### Parameters

###### predicate

`Predicate`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

##### Returns

`Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

## attributes

### attributes

#### Get Signature

```ts
get attributes(): Sequence<Attribute<string>>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Sequence`\<[`Attribute`](Attribute-1.md)\<`string`\>\>

## children

### children()

```ts
children(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Overrides

```ts
Slotable.children
```

## classes

### classes

#### Get Signature

```ts
get classes(): Sequence<string>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Sequence`\<`string`\>

## closest

### closest()

#### Call Signature

```ts
closest<T>(refinement, options?): Option<T>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Type Parameters

###### T

`T` *extends* [`Node`](Node-1.md)

##### Parameters

###### refinement

`Refinement`\<[`Node`](Node-1.md), `T`\>

###### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

##### Returns

`Option`\<`T`\>

##### Inherited from

```ts
Slotable.closest
```

#### Call Signature

```ts
closest(predicate, options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### predicate

`Predicate`\<[`Node`](Node-1.md)\>

###### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

```ts
Slotable.closest
```

## content

### content

#### Get Signature

```ts
get content(): Option<Document>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<[`Document`](Document-1.md)\>

## descendants

### descendants()

```ts
descendants(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.descendants
```

## displaySize

### displaySize()

```ts
displaySize(this): number;
```

Defined in: [alfa-dom/src/node/element/augment.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts)

#### Parameters

##### this

`Element`\<`"select"`\>

#### Returns

`number`

## equals

### equals()

#### Call Signature

```ts
equals(value): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### value

`BaseNode`

##### Returns

`boolean`

##### Inherited from

```ts
Slotable.equals
```

#### Call Signature

```ts
equals(value): value is Element<N>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Element<N>`

##### Inherited from

```ts
Slotable.equals
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
Slotable.externalId
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
Slotable.extraData
```

## first

### first()

```ts
first(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.first
```

## following

### following()

```ts
following(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.following
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
Slotable.freeze
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
Slotable.frozen
```

## getBoundingBox

### getBoundingBox()

```ts
getBoundingBox(device): Option<Rectangle>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Parameters

##### device

`Device`

#### Returns

`Option`\<`Rectangle`\>

## hash

### hash()

```ts
hash(hash): void;
```

Defined in: alfa-tree/dist/tree.d.ts

#### Parameters

##### hash

`Hash`

#### Returns

`void`

#### Inherited from

```ts
Slotable.hash
```

## id

### id

#### Get Signature

```ts
get id(): Option<string>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<`string`\>

## inclusiveAncestors

### inclusiveAncestors()

```ts
inclusiveAncestors(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.inclusiveAncestors
```

## inclusiveDescendants

### inclusiveDescendants()

```ts
inclusiveDescendants(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.inclusiveDescendants
```

## inclusiveSiblings

### inclusiveSiblings()

```ts
inclusiveSiblings(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.inclusiveSiblings
```

## index

### index()

```ts
index(options?, predicate?): number;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

##### predicate?

`Predicate`\<[`Node`](Node-1.md)\>

#### Returns

`number`

#### Inherited from

```ts
Slotable.index
```

## inputType

### inputType()

```ts
inputType(this): InputType;
```

Defined in: [alfa-dom/src/node/element/augment.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts)

#### Parameters

##### this

`Element`\<`"input"`\>

#### Returns

`InputType`

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
Slotable.internalId
```

## isAncestorOf

### isAncestorOf()

```ts
isAncestorOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isAncestorOf
```

## isChildOf

### isChildOf()

```ts
isChildOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isChildOf
```

## isDescendantOf

### isDescendantOf()

```ts
isDescendantOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isDescendantOf
```

## isInclusiveAncestorOf

### isInclusiveAncestorOf()

```ts
isInclusiveAncestorOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isInclusiveAncestorOf
```

## isInclusiveDescendantsOf

### isInclusiveDescendantsOf()

```ts
isInclusiveDescendantsOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isInclusiveDescendantsOf
```

## isInclusiveSiblingOf

### isInclusiveSiblingOf()

```ts
isInclusiveSiblingOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isInclusiveSiblingOf
```

## isInert

### isInert()

```ts
isInert(): boolean;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Returns

`boolean`

## isParentOf

### isParentOf()

```ts
isParentOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isParentOf
```

## isRootOf

### isRootOf()

```ts
isRootOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isRootOf
```

## isSiblingOf

### isSiblingOf()

```ts
isSiblingOf(node, options?): boolean;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### node

[`Node`](Node-1.md)

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`boolean`

#### Inherited from

```ts
Slotable.isSiblingOf
```

## isSummaryForItsParentDetails

### isSummaryForItsParentDetails()

```ts
isSummaryForItsParentDetails(this): boolean;
```

Defined in: [alfa-dom/src/node/element/augment.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts)

#### Parameters

##### this

`Element`\<`"summary"`\>

#### Returns

`boolean`

## isVoid

### isVoid()

```ts
isVoid(): boolean;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Returns

`boolean`

## last

### last()

```ts
last(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.last
```

## name

### name

#### Get Signature

```ts
get name(): N;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`N`

## namespace

### namespace

#### Get Signature

```ts
get namespace(): Option<Namespace>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<[`Namespace`](Namespace-1.md)\>

## next

### next()

```ts
next(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.next
```

## of

### of()

```ts
static of<N>(
   namespace, 
   prefix, 
   name, 
   attributes?, 
   children?, 
   style?, 
   box?, 
   device?, 
   externalId?, 
   internalId?, 
extraData?): Element<N>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Type Parameters

##### N

`N` *extends* `string` = `string`

#### Parameters

##### namespace

`Option`\<[`Namespace`](Namespace-1.md)\>

##### prefix

`Option`\<`string`\>

##### name

`N`

##### attributes?

`Iterable`\<[`Attribute`](Attribute-1.md)\<`string`\>\> = `[]`

##### children?

`Iterable`\<[`Node`](Node-1.md)\> = `[]`

##### style?

`Option`\<[`Block`](Block-1.md)\> = `None`

##### box?

`Option`\<`Rectangle`\> = `None`

##### device?

`Option`\<`Device`\> = `None`

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Element`\<`N`\>

## optionsList

### optionsList()

```ts
optionsList(this): Sequence<Element<"option">>;
```

Defined in: [alfa-dom/src/node/element/augment.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts)

#### Parameters

##### this

`Element`\<`"select"`\>

#### Returns

`Sequence`\<`Element`\<`"option"`\>\>

## parent

### parent()

#### Call Signature

```ts
parent(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

```ts
Slotable.parent
```

#### Call Signature

```ts
parent(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

```ts
Slotable.parent
```

## path

### path()

```ts
path(options?): string;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`string`

#### Inherited from

```ts
Slotable.path
```

## preceding

### preceding()

```ts
preceding(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.preceding
```

## prefix

### prefix

#### Get Signature

```ts
get prefix(): Option<string>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<`string`\>

## previous

### previous()

```ts
previous(options?): Option<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.previous
```

## qualifiedName

### qualifiedName

#### Get Signature

```ts
get qualifiedName(): string;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`string`

## root

### root()

```ts
root(options?): Node;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

[`Node`](Node-1.md)

#### Inherited from

```ts
Slotable.root
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
Slotable.serializationId
```

## shadow

### shadow

#### Get Signature

```ts
get shadow(): Option<Shadow>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<[`Shadow`](Shadow-1.md)\>

## siblings

### siblings()

```ts
siblings(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

```ts
Slotable.siblings
```

## slotableName

### slotableName()

```ts
slotableName(): string;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Returns

`string`

#### Overrides

```ts
Slotable.slotableName
```

## slotName

### slotName()

```ts
slotName(this): string;
```

Defined in: [alfa-dom/src/node/slotable/slot.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/slot.ts)

#### Parameters

##### this

`Slot`

#### Returns

`string`

## style

### style

#### Get Signature

```ts
get style(): Option<Block>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Returns

`Option`\<[`Block`](Block-1.md)\>

## tabIndex

### tabIndex()

```ts
tabIndex(): Option<number>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

#### Returns

`Option`\<`number`\>

## tabOrder

### tabOrder()

```ts
tabOrder(this): Sequence<Element<string>>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### this

[`Node`](Node-1.md)

#### Returns

`Sequence`\<`Element`\<`string`\>\>

#### Inherited from

```ts
Slotable.tabOrder
```

## textContent

### textContent()

```ts
textContent(options?): string;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> = `BaseNode.Traversal.empty`

#### Returns

`string`

#### Inherited from

```ts
Slotable.textContent
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
Slotable.toEARL
```

## toJSON

### toJSON()

#### Call Signature

```ts
toJSON(options): MinimalJSON;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Parameters

###### options

`SerializationOptions` & `object`

##### Returns

[`MinimalJSON`](Element/MinimalJSON.md)

##### Overrides

```ts
Slotable.toJSON
```

#### Call Signature

```ts
toJSON(options): JSON<string> & object;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Parameters

###### options

`SerializationOptions` & `object`

##### Returns

##### Overrides

```ts
Slotable.toJSON
```

#### Call Signature

```ts
toJSON(options?): JSON<N>;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

##### Parameters

###### options?

`SerializationOptions`

##### Returns

[`JSON`](Element/JSON.md)\<`N`\>

##### Overrides

```ts
Slotable.toJSON
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
Slotable.toSARIF
```

## toString

### toString()

```ts
toString(): string;
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

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
Slotable.type
```
