[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Text

# Class: Text

Defined in: [alfa-dom/src/node/slotable/text.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L19)

## Extends

- `Slotable`\<`"text"`\>

## Constructors

### Constructor

> `protected` **new Text**(`data`, `box`, `device`, `externalId?`, `internalId?`, `extraData?`): `Text`

Defined in: [alfa-dom/src/node/slotable/text.ts:38](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L38)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `string` |
| `box` | `Option`\<`Rectangle`\> |
| `device` | `Option`\<`Device`\> |
| `externalId?` | `string` |
| `internalId?` | `string` |
| `extraData?` | `any` |

#### Returns

`Text`

#### Overrides

`Slotable<"text">.constructor`

## [iterator]

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:176

#### Returns

`Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

#### Inherited from

`Slotable.[iterator]`

## _attachParent

### \_attachParent()

> **\_attachParent**(`parent`): `boolean`

Defined in: alfa-tree/dist/tree.d.ts:184

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `parent` | `Node`\<`"DOM traversal"`, `1` \| `2` \| `4`\> |

#### Returns

`boolean`

#### Inherited from

`Slotable._attachParent`

## _children

### \_children

> `protected` `readonly` **\_children**: `Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>[]

Defined in: alfa-tree/dist/tree.d.ts:27

#### Inherited from

`Slotable._children`

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

`Slotable._frozen`

## _internalPath

### \_internalPath()

> `protected` **\_internalPath**(`options?`): `string`

Defined in: [alfa-dom/src/node/slotable/text.ts:89](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L89)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`string`

#### Overrides

`Slotable._internalPath`

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:28

#### Inherited from

`Slotable._parent`

## _type

### \_type

> `protected` `readonly` **\_type**: `"text"`

Defined in: alfa-tree/dist/tree.d.ts:29

#### Inherited from

`Slotable._type`

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

`Slotable.ancestors`

## assignedSlot

### assignedSlot()

> **assignedSlot**(): `Option`\<`Slot`\>

Defined in: [alfa-dom/src/node/slotable/text.ts:59](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L59)

Get the slot that this slotable is assigned to.

[https://dom.spec.whatwg.org/#dom-slotable-assignedslot](https://dom.spec.whatwg.org/#dom-slotable-assignedslot)
[https://dom.spec.whatwg.org/#find-a-slot](https://dom.spec.whatwg.org/#find-a-slot)

#### Returns

`Option`\<`Slot`\>

#### Private Remarks

While the implementation is the same for Element and Text nodes, it uses
type guards from Element and therefore cannot really live here without
creating circular dependencies.

#### Overrides

`Slotable.assignedSlot`

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

`Slotable.children`

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

`Slotable.closest`

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

`Slotable.closest`

## data

### data

#### Get Signature

> **get** **data**(): `string`

Defined in: [alfa-dom/src/node/slotable/text.ts:55](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L55)

##### Returns

`string`

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

`Slotable.descendants`

## empty

### empty()

> `static` **empty**(): `Text`

Defined in: [alfa-dom/src/node/slotable/text.ts:31](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L31)

#### Returns

`Text`

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

`Slotable.equals`

#### Call Signature

> **equals**(`value`): `value is Text`

Defined in: [alfa-dom/src/node/node.ts:266](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L266)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Text`

##### Inherited from

`Slotable.equals`

## externalId

### externalId

#### Get Signature

> **get** **externalId**(): `string` \| `undefined`

Defined in: alfa-tree/dist/tree.d.ts:47

##### Returns

`string` \| `undefined`

#### Inherited from

`Slotable.externalId`

## extraData

### extraData

#### Get Signature

> **get** **extraData**(): `any`

Defined in: alfa-tree/dist/tree.d.ts:48

##### Returns

`any`

#### Inherited from

`Slotable.extraData`

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

`Slotable.first`

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

`Slotable.following`

## freeze

### freeze()

> **freeze**(): `this`

Defined in: alfa-tree/dist/tree.d.ts:59

Freeze the node. This prevents further expansion of the node hierarchy,
meaning that the node can no longer be passed as a child to a parent node.

#### Returns

`this`

#### Inherited from

`Slotable.freeze`

## frozen

### frozen

#### Get Signature

> **get** **frozen**(): `boolean`

Defined in: alfa-tree/dist/tree.d.ts:54

##### Returns

`boolean`

#### Inherited from

`Slotable.frozen`

## getBoundingBox

### getBoundingBox()

> **getBoundingBox**(`device`): `Option`\<`Rectangle`\>

Defined in: [alfa-dom/src/node/slotable/text.ts:78](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L78)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `device` | `Device` |

#### Returns

`Option`\<`Rectangle`\>

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

`Slotable.hash`

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

`Slotable.inclusiveAncestors`

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

`Slotable.inclusiveDescendants`

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

`Slotable.inclusiveSiblings`

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

`Slotable.index`

## internalId

### internalId

#### Get Signature

> **get** **internalId**(): `string`

Defined in: alfa-tree/dist/tree.d.ts:49

##### Returns

`string`

#### Inherited from

`Slotable.internalId`

## is

### is()

> **is**(`predicate`): `boolean`

Defined in: [alfa-dom/src/node/slotable/text.ts:82](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L82)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<`string`\> |

#### Returns

`boolean`

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

`Slotable.isAncestorOf`

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

`Slotable.isChildOf`

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

`Slotable.isDescendantOf`

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

`Slotable.isInclusiveAncestorOf`

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

`Slotable.isInclusiveDescendantsOf`

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

`Slotable.isInclusiveSiblingOf`

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

`Slotable.isParentOf`

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

`Slotable.isRootOf`

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

`Slotable.isSiblingOf`

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

`Slotable.last`

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

`Slotable.next`

## of

### of()

> `static` **of**(`data`, `box?`, `device?`, `externalId?`, `internalId?`, `extraData?`): `Text`

Defined in: [alfa-dom/src/node/slotable/text.ts:20](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L20)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `data` | `string` | `undefined` |
| `box` | `Option`\<`Rectangle`\> | `None` |
| `device` | `Option`\<`Device`\> | `None` |
| `externalId?` | `string` | `undefined` |
| `internalId?` | `string` | `undefined` |
| `extraData?` | `any` | `undefined` |

#### Returns

`Text`

## parent

### parent()

#### Call Signature

> **parent**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:197](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L197)

##### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Private Remarks

The type assertions to `Node` in here are technically incorrect.
BaseNode could be extended to another class which is then not added to the
Node union, in which case the assertions would be wrong. This scenario is
however quite unlikely given that BaseNode is not exported out of this
package. So it is only a matter of us not doing so, which sound OK enough.
It is not possible at this level to do any sort of runtime type checking
without creating circular dependencies, and the parent method here has
to extends the one in `alfa-tree/Node`.

##### Inherited from

`Slotable.parent`

#### Call Signature

> **parent**(`options?`): `Option`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/node.ts:323](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L323)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

##### Returns

`Option`\<[`Node`](Node-1.md)\>

##### Inherited from

`Slotable.parent`

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

`Slotable.path`

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

`Slotable.preceding`

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

`Slotable.previous`

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

`Slotable.root`

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

`Slotable.serializationId`

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

`Slotable.siblings`

## slotableName

### slotableName()

> **slotableName**(): `string`

Defined in: [alfa-dom/src/node/slotable/text.ts:74](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L74)

[https://dom.spec.whatwg.org/#slotable-name](https://dom.spec.whatwg.org/#slotable-name)

#### Returns

`string`

#### Overrides

`Slotable.slotableName`

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

`Slotable.tabOrder`

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

`Slotable.textContent`

## toEARL

### toEARL()

> **toEARL**(): `EARL`

Defined in: [alfa-dom/src/node/node.ts:291](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L291)

#### Returns

`EARL`

#### Inherited from

`Slotable.toEARL`

## toJSON

### toJSON()

#### Call Signature

> **toJSON**(`options`): [`MinimalJSON`](Text/MinimalJSON.md)

Defined in: [alfa-dom/src/node/slotable/text.ts:104](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L104)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `SerializationOptions` & `object` |

##### Returns

[`MinimalJSON`](Text/MinimalJSON.md)

##### Overrides

`Slotable.toJSON`

#### Call Signature

> **toJSON**(`options?`): [`JSON`](Text/JSON.md)

Defined in: [alfa-dom/src/node/slotable/text.ts:111](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L111)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `SerializationOptions` |

##### Returns

[`JSON`](Text/JSON.md)

##### Overrides

`Slotable.toJSON`

## toSARIF

### toSARIF()

> **toSARIF**(): `Location`

Defined in: [alfa-dom/src/node/node.ts:306](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L306)

#### Returns

`Location`

#### Inherited from

`Slotable.toSARIF`

## toString

### toString()

> **toString**(): `string`

Defined in: [alfa-dom/src/node/slotable/text.ts:138](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/text.ts#L138)

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

`Slotable.type`
