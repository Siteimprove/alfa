[@alfa/lang](../README.md) > [Production](../interfaces/production.md)

# Interface: Production

## Type parameters

#### T : [Token](token.md)

#### U : `T`

#### R

#### P : `R`

## Properties

<a id="associate"></a>

### «Optional» associate

**● associate**: _"left"⎮"right"_

_Defined in [parser.ts:82](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L82)_

---

<a id="token"></a>

### token

**● token**: _`U[&quot;type&quot;]`_

_Defined in [parser.ts:81](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L81)_

---

## Methods

<a id="infix"></a>

### «Optional» infix

► **infix**(token: _`U`_, stream: _`Stream`.<`T`>_, expression: _`function`_, left: _`R`_): `P`⎮`null`

_Defined in [parser.ts:84](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L84)_

**Parameters:**

| Param      | Type           | Description |
| ---------- | -------------- | ----------- |
| token      | `U`            | -           |
| stream     | `Stream`.<`T`> | -           |
| expression | `function`     | -           |
| left       | `R`            | -           |

**Returns:** `P`⎮`null`

---

<a id="prefix"></a>

### «Optional» prefix

► **prefix**(token: _`U`_, stream: _`Stream`.<`T`>_, expression: _`function`_): `P`⎮`null`

_Defined in [parser.ts:83](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L83)_

**Parameters:**

| Param      | Type           | Description |
| ---------- | -------------- | ----------- |
| token      | `U`            | -           |
| stream     | `Stream`.<`T`> | -           |
| expression | `function`     | -           |

**Returns:** `P`⎮`null`

---
