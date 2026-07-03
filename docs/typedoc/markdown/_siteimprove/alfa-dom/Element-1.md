[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-dom](../alfa-dom.md) / Element

# Class: Element\<N\>

Defined in: [alfa-dom/src/node/slotable/element.ts:35](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L35)

## Extends

- `Slotable`\<`"element"`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

## Constructors

### Constructor

> `protected` **new Element**\<`N`\>(`namespace`, `prefix`, `name`, `attributes`, `children`, `style`, `box`, `device`, `externalId?`, `internalId?`, `extraData?`): `Element`\<`N`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:75](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L75)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `namespace` | `Option`\<[`Namespace`](Namespace-1.md)\> |
| `prefix` | `Option`\<`string`\> |
| `name` | `N` |
| `attributes` | [`Attribute`](Attribute-1.md)\<`string`\>[] |
| `children` | [`Node`](Node-1.md)[] |
| `style` | `Option`\<[`Block`](Block-1.md)\> |
| `box` | `Option`\<`Rectangle`\> |
| `device` | `Option`\<`Device`\> |
| `externalId?` | `string` |
| `internalId?` | `string` |
| `extraData?` | `any` |

#### Returns

`Element`\<`N`\>

#### Overrides

`Slotable<"element">.constructor`

## [iterator]

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:176

#### Returns

`Iterator`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

#### Inherited from

`Slotable.[iterator]`

## _attachContent

### \_attachContent()

> **\_attachContent**(`document`): `boolean`

Defined in: [alfa-dom/src/node/slotable/element.ts:475](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L475)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `document` | [`Document`](Document-1.md) |

#### Returns

`boolean`

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

## _attachShadow

### \_attachShadow()

> **\_attachShadow**(`shadow`): `boolean`

Defined in: [alfa-dom/src/node/slotable/element.ts:462](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L462)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `shadow` | [`Shadow`](Shadow-1.md) |

#### Returns

`boolean`

## _children

### \_children

> `protected` `readonly` **\_children**: `Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>[]

Defined in: alfa-tree/dist/tree.d.ts:27

#### Inherited from

`Slotable._children`

## _displaySize

### \_displaySize

> `protected` **\_displaySize**: `number` \| `undefined`

Defined in: [alfa-dom/src/node/slotable/element.ts:310](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L310)

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

## _inputType

### \_inputType

> `protected` **\_inputType**: `InputType` \| `undefined`

Defined in: [alfa-dom/src/node/slotable/element.ts:309](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L309)

## _internalPath

### \_internalPath()

> `protected` **\_internalPath**(`options?`): `string`

Defined in: [alfa-dom/src/node/slotable/element.ts:345](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L345)

**`Internal`**

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> |

#### Returns

`string`

#### Overrides

`Slotable._internalPath`

## _optionsList

### \_optionsList

> `protected` **\_optionsList**: `Sequence`\<`Element`\<`"option"`\>\> \| `undefined`

Defined in: [alfa-dom/src/node/slotable/element.ts:311](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L311)

## _parent

### \_parent

> `protected` **\_parent**: `Option`\<`Node`\<`"DOM traversal"`, `1` \| `2` \| `4`, `string`\>\>

Defined in: alfa-tree/dist/tree.d.ts:28

#### Inherited from

`Slotable._parent`

## _type

### \_type

> `protected` `readonly` **\_type**: `"element"`

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

## assignedNodes

### assignedNodes()

> **assignedNodes**(`this`): `Iterable`\<[`Slotable`](Slotable-1.md)\>

Defined in: [alfa-dom/src/node/slotable/slot.ts:19](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/slot.ts#L19)

Get the slotables assigned to this slot.

[https://html.spec.whatwg.org/#dom-slot-assignednodes](https://html.spec.whatwg.org/#dom-slot-assignednodes)
[https://dom.spec.whatwg.org/#find-slotables](https://dom.spec.whatwg.org/#find-slotables)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Slot` |

#### Returns

`Iterable`\<[`Slotable`](Slotable-1.md)\>

## assignedSlot

### assignedSlot()

> **assignedSlot**(): `Option`\<`Slot`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:321](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L321)

[https://dom.spec.whatwg.org/#dom-slotable-assignedslot](https://dom.spec.whatwg.org/#dom-slotable-assignedslot)

#### Returns

`Option`\<`Slot`\>

#### Overrides

`Slotable.assignedSlot`

## attribute

### attribute()

#### Call Signature

> **attribute**\<`A`\>(`name`): `Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

Defined in: [alfa-dom/src/node/slotable/element.ts:205](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L205)

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `A` *extends* `string` | `string` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `A` |

##### Returns

`Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

#### Call Signature

> **attribute**\<`A`\>(`predicate`): `Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

Defined in: [alfa-dom/src/node/slotable/element.ts:207](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L207)

##### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `A` *extends* `string` | `string` |

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Attribute`](Attribute-1.md)\<`A`\>\> |

