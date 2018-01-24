# @alfa/pickle

## Index

### Interfaces

* [VirtualizeOptions](interfaces/virtualizeoptions.md)

### Type aliases

* [WithReference](#withreference)

### Functions

* [dereference](#dereference)
* [hasReference](#hasreference)
* [layout](#layout)
* [parentize](#parentize)
* [style](#style)
* [virtualize](#virtualize)

---

# Type aliases

<a id="withreference"></a>

### WithReference

**Τ WithReference**: _` T``object `_

_Defined in [virtualize.ts:8](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L8)_

---

# Functions

<a id="dereference"></a>

### dereference

► **dereference**(node: _`Node`_): `Node`

_Defined in [virtualize.ts:171](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L171)_

**Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| node  | `Node` | -           |

**Returns:** `Node`

---

<a id="hasreference"></a>

### hasReference

► **hasReference**T(node: _`T`_): `boolean`

_Defined in [virtualize.ts:10](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L10)_

**Type parameters:**

#### T : `Node`

**Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| node  | `T`  | -           |

**Returns:** `boolean`

---

<a id="layout"></a>

### layout

► **layout**(root: _[WithReference](#withreference)`Node`_): `Map`.<`Element`>,.<`Layout`>

_Defined in [virtualize.ts:183](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L183)_

**Parameters:**

| Param | Type                                  | Description |
| ----- | ------------------------------------- | ----------- |
| root  | [WithReference](#withreference)`Node` | -           |

**Returns:** `Map`.<`Element`>,.<`Layout`>

---

<a id="parentize"></a>

### parentize

► **parentize**(node: _`Node`_): `Node`

_Defined in [virtualize.ts:161](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L161)_

**Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| node  | `Node` | -           |

**Returns:** `Node`

---

<a id="style"></a>

### style

► **style**(root: _[WithReference](#withreference)`Node`_): `Map`.<`Element`>,.<`object`>

_Defined in [virtualize.ts:206](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L206)_

**Parameters:**

| Param | Type                                  | Description |
| ----- | ------------------------------------- | ----------- |
| root  | [WithReference](#withreference)`Node` | -           |

**Returns:** `Map`.<`Element`>,.<`object`>

---

<a id="virtualize"></a>

### virtualize

► **virtualize**(node: _`Node`_, options?: _[VirtualizeOptions](interfaces/virtualizeoptions.md)_): [WithReference](#withreference)`Node`

_Defined in [virtualize.ts:73](https://github.com/Siteimprove/alfa/blob/7447116/packages/pickle/src/virtualize.ts#L73)_

**Parameters:**

| Param   | Type                                                 | Default value | Description |
| ------- | ---------------------------------------------------- | ------------- | ----------- |
| node    | `Node`                                               | -             | -           |
| options | [VirtualizeOptions](interfaces/virtualizeoptions.md) | {}            | -           |

**Returns:** [WithReference](#withreference)`Node`

---
