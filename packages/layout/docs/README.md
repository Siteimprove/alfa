# @alfa/layout

## Index

### Classes

* [LayoutIndex](classes/layoutindex.md)

### Interfaces

* [Layout](interfaces/layout.md)

### Type aliases

* [LayoutNode](#layoutnode)

### Functions

* [area](#area)
* [contains](#contains)
* [height](#height)
* [intersects](#intersects)
* [margin](#margin)
* [union](#union)
* [width](#width)

---

# Type aliases

<a id="layoutnode"></a>

### LayoutNode

**Τ LayoutNode**: _[Layout](interfaces/layout.md)`object`_

_Defined in [layout.ts:61](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L61)_

---

# Functions

<a id="area"></a>

### area

► **area**(layout: _[Layout](interfaces/layout.md)_): `number`

_Defined in [layout.ts:16](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L16)_

**Parameters:**

| Param  | Type                           | Description |
| ------ | ------------------------------ | ----------- |
| layout | [Layout](interfaces/layout.md) | -           |

**Returns:** `number`

---

<a id="contains"></a>

### contains

► **contains**(a: _[Layout](interfaces/layout.md)_, b: _[Layout](interfaces/layout.md)_): `boolean`

_Defined in [layout.ts:33](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L33)_

**Parameters:**

| Param | Type                           | Description |
| ----- | ------------------------------ | ----------- |
| a     | [Layout](interfaces/layout.md) | -           |
| b     | [Layout](interfaces/layout.md) | -           |

**Returns:** `boolean`

---

<a id="height"></a>

### height

► **height**(layout: _[Layout](interfaces/layout.md)_): `number`

_Defined in [layout.ts:12](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L12)_

**Parameters:**

| Param  | Type                           | Description |
| ------ | ------------------------------ | ----------- |
| layout | [Layout](interfaces/layout.md) | -           |

**Returns:** `number`

---

<a id="intersects"></a>

### intersects

► **intersects**(a: _[Layout](interfaces/layout.md)_, b: _[Layout](interfaces/layout.md)_): `boolean`

_Defined in [layout.ts:24](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L24)_

**Parameters:**

| Param | Type                           | Description |
| ----- | ------------------------------ | ----------- |
| a     | [Layout](interfaces/layout.md) | -           |
| b     | [Layout](interfaces/layout.md) | -           |

**Returns:** `boolean`

---

<a id="margin"></a>

### margin

► **margin**(layout: _[Layout](interfaces/layout.md)_): `number`

_Defined in [layout.ts:20](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L20)_

**Parameters:**

| Param  | Type                           | Description |
| ------ | ------------------------------ | ----------- |
| layout | [Layout](interfaces/layout.md) | -           |

**Returns:** `number`

---

<a id="union"></a>

### union

► **union**(...layouts: _[Layout](interfaces/layout.md)[]_): [Layout](interfaces/layout.md)

_Defined in [layout.ts:42](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L42)_

**Parameters:**

| Param   | Type                             | Description |
| ------- | -------------------------------- | ----------- |
| layouts | [Layout](interfaces/layout.md)[] | -           |

**Returns:** [Layout](interfaces/layout.md)

---

<a id="width"></a>

### width

► **width**(layout: _[Layout](interfaces/layout.md)_): `number`

_Defined in [layout.ts:8](https://github.com/Siteimprove/alfa/blob/7447116/packages/layout/src/layout.ts#L8)_

**Parameters:**

| Param  | Type                           | Description |
| ------ | ------------------------------ | ----------- |
| layout | [Layout](interfaces/layout.md) | -           |

**Returns:** `number`

---
