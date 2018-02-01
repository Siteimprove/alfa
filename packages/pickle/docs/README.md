# @alfa/pickle

## Index

### Type aliases

* [VirtualizeOptions](#virtualizeoptions)
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

<a id="virtualizeoptions"></a>

### VirtualizeOptions

**Τ VirtualizeOptions**: _`Readonly`.<`object`>_

_Defined in [virtualize.ts:16](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L16)_

---

<a id="withreference"></a>

### WithReference

**Τ WithReference**: _` T``object `_

_Defined in [virtualize.ts:8](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L8)_

---

# Functions

<a id="dereference"></a>

### dereference

► **dereference**(node: _`Node`_): `Node`

_Defined in [virtualize.ts:212](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L212)_

**Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| node  | `Node` | -           |

**Returns:** `Node`

---

<a id="hasreference"></a>

### hasReference

► **hasReference**T(node: _`T`_): `boolean`

_Defined in [virtualize.ts:10](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L10)_

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

_Defined in [virtualize.ts:224](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L224)_

**Parameters:**

| Param | Type                                  | Description |
| ----- | ------------------------------------- | ----------- |
| root  | [WithReference](#withreference)`Node` | -           |

**Returns:** `Map`.<`Element`>,.<`Layout`>

---

<a id="parentize"></a>

### parentize

► **parentize**(node: _`Node`_): `Node`

_Defined in [virtualize.ts:202](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L202)_

**Parameters:**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| node  | `Node` | -           |

**Returns:** `Node`

---

<a id="style"></a>

### style

► **style**(root: _[WithReference](#withreference)`Node`_): `Map`.<`Element`>,.<`object`>

_Defined in [virtualize.ts:267](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L267)_

**Parameters:**

| Param | Type                                  | Description |
| ----- | ------------------------------------- | ----------- |
| root  | [WithReference](#withreference)`Node` | -           |

**Returns:** `Map`.<`Element`>,.<`object`>

---

<a id="virtualize"></a>

### virtualize

► **virtualize**(node: _`Node`_, options: _[VirtualizeOptions](#virtualizeoptions)`object`_): [WithReference](#withreference)`Node`

► **virtualize**(node: _`Node`_, options?: _[VirtualizeOptions](#virtualizeoptions)_): `Node`

_Defined in [virtualize.ts:71](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L71)_

**Parameters:**

| Param   | Type                                            | Description |
| ------- | ----------------------------------------------- | ----------- |
| node    | `Node`                                          | -           |
| options | [VirtualizeOptions](#virtualizeoptions)`object` | -           |

**Returns:** [WithReference](#withreference)`Node`

_Defined in [virtualize.ts:76](https://github.com/Siteimprove/alfa/blob/master/packages/pickle/src/virtualize.ts#L76)_

**Parameters:**

| Param   | Type                                    | Description |
| ------- | --------------------------------------- | ----------- |
| node    | `Node`                                  | -           |
| options | [VirtualizeOptions](#virtualizeoptions) | -           |

**Returns:** `Node`

---