##### Returns

`Option`\<[`Attribute`](Attribute-1.md)\<`A`\>\>

## attributes

### attributes

#### Get Signature

> **get** **attributes**(): `Sequence`\<[`Attribute`](Attribute-1.md)\<`string`\>\>

Defined in: [alfa-dom/src/node/slotable/element.ts:134](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L134)

##### Returns

`Sequence`\<[`Attribute`](Attribute-1.md)\<`string`\>\>

## children

### children()

> **children**(`options?`): `Sequence`\<[`Node`](Node-1.md)\>

Defined in: [alfa-dom/src/node/slotable/element.ts:168](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L168)

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

#### Returns

`Sequence`\<[`Node`](Node-1.md)\>

#### Overrides

`Slotable.children`

## classes

### classes

#### Get Signature

> **get** **classes**(): `Sequence`\<`string`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:160](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L160)

[https://dom.spec.whatwg.org/#concept-class](https://dom.spec.whatwg.org/#concept-class)

##### Returns

`Sequence`\<`string`\>

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

## content

### content

#### Get Signature

> **get** **content**(): `Option`\<[`Document`](Document-1.md)\>

Defined in: [alfa-dom/src/node/slotable/element.ts:146](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L146)

##### Returns

`Option`\<[`Document`](Document-1.md)\>

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

## displaySize

### displaySize()

> **displaySize**(`this`): `number`

Defined in: [alfa-dom/src/node/element/augment.ts:36](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts#L36)

[https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-size](https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-size)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Element`\<`"select"`\> |

#### Returns

`number`

#### Remarks

The size IDL attribute should have a value of 0, not 1 or 4, when the
size content attribute is undefined. This is for historical reasons. In
our case, this is not affecting the results, and it is easier to treat it
as the actual displayed size.
[https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-size](https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-size)

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

> **equals**(`value`): `value is Element<N>`

Defined in: [alfa-dom/src/node/node.ts:266](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L266)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `unknown` |

##### Returns

`value is Element<N>`

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

Defined in: [alfa-dom/src/node/slotable/element.ts:164](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L164)

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

## id

### id

#### Get Signature

> **get** **id**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:153](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L153)

[https://dom.spec.whatwg.org/#concept-id](https://dom.spec.whatwg.org/#concept-id)

##### Returns

`Option`\<`string`\>

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

## inputType

### inputType()

> **inputType**(`this`): `InputType`

Defined in: [alfa-dom/src/node/element/augment.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts#L24)

[https://html.spec.whatwg.org/#attr-input-type](https://html.spec.whatwg.org/#attr-input-type)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Element`\<`"input"`\> |

#### Returns

`InputType`

## internalId

### internalId

#### Get Signature

> **get** **internalId**(): `string`

Defined in: alfa-tree/dist/tree.d.ts:49

##### Returns

`string`

#### Inherited from

`Slotable.internalId`

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

## isInert

### isInert()

> **isInert**(): `boolean`

Defined in: [alfa-dom/src/node/slotable/element.ts:278](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L278)

Computes inertness of an element based on the `inert` attribute.

[https://html.spec.whatwg.org/#the-inert-attribute](https://html.spec.whatwg.org/#the-inert-attribute)

#### Returns

`boolean`

#### Private Remarks

According to [https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global\_attributes/inert](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert)
only open dialogs can escape inertness (except when they have the `inert` attribute).

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

## isSummaryForItsParentDetails

### isSummaryForItsParentDetails()

> **isSummaryForItsParentDetails**(`this`): `boolean`

Defined in: [alfa-dom/src/node/element/augment.ts:46](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts#L46)

[https://html.spec.whatwg.org/multipage/#summary-for-its-parent-details](https://html.spec.whatwg.org/multipage/#summary-for-its-parent-details)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Element`\<`"summary"`\> |

#### Returns

`boolean`

## isVoid

### isVoid()

> **isVoid**(): `boolean`

Defined in: [alfa-dom/src/node/slotable/element.ts:224](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L224)

[https://html.spec.whatwg.org/#void-elements](https://html.spec.whatwg.org/#void-elements)

#### Returns

`boolean`

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

## name

### name

#### Get Signature

> **get** **name**(): `N`

Defined in: [alfa-dom/src/node/slotable/element.ts:123](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L123)

##### Returns

`N`

## namespace

### namespace

#### Get Signature

> **get** **namespace**(): `Option`\<[`Namespace`](Namespace-1.md)\>

Defined in: [alfa-dom/src/node/slotable/element.ts:115](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L115)

##### Returns

`Option`\<[`Namespace`](Namespace-1.md)\>

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

> `static` **of**\<`N`\>(`namespace`, `prefix`, `name`, `attributes?`, `children?`, `style?`, `box?`, `device?`, `externalId?`, `internalId?`, `extraData?`): `Element`\<`N`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:36](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L36)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `namespace` | `Option`\<[`Namespace`](Namespace-1.md)\> | `undefined` |
| `prefix` | `Option`\<`string`\> | `undefined` |
| `name` | `N` | `undefined` |
| `attributes` | `Iterable`\<[`Attribute`](Attribute-1.md)\<`string`\>\> | `[]` |
| `children` | `Iterable`\<[`Node`](Node-1.md)\> | `[]` |
| `style` | `Option`\<[`Block`](Block-1.md)\> | `None` |
| `box` | `Option`\<`Rectangle`\> | `None` |
| `device` | `Option`\<`Device`\> | `None` |
| `externalId?` | `string` | `undefined` |
| `internalId?` | `string` | `undefined` |
| `extraData?` | `any` | `undefined` |

#### Returns

`Element`\<`N`\>

## optionsList

### optionsList()

> **optionsList**(`this`): `Sequence`\<`Element`\<`"option"`\>\>

Defined in: [alfa-dom/src/node/element/augment.ts:41](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/element/augment.ts#L41)

[https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-option-list](https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-option-list)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Element`\<`"select"`\> |

#### Returns

`Sequence`\<`Element`\<`"option"`\>\>

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

## prefix

### prefix

#### Get Signature

> **get** **prefix**(): `Option`\<`string`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:119](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L119)

##### Returns

`Option`\<`string`\>

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

## qualifiedName

### qualifiedName

#### Get Signature

> **get** **qualifiedName**(): `string`

Defined in: [alfa-dom/src/node/slotable/element.ts:127](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L127)

##### Returns

`string`

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

## shadow

### shadow

#### Get Signature

> **get** **shadow**(): `Option`\<[`Shadow`](Shadow-1.md)\>

Defined in: [alfa-dom/src/node/slotable/element.ts:142](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L142)

##### Returns

`Option`\<[`Shadow`](Shadow-1.md)\>

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

## slotName

### slotName()

> **slotName**(`this`): `string`

Defined in: [alfa-dom/src/node/slotable/slot.ts:24](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/slot.ts#L24)

[https://dom.spec.whatwg.org/#slot-name](https://dom.spec.whatwg.org/#slot-name)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | `Slot` |

#### Returns

`string`

## slotableName

### slotableName()

> **slotableName**(): `string`

Defined in: [alfa-dom/src/node/slotable/element.ts:336](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L336)

[https://dom.spec.whatwg.org/#slotable-name](https://dom.spec.whatwg.org/#slotable-name)

#### Returns

`string`

#### Overrides

`Slotable.slotableName`

## style

### style

#### Get Signature

> **get** **style**(): `Option`\<[`Block`](Block-1.md)\>

Defined in: [alfa-dom/src/node/slotable/element.ts:138](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L138)

##### Returns

`Option`\<[`Block`](Block-1.md)\>

## tabIndex

### tabIndex()

> **tabIndex**(): `Option`\<`number`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:252](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L252)

[https://html.spec.whatwg.org/#dom-tabindex](https://html.spec.whatwg.org/#dom-tabindex)

#### Returns

`Option`\<`number`\>

## tabOrder

### tabOrder()

> **tabOrder**(`this`): `Sequence`\<`Element`\<`string`\>\>

Defined in: [alfa-dom/src/node/node.ts:59](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/node.ts#L59)

Construct a sequence of descendants of this node sorted by tab index. Only
nodes with a non-negative tab index are included in the sequence.

[https://html.spec.whatwg.org/multipage/#tabindex-value](https://html.spec.whatwg.org/multipage/#tabindex-value)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `this` | [`Node`](Node-1.md) |

#### Returns

`Sequence`\<`Element`\<`string`\>\>

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

> **toJSON**(`options`): [`MinimalJSON`](Element/MinimalJSON.md)

Defined in: [alfa-dom/src/node/slotable/element.ts:363](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L363)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `SerializationOptions` & `object` |

##### Returns

[`MinimalJSON`](Element/MinimalJSON.md)

##### Overrides

`Slotable.toJSON`

#### Call Signature

> **toJSON**(`options`): [`JSON`](Element/JSON.md)\<`string`\> & `object`

Defined in: [alfa-dom/src/node/slotable/element.ts:371](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L371)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | `SerializationOptions` & `object` |

##### Returns

##### Overrides

`Slotable.toJSON`

#### Call Signature

> **toJSON**(`options?`): [`JSON`](Element/JSON.md)\<`N`\>

Defined in: [alfa-dom/src/node/slotable/element.ts:377](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L377)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `SerializationOptions` |

##### Returns

[`JSON`](Element/JSON.md)\<`N`\>

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

Defined in: [alfa-dom/src/node/slotable/element.ts:428](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts#L428)

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
