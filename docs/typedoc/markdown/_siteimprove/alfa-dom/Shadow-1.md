[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Shadow

# Class: Shadow

Defined in: [alfa-dom/src/node/shadow.ts:18](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L18)

## Extends

- `BaseNode`\<`"shadow"`\>

## Constructors

### Constructor

> `protected` **new Shadow**(`children`, `style`, `mode`, `externalId?`, `internalId?`, `extraData?`): `Shadow`

Defined in: [alfa-dom/src/node/shadow.ts:45](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L45)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `children` | [`Node`](Node-1.md)[] |
| `style` | [`Sheet`](Sheet-1.md)[] |
| `mode` | [`Mode`](Shadow/Mode.md) |
| `externalId?` | `string` |
| `internalId?` | `string` |
| `extraData?` | `any` |

#### Returns

`Shadow`

#### Overrides

`BaseNode<"shadow">.constructor`

## [iterator]

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:176

#### Returns

`Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

#### Inherited from

`BaseNode.[iterator]`

## _attachHost

### \_attachHost()

> **\_attachHost**(`host`): `boolean`

Defined in: [alfa-dom/src/node/shadow.ts:150](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L150)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `host` | [`Element`](Element-1.md) |

#### Returns

`boolean`

## _attachParent

### \_attachParent()

> **\_attachParent**(): `boolean`

Defined in: [alfa-dom/src/node/shadow.ts:143](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L143)

**`Internal`**

#### Returns

`boolean`

#### Overrides

`BaseNode._attachParent`

## _children

### \_children

> `protected` `readonly` **\_children**: `Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>[]

Defined in: alfa-tree/dist/tree.d.ts:27

#### Inherited from

`BaseNode._children`

## _frozen

### \_frozen

> `protected` **\_frozen**: `boolean`

Defined in: alfa-tree/dist/tree.d.ts:44

Whether the node is frozen.

#### Remarks

As nodes are initialized without a parent and possibly attached to a parent
after construction, this makes hierarchies of nodes mutable. That is, a
node without a parent node may be assigned one by being passed as a child
to a parent node. When this happens, a node becomes frozen. Nodes can also
become frozen before being assigned a parent by using the `Node#freeze()`
method.

#### Inherited from

`BaseNode._frozen`

## _internalPath

### \_internalPath()

> `protected` **\_internalPath**(`options?`): `string`

Defined in: [alfa-dom/src/node/shadow.ts:86](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L86)

**`Internal`**

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

#### Returns

`string`

#### Overrides

`BaseNode._internalPath`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:28

#### Inherited from

`BaseNode._parent`

## _type

### \_type

> `protected` `readonly` **\_type**: `"shadow"`

Defined in: alfa-tree/dist/tree.d.ts:29

#### Inherited from

`BaseNode._type`

## ancestors

### ancestors()

> **ancestors**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:333](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L333)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.ancestors`

## children

### children()

> **children**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:327](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L327)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.children`

## closest

### closest()

#### Call Signature

> **closest**\<`T`\>(`refinement`, `options?`): `Option`\<`T`\>

Defined in: [alfa-dom/src/node/node.ts:348](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L348)

##### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`Node`](Node-1.md) |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `refinement` | `Refinement`\<[`Node`](Node-1.md), `T`\> |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

##### Returns

`Option`\<`T`\>

##### Inherited from

`BaseNode.closest`

#### Call Signature

> **closest**(`predicate`, `options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:352](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L352)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Node`](Node-1.md)\> |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

`BaseNode.closest`

## descendants

### descendants()

> **descendants**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:329](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L329)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.descendants`

## empty

### empty()

> `static` **empty**(): `Shadow`

Defined in: [alfa-dom/src/node/shadow.ts:37](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L37)

#### Returns

`Shadow`

## equals

### equals()

#### Call Signature

> **equals**(`value`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:264](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L264)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `BaseNode` |

##### Returns

`boolean`

##### Inherited from

`BaseNode.equals`

#### Call Signature

> **equals**(`value`): `value is Shadow`

Defined in: [alfa-dom/src/node/node.ts:266](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L266)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Shadow`

##### Inherited from

`BaseNode.equals`

## externalId

### externalId

#### Get Signature

> **get** **externalId**(): `string` \| `undefined`

Defined in: alfa-tree/dist/tree.d.ts:47

##### Returns

`string` \| `undefined`

#### Inherited from

`BaseNode.externalId`

## extraData

### extraData

#### Get Signature

> **get** **extraData**(): `any`

Defined in: alfa-tree/dist/tree.d.ts:48

