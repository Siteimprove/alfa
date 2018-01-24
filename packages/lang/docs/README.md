# @alfa/lang

## Index

### Interfaces

* [Location](interfaces/location.md)
* [Production](interfaces/production.md)
* [Token](interfaces/token.md)

### Type aliases

* [Alphabet](#alphabet)
* [Grammar](#grammar)
* [Pattern](#pattern)
* [WithLocation](#withlocation)

### Functions

* [hasLocation](#haslocation)
* [isAlpha](#isalpha)
* [isAlphanumeric](#isalphanumeric)
* [isAscii](#isascii)
* [isBetween](#isbetween)
* [isHex](#ishex)
* [isNewline](#isnewline)
* [isNonAscii](#isnonascii)
* [isNumeric](#isnumeric)
* [isWhitespace](#iswhitespace)
* [lex](#lex)
* [parse](#parse)

---

# Type aliases

<a id="alphabet"></a>

### Alphabet

**Τ Alphabet**: _`Array`.<[Pattern](#pattern)`T`>_

_Defined in [lexer.ts:183](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L183)_

---

<a id="grammar"></a>

### Grammar

**Τ Grammar**: _`Array`.<[Production](interfaces/production.md)`T`, `T`, `R`, `R`⎮`Array`.<[Production](interfaces/production.md)`T`, `T`, `R`, `R`>>_

_Defined in [parser.ts:92](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L92)_

---

<a id="pattern"></a>

### Pattern

**Τ Pattern**: _`function`_

_Defined in [lexer.ts:181](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L181)_

#### Type declaration

►(stream: _`Stream`_): `T`⎮`void`

**Parameters:**

| Param  | Type     | Description |
| ------ | -------- | ----------- |
| stream | `Stream` | -           |

**Returns:** `T`⎮`void`

---

<a id="withlocation"></a>

### WithLocation

**Τ WithLocation**: _`T`[Location](interfaces/location.md)_

_Defined in [lexer.ts:14](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L14)_

---

# Functions

<a id="haslocation"></a>

### hasLocation

► **hasLocation**T(token: _`T`_): `boolean`

_Defined in [lexer.ts:16](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L16)_

**Type parameters:**

#### T : [Token](interfaces/token.md)

**Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| token | `T`  | -           |

**Returns:** `boolean`

---

<a id="isalpha"></a>

### isAlpha

► **isAlpha**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:235](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L235)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isalphanumeric"></a>

### isAlphanumeric

► **isAlphanumeric**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:243](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L243)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isascii"></a>

### isAscii

► **isAscii**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:253](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L253)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isbetween"></a>

### isBetween

► **isBetween**(char: _`string`⎮`null`_, lower: _`string`_, upper: _`string`_): `boolean`

_Defined in [lexer.ts:219](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L219)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |
| lower | `string`        | -           |
| upper | `string`        | -           |

**Returns:** `boolean`

---

<a id="ishex"></a>

### isHex

► **isHex**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:247](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L247)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isnewline"></a>

### isNewline

► **isNewline**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:231](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L231)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isnonascii"></a>

### isNonAscii

► **isNonAscii**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:257](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L257)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isnumeric"></a>

### isNumeric

► **isNumeric**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:239](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L239)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="iswhitespace"></a>

### isWhitespace

► **isWhitespace**(char: _`string`⎮`null`_): `boolean`

_Defined in [lexer.ts:227](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L227)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| char  | `string`⎮`null` | -           |

**Returns:** `boolean`

---

<a id="lex"></a>

### lex

► **lex**T(input: _`string`_, alphabet: _[Alphabet](#alphabet)`T`_): `Array`.<[WithLocation](#withlocation)`T`>

_Defined in [lexer.ts:185](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/lexer.ts#L185)_

**Type parameters:**

#### T : [Token](interfaces/token.md)

**Parameters:**

| Param    | Type                     | Description |
| -------- | ------------------------ | ----------- |
| input    | `string`                 | -           |
| alphabet | [Alphabet](#alphabet)`T` | -           |

**Returns:** `Array`.<[WithLocation](#withlocation)`T`>

---

<a id="parse"></a>

### parse

► **parse**T,R(input: _`Array`.<`T`>_, grammar: _[Grammar](#grammar)`T`, `R`_): `R`⎮`null`

_Defined in [parser.ts:96](https://github.com/Siteimprove/alfa/blob/7447116/packages/lang/src/parser.ts#L96)_

**Type parameters:**

#### T : [Token](interfaces/token.md)

#### R

**Parameters:**

| Param   | Type                        | Description |
| ------- | --------------------------- | ----------- |
| input   | `Array`.<`T`>               | -           |
| grammar | [Grammar](#grammar)`T`, `R` | -           |

**Returns:** `R`⎮`null`

---
