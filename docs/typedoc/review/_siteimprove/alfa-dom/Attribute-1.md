# Class: Attribute\<N\>

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

## Extends

- `BaseNode`\<`"attribute"`\>

## Type Parameters

### N

`N` *extends* `string` = `string`

## Constructors

### Constructor

```ts
protected new Attribute<N>(
   namespace, 
   prefix, 
   name, 
   value, 
   externalId?, 
   internalId?, 
extraData?): Attribute<N>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

#### Parameters

##### namespace

`Option`\<[`Namespace`](Namespace-1.md)\>

##### prefix

`Option`\<`string`\>

##### name

`N`

##### value

`string`

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Attribute`\<`N`\>

#### Overrides

```ts
BaseNode<"attribute">.constructor
```

## _attachOwner

### \_attachOwner()

```ts
_attachOwner(owner): boolean;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

#### Parameters

##### owner

[`Element`](Element-1.md)

#### Returns

`boolean`

## _attachParent

### \_attachParent()

```ts
_attachParent(): boolean;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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
protected _internalPath(options?): string;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

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
protected readonly _type: "attribute";
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
BaseNode.ancestors
```

## children

### children()

```ts
children(options?): Sequence<Node>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

#### Parameters

##### options?

`object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\>

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
BaseNode.closest
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
BaseNode.closest
```

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
BaseNode.descendants
```

## enumerate

### enumerate()

#### Call Signature

```ts
enumerate(): Option<string>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Returns

`Option`\<`string`\>

#### Call Signature

```ts
enumerate<T>(valid, ...rest): Option<T>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Type Parameters

###### T

`T` *extends* `string`

##### Parameters

###### valid

`T`

###### rest

...`T`[]

##### Returns

`Option`\<`T`\>

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
BaseNode.equals
```

#### Call Signature

```ts
equals(value): value is Attribute<N>;
```

Defined in: [alfa-dom/src/node/node.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts)

##### Parameters

###### value

`unknown`

##### Returns

`value is Attribute<N>`

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
BaseNode.first
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
BaseNode.hash
```

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
BaseNode.inclusiveAncestors
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
BaseNode.inclusiveDescendants
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
BaseNode.inclusiveSiblings
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
BaseNode.isAncestorOf
```

## isBoolean

### isBoolean()

```ts
isBoolean(): boolean;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

#### Returns

`boolean`

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
BaseNode.isChildOf
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
BaseNode.isDescendantOf
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
BaseNode.isInclusiveAncestorOf
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
BaseNode.isInclusiveDescendantsOf
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
BaseNode.isInclusiveSiblingOf
```

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
BaseNode.isParentOf
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
BaseNode.isRootOf
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
BaseNode.isSiblingOf
```

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
BaseNode.last
```

## name

### name

#### Get Signature

```ts
get name(): N | Lowercase<N>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Returns

`N` \| `Lowercase`\<`N`\>

## namespace

### namespace

#### Get Signature

```ts
get namespace(): Option<Namespace>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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
BaseNode.next
```

## of

### of()

```ts
static of<N>(
   namespace, 
   prefix, 
   name, 
   value, 
   externalId?, 
   internalId?, 
extraData?): Attribute<N>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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

##### value

`string`

##### externalId?

`string`

##### internalId?

`string`

##### extraData?

`any`

#### Returns

`Attribute`\<`N`\>

## owner

### owner

#### Get Signature

```ts
get owner(): Option<Element<string>>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

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
BaseNode.parent
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
BaseNode.parent
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
BaseNode.path
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
BaseNode.preceding
```

## prefix

### prefix

#### Get Signature

```ts
get prefix(): Option<string>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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
BaseNode.previous
```

## qualifiedName

### qualifiedName

#### Get Signature

```ts
get qualifiedName(): string;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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
BaseNode.siblings
```

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

`Sequence`\<[`Element`](Element-1.md)\<`string`\>\>

#### Inherited from

```ts
BaseNode.tabOrder
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
toJSON(options): MinimalJSON;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Parameters

###### options

`SerializationOptions` & `object`

##### Returns

[`MinimalJSON`](Attribute/MinimalJSON.md)

##### Overrides

```ts
BaseNode.toJSON
```

#### Call Signature

```ts
toJSON(options?): JSON<N>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Parameters

###### options?

`SerializationOptions`

##### Returns

[`JSON`](Attribute/JSON.md)\<`N`\>

##### Overrides

```ts
BaseNode.toJSON
```

## tokens

### tokens()

```ts
tokens(separator?): Sequence<string>;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

#### Parameters

##### separator?

`string` \| `RegExp`

#### Returns

`Sequence`\<`string`\>

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

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

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

## value

### value

#### Get Signature

```ts
get value(): string;
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

##### Returns

`string`