##### Returns

`any`

#### Inherited from

`BaseNode.extraData`

## first

### first()

> **first**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:343](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L343)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.first`

## following

### following()

> **following**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:342](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L342)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.following`

## freeze

### freeze()

> **freeze**(): `this`

Defined in: alfa-tree/dist/tree.d.ts:59

Freeze the node. This prevents further expansion of the node hierarchy,
meaning that the node can no longer be passed as a child to a parent node.

#### Returns

`this`

#### Inherited from

`BaseNode.freeze`

## frozen

### frozen

#### Get Signature

> **get** **frozen**(): `boolean`

Defined in: alfa-tree/dist/tree.d.ts:54

##### Returns

`boolean`

#### Inherited from

`BaseNode.frozen`

## hash

### hash()

> **hash**(`hash`): `void`

Defined in: alfa-tree/dist/tree.d.ts:179

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `Hash` |

#### Returns

`void`

#### Inherited from

`BaseNode.hash`

## host

### host

#### Get Signature

> **get** **host**(): `Option`\<[`Element`](Element-1.md)\<`string`\>\>

Defined in: [alfa-dom/src/node/shadow.ts:63](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L63)

##### Returns

`Option`\<[`Element`](Element-1.md)\<`string`\>\>

## inclusiveAncestors

### inclusiveAncestors()

> **inclusiveAncestors**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:335](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L335)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.inclusiveAncestors`

## inclusiveDescendants

### inclusiveDescendants()

> **inclusiveDescendants**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:331](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L331)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.inclusiveDescendants`

## inclusiveSiblings

### inclusiveSiblings()

> **inclusiveSiblings**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:339](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L339)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.inclusiveSiblings`

## index

### index()

> **index**(`options?`, `predicate?`): `number`

Defined in: [alfa-dom/src/node/node.ts:347](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L347)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |
| `predicate?` | `Predicate`\<[`Node`](Node-1.md)\> |

#### Returns

`number`

#### Inherited from

`BaseNode.index`

## internalId

### internalId

#### Get Signature

> **get** **internalId**(): `string`

Defined in: alfa-tree/dist/tree.d.ts:49

##### Returns

`string`

#### Inherited from

`BaseNode.internalId`

## isAncestorOf

### isAncestorOf()

> **isAncestorOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:334](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L334)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isAncestorOf`

## isChildOf

### isChildOf()

> **isChildOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:328](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L328)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isChildOf`

## isDescendantOf

### isDescendantOf()

> **isDescendantOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:330](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L330)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isDescendantOf`

## isInclusiveAncestorOf

### isInclusiveAncestorOf()

> **isInclusiveAncestorOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:336](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L336)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isInclusiveAncestorOf`

## isInclusiveDescendantsOf

### isInclusiveDescendantsOf()

> **isInclusiveDescendantsOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:332](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L332)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isInclusiveDescendantsOf`

## isInclusiveSiblingOf

### isInclusiveSiblingOf()

> **isInclusiveSiblingOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:340](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L340)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isInclusiveSiblingOf`

## isParentOf

### isParentOf()

> **isParentOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:324](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L324)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isParentOf`

## isRootOf

### isRootOf()

> **isRootOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:326](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L326)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isRootOf`

## isSiblingOf

### isSiblingOf()

> **isSiblingOf**(`node`, `options?`): `boolean`

Defined in: [alfa-dom/src/node/node.ts:338](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L338)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](Node-1.md) |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`boolean`

#### Inherited from

`BaseNode.isSiblingOf`

## last

### last()

> **last**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:344](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L344)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.last`

## mode

### mode

#### Get Signature

> **get** **mode**(): [`Mode`](Shadow/Mode.md)

Defined in: [alfa-dom/src/node/shadow.ts:59](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L59)

##### Returns

[`Mode`](Shadow/Mode.md)

## next

### next()

