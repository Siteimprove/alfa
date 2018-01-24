# @alfa/util

## Index

### Classes

* [Bound](classes/bound.md)

### Type aliases

* [Fn](#fn)
* [Options](#options)

### Functions

* [memoize](#memoize)

---

# Type aliases

<a id="fn"></a>

### Fn

**Τ Fn**: _`function`_

_Defined in [function/memoize.ts:3](https://github.com/Siteimprove/alfa/blob/master/packages/util/src/function/memoize.ts#L3)_

#### Type declaration

►(...args: _`any`[]_): `any`

**Parameters:**

| Param | Type    | Description |
| ----- | ------- | ----------- |
| args  | `any`[] | -           |

**Returns:** `any`

---

<a id="options"></a>

### Options

**Τ Options**: _`object`_

_Defined in [function/memoize.ts:5](https://github.com/Siteimprove/alfa/blob/master/packages/util/src/function/memoize.ts#L5)_

#### Type declaration

---

# Functions

<a id="memoize"></a>

### memoize

► **memoize**T(fn: _`T`_, options?: _[Options](#options)_): `T`

_Defined in [function/memoize.ts:9](https://github.com/Siteimprove/alfa/blob/master/packages/util/src/function/memoize.ts#L9)_

**Type parameters:**

#### T : [Fn](#fn)

**Parameters:**

| Param   | Type                | Default value | Description |
| ------- | ------------------- | ------------- | ----------- |
| fn      | `T`                 | -             | -           |
| options | [Options](#options) | {}            | -           |

**Returns:** `T`

---
