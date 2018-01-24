# @alfa/dom

## Index

### Classes

* [Collector](classes/collector.md)

### Interfaces

* [ChildNode](interfaces/childnode.md)
* [Comment](interfaces/comment.md)
* [Document](interfaces/document.md)
* [DocumentFragment](interfaces/documentfragment.md)
* [DocumentType](interfaces/documenttype.md)
* [Element](interfaces/element.md)
* [Node](interfaces/node.md)
* [ParentNode](interfaces/parentnode.md)
* [Text](interfaces/text.md)

### Type aliases

* [Attribute](#attribute)
* [WithDigest](#withdigest)

### Functions

* [attribute](#attribute)
* [classlist](#classlist)
* [closest](#closest)
* [collect](#collect)
* [compare](#compare)
* [digest](#digest)
* [find](#find)
* [findAll](#findall)
* [hasDigest](#hasdigest)
* [isChild](#ischild)
* [isComment](#iscomment)
* [isDocument](#isdocument)
* [isDocumentType](#isdocumenttype)
* [isElement](#iselement)
* [isParent](#isparent)
* [isText](#istext)
* [matches](#matches)
* [render](#render)
* [traverse](#traverse)

---

# Type aliases

<a id="attribute"></a>

### Attribute

**Τ Attribute**: _`string`⎮`number`⎮`boolean`_

_Defined in [types.ts:1](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/types.ts#L1)_

---

<a id="withdigest"></a>

### WithDigest

**Τ WithDigest**: _` T``object `_

_Defined in [digest.ts:14](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/digest.ts#L14)_

---

# Functions

<a id="attribute"></a>

### attribute

► **attribute**K(element: _[Element](interfaces/element.md)_, name: _`K`_, options?: _`Options`_): `{ readonly [name: string]: string | number | boolean | undefined; readonly id?: string | undefine...`

_Defined in [element/attribute.ts:5](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/element/attribute.ts#L5)_

**Type parameters:**

#### K : `string`

**Parameters:**

| Param   | Type                             | Default value   | Description |
| ------- | -------------------------------- | --------------- | ----------- |
| element | [Element](interfaces/element.md) | -               | -           |
| name    | `K`                              | -               | -           |
| options | `Options`                        | { trim: false } | -           |

**Returns:** `{ readonly [name: string]: string | number | boolean | undefined; readonly id?: string | undefine...`

---

<a id="classlist"></a>

### classlist

► **classlist**(element: _[Element](interfaces/element.md)_): `Set`.<`string`>

_Defined in [element/classlist.ts:6](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/element/classlist.ts#L6)_

**Parameters:**

| Param   | Type                             | Description |
| ------- | -------------------------------- | ----------- |
| element | [Element](interfaces/element.md) | -           |

**Returns:** `Set`.<`string`>

---

<a id="closest"></a>

### closest

► **closest**T(context: _[Node](interfaces/node.md)_, predicate: _`Predicate`.<[Node](interfaces/node.md)>,.<`T`>_): `T`⎮`null`

_Defined in [collect.ts:75](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L75)_

**Type parameters:**

#### T : [Node](interfaces/node.md)

**Parameters:**

| Param     | Type                                            | Description |
| --------- | ----------------------------------------------- | ----------- |
| context   | [Node](interfaces/node.md)                      | -           |
| predicate | `Predicate`.<[Node](interfaces/node.md)>,.<`T`> | -           |

**Returns:** `T`⎮`null`

---

<a id="collect"></a>

### collect

► **collect**(context: _[Node](interfaces/node.md)_): [Collector](classes/collector.md)[Node](interfaces/node.md)

_Defined in [collect.ts:71](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/collect.ts#L71)_

**Parameters:**

| Param   | Type                       | Description |
| ------- | -------------------------- | ----------- |
| context | [Node](interfaces/node.md) | -           |

**Returns:** [Collector](classes/collector.md)[Node](interfaces/node.md)

---

<a id="compare"></a>

### compare

► **compare**(a: _[Node](interfaces/node.md)_, b: _[Node](interfaces/node.md)_): `number`

_Defined in [compare.ts:34](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/compare.ts#L34)_

**Parameters:**

| Param | Type                       | Description |
| ----- | -------------------------- | ----------- |
| a     | [Node](interfaces/node.md) | -           |
| b     | [Node](interfaces/node.md) | -           |

**Returns:** `number`

---

<a id="digest"></a>

### digest

► **digest**T(node: _`T`_): [WithDigest](#withdigest)`T`⎮[Node](interfaces/node.md)

_Defined in [digest.ts:23](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/digest.ts#L23)_

_**see**_: [https://www.ietf.org/rfc/rfc2803.txt](https://www.ietf.org/rfc/rfc2803.txt)

**Type parameters:**

#### T : [Node](interfaces/node.md)

**Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| node  | `T`  | -           |

**Returns:** [WithDigest](#withdigest)`T`⎮[Node](interfaces/node.md)

---

<a id="find"></a>

### find

► **find**(context: _[ParentNode](interfaces/parentnode.md)_, selector: _`string`_): [Element](interfaces/element.md)⎮`null`

_Defined in [element/find.ts:6](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/element/find.ts#L6)_

**Parameters:**

| Param    | Type                                   | Description |
| -------- | -------------------------------------- | ----------- |
| context  | [ParentNode](interfaces/parentnode.md) | -           |
| selector | `string`                               | -           |

**Returns:** [Element](interfaces/element.md)⎮`null`

---

<a id="findall"></a>

### findAll

► **findAll**(context: _[ParentNode](interfaces/parentnode.md)_, selector: _`string`_): `Iterable`.<[Element](interfaces/element.md)>

_Defined in [element/find.ts:13](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/element/find.ts#L13)_

**Parameters:**

| Param    | Type                                   | Description |
| -------- | -------------------------------------- | ----------- |
| context  | [ParentNode](interfaces/parentnode.md) | -           |
| selector | `string`                               | -           |

**Returns:** `Iterable`.<[Element](interfaces/element.md)>

---

<a id="hasdigest"></a>

### hasDigest

► **hasDigest**T(node: _`T`_): `boolean`

_Defined in [digest.ts:16](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/digest.ts#L16)_

**Type parameters:**

#### T : [Node](interfaces/node.md)

**Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| node  | `T`  | -           |

**Returns:** `boolean`

---

<a id="ischild"></a>

### isChild

► **isChild**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:36](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L36)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="iscomment"></a>

### isComment

► **isComment**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:28](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L28)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isdocument"></a>

### isDocument

► **isDocument**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:12](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L12)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isdocumenttype"></a>

### isDocumentType

► **isDocumentType**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:16](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L16)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="iselement"></a>

### isElement

► **isElement**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:20](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L20)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isparent"></a>

### isParent

► **isParent**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:32](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L32)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="istext"></a>

### isText

► **isText**(node: _[Node](interfaces/node.md)⎮`null`_): `boolean`

_Defined in [guards.ts:24](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/guards.ts#L24)_

**Parameters:**

| Param | Type                              | Description |
| ----- | --------------------------------- | ----------- |
| node  | [Node](interfaces/node.md)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="matches"></a>

### matches

► **matches**(element: _[Element](interfaces/element.md)_, selector: _`string`⎮`Selector`⎮`SelectorList`_): `boolean`

_Defined in [element/matches.ts:10](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/element/matches.ts#L10)_

**Parameters:**

| Param    | Type                               | Description |
| -------- | ---------------------------------- | ----------- |
| element  | [Element](interfaces/element.md)   | -           |
| selector | `string`⎮`Selector`⎮`SelectorList` | -           |

**Returns:** `boolean`

---

<a id="render"></a>

### render

► **render**(node: _[Node](interfaces/node.md)_): `string`

_Defined in [render.ts:30](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/render.ts#L30)_

**Parameters:**

| Param | Type                       | Description |
| ----- | -------------------------- | ----------- |
| node  | [Node](interfaces/node.md) | -           |

**Returns:** `string`

---

<a id="traverse"></a>

### traverse

► **traverse**(root: _[Node](interfaces/node.md)_, visitor: _`function`_): `void`

_Defined in [traverse.ts:4](https://github.com/Siteimprove/alfa/blob/master/packages/dom/src/traverse.ts#L4)_

**Parameters:**

| Param   | Type                       | Description |
| ------- | -------------------------- | ----------- |
| root    | [Node](interfaces/node.md) | -           |
| visitor | `function`                 | -           |

**Returns:** `void`

---