> **next**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:346](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L346)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.next`

## of

### of()

> `static` **of**(`children`, `style?`, `mode?`, `externalId?`, `internalId?`, `extraData?`): `Shadow`

Defined in: [alfa-dom/src/node/shadow.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L19)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `children` | `Iterable`\<[`Node`](Node-1.md)\> | `undefined` |
| `style` | `Iterable`\<[`Sheet`](Sheet-1.md)\> | `[]` |
| `mode` | [`Mode`](Shadow/Mode.md) | `Shadow.Mode.Open` |
| `externalId?` | `string` | `undefined` |
| `internalId?` | `string` | `undefined` |
| `extraData?` | `any` | `undefined` |

#### Returns

`Shadow`

## parent

### parent()

> **parent**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/shadow.ts:71](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L71)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Private Remarks

The type assertions to `Node` in here are technically incorrect.
BaseNode could be extended to another class which is then not added to the
Node union, in which case the assertions would be wrong. This scenario is
however quite unlikely given that BaseNode is not exported out of this
package. So it is only a matter of us not doing so, which sound OK enough.
It is not possible at this level to do any sort of runtime type checking
without creating circular dependencies, and the parent method here has
to extends the one in `alfa-tree/Node`.

#### Overrides

`BaseNode.parent`

## path

### path()

> **path**(`options?`): `string`

Defined in: [alfa-dom/src/node/node.ts:256](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L256)

Get an XPath that uniquely identifies the node across descendants of its
root.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

#### Returns

`string`

#### Inherited from

`BaseNode.path`

## preceding

### preceding()

> **preceding**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:341](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L341)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.preceding`

## previous

### previous()

> **previous**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:345](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L345)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Option`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.previous`

## root

### root()

> **root**(`options?`): [`Node`](Node-1.md)

Defined in: [alfa-dom/src/node/node.ts:325](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L325)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

[`Node`](Node-1.md)

#### Inherited from

`BaseNode.root`

## serializationId

### serializationId

#### Get Signature

> **get** **serializationId**(): `string` \| `undefined`

Defined in: alfa-tree/dist/tree.d.ts:53

##### Deprecated

Aliases to [Node#internalId](Attribute-1.md#internalid).

##### Returns

`string` \| `undefined`

#### Inherited from

`BaseNode.serializationId`

## siblings

### siblings()

> **siblings**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:337](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L337)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Inherited from

`BaseNode.siblings`

## style

### style

#### Get Signature

> **get** **style**(): `Iterable`\<[`Sheet`](Sheet-1.md)\>

Defined in: [alfa-dom/src/node/shadow.ts:67](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L67)

##### Returns

`Iterable`\<[`Sheet`](Sheet-1.md)\>

## tabOrder

### tabOrder()

> **tabOrder**(`this`): `Sequence`\<[`Element`](Element-1.md)\<`string`\>\>

Defined in: [alfa-dom/src/node/node.ts:59](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L59)

Construct a sequence of descendants of this node sorted by tab index. Only
nodes with a non-negative tab index are included in the sequence.

[https://html.spec.whatwg.org/multipage/#tabindex-value](https://html.spec.whatwg.org/multipage/#tabindex-value)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | [`Node`](Node-1.md) |

#### Returns

`Sequence`\<[`Element`](Element-1.md)\<`string`\>\>

#### Inherited from

`BaseNode.tabOrder`

## textContent

### textContent()

> **textContent**(`options?`): `string`

Defined in: [alfa-dom/src/node/node.ts:47](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L47)

[https://dom.spec.whatwg.org/#concept-descendant-text-content](https://dom.spec.whatwg.org/#concept-descendant-text-content)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

#### Returns

`string`

#### Inherited from

`BaseNode.textContent`

## toEARL

### toEARL()

> **toEARL**(): `EARL`

Defined in: [alfa-dom/src/node/node.ts:291](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L291)

#### Returns

`EARL`

#### Inherited from

`BaseNode.toEARL`

## toJSON

### toJSON()

#### Call Signature

> **toJSON**(`options`): [`MinimalJSON`](Shadow/MinimalJSON.md)

Defined in: [alfa-dom/src/node/shadow.ts:103](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L103)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `SerializationOptions` & `object` |

##### Returns

[`MinimalJSON`](Shadow/MinimalJSON.md)

##### Overrides

`BaseNode.toJSON`

#### Call Signature

> **toJSON**(`options?`): [`JSON`](Shadow/JSON.md)

Defined in: [alfa-dom/src/node/shadow.ts:110](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L110)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `SerializationOptions` |

##### Returns

[`JSON`](Shadow/JSON.md)

##### Overrides

`BaseNode.toJSON`

## toSARIF

### toSARIF()

> **toSARIF**(): `Location`

Defined in: [alfa-dom/src/node/node.ts:306](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L306)

#### Returns

`Location`

#### Inherited from

`BaseNode.toSARIF`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/node/shadow.ts:130](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/shadow.ts#L130)

Returns a string representation of an object.

#### Returns

`string`

## type

### type

#### Get Signature

> **get** **type**(): `T`

Defined in: alfa-tree/dist/tree.d.ts:46

##### Returns

`T`

#### Inherited from

`BaseNode.type`
