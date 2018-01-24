# @alfa/css

## Index

### Enumerations

* [PropertyName](enums/propertyname.md)

### Type aliases

* [Brace](#brace)
* [Bracket](#bracket)
* [ClassSelector](#classselector)
* [Colon](#colon)
* [Comma](#comma)
* [Comment](#comment)
* [CompoundSelector](#compoundselector)
* [CssPattern](#csspattern)
* [CssToken](#csstoken)
* [CssTree](#csstree)
* [Delim](#delim)
* [IdSelector](#idselector)
* [Ident](#ident)
* [Number](#number)
* [Paren](#paren)
* [Property](#property)
* [RelativeSelector](#relativeselector)
* [Selector](#selector)
* [SelectorList](#selectorlist)
* [Semicolon](#semicolon)
* [SimpleSelector](#simpleselector)
* [State](#state)
* [String](#string)
* [Style](#style)
* [TypeSelector](#typeselector)
* [Whitespace](#whitespace)

### Variables

* [CssAlphabet](#cssalphabet)
* [CssGrammar](#cssgrammar)
* [properties](#properties)

### Functions

* [clean](#clean)
* [deduplicate](#deduplicate)
* [isDelim](#isdelim)
* [isIdent](#isident)
* [lex](#lex)
* [parse](#parse)

---

# Type aliases

<a id="brace"></a>

### Brace

**Τ Brace**: _`object`_

_Defined in [lexer.ts:22](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L22)_

#### Type declaration

---

<a id="bracket"></a>

### Bracket

**Τ Bracket**: _`object`_

_Defined in [lexer.ts:21](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L21)_

#### Type declaration

---

<a id="classselector"></a>

### ClassSelector

**Τ ClassSelector**: _`object`_

_Defined in [parser.ts:15](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L15)_

#### Type declaration

---

<a id="colon"></a>

### Colon

**Τ Colon**: _`object`_

_Defined in [lexer.ts:24](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L24)_

#### Type declaration

---

<a id="comma"></a>

### Comma

**Τ Comma**: _`object`_

_Defined in [lexer.ts:23](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L23)_

#### Type declaration

---

<a id="comment"></a>

### Comment

**Τ Comment**: _`object`_

_Defined in [lexer.ts:14](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L14)_

#### Type declaration

---

<a id="compoundselector"></a>

### CompoundSelector

**Τ CompoundSelector**: _`object`_

_Defined in [parser.ts:19](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L19)_

#### Type declaration

---

<a id="csspattern"></a>

### CssPattern

**Τ CssPattern**: _`Pattern`.<`T`>_

_Defined in [lexer.ts:56](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L56)_

---

<a id="csstoken"></a>

### CssToken

**Τ CssToken**: _[Whitespace](#whitespace)⎮[Comment](#comment)⎮[Ident](#ident)⎮[String](#string)⎮[Delim](#delim)⎮[Number](#number)⎮[Paren](#paren)⎮[Bracket](#bracket)⎮[Brace](#brace)⎮[Comma](#comma)⎮[Colon](#colon)⎮[Semicolon](#semicolon)_

_Defined in [lexer.ts:30](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L30)_

_**see**_: [https://www.w3.org/TR/css-syntax/#tokenization](https://www.w3.org/TR/css-syntax/#tokenization)

---

<a id="csstree"></a>

### CssTree

**Τ CssTree**: _[Selector](#selector)⎮[SelectorList](#selectorlist)_

_Defined in [parser.ts:37](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L37)_

---

<a id="delim"></a>

### Delim

**Τ Delim**: _`object`_

_Defined in [lexer.ts:17](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L17)_

#### Type declaration

---

<a id="idselector"></a>

### IdSelector

**Τ IdSelector**: _`object`_

_Defined in [parser.ts:16](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L16)_

#### Type declaration

---

<a id="ident"></a>

### Ident

**Τ Ident**: _`object`_

_Defined in [lexer.ts:15](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L15)_

#### Type declaration

---

<a id="number"></a>

### Number

**Τ Number**: _`object`_

_Defined in [lexer.ts:18](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L18)_

#### Type declaration

---

<a id="paren"></a>

### Paren

**Τ Paren**: _`object`_

_Defined in [lexer.ts:20](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L20)_

#### Type declaration

---

<a id="property"></a>

### Property

**Τ Property**: _"display"⎮"visibility"⎮"color"⎮"font-size"⎮"text-indent"⎮"background-color"⎮"background-image"⎮"outline-style"⎮"outline-color"⎮"outline-width"_

_Defined in [style.ts:18](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L18)_

---

<a id="relativeselector"></a>

### RelativeSelector

**Τ RelativeSelector**: _`object`_

_Defined in [parser.ts:24](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L24)_

#### Type declaration

---

<a id="selector"></a>

### Selector

**Τ Selector**: _[SimpleSelector](#simpleselector)⎮[CompoundSelector](#compoundselector)⎮[RelativeSelector](#relativeselector)_

_Defined in [parser.ts:31](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L31)_

---

<a id="selectorlist"></a>

### SelectorList

**Τ SelectorList**: _`object`_

_Defined in [parser.ts:32](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L32)_

#### Type declaration

---

<a id="semicolon"></a>

### Semicolon

**Τ Semicolon**: _`object`_

_Defined in [lexer.ts:25](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L25)_

#### Type declaration

---

<a id="simpleselector"></a>

### SimpleSelector

**Τ SimpleSelector**: _[TypeSelector](#typeselector)⎮[ClassSelector](#classselector)⎮[IdSelector](#idselector)_

_Defined in [parser.ts:18](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L18)_

---

<a id="state"></a>

### State

**Τ State**: _"default"⎮"focus"_

_Defined in [style.ts:3](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L3)_

---

<a id="string"></a>

### String

**Τ String**: _`object`_

_Defined in [lexer.ts:16](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L16)_

#### Type declaration

---

<a id="style"></a>

### Style

**Τ Style**: _`object`_

_Defined in [style.ts:20](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L20)_

#### Type declaration

---

<a id="typeselector"></a>

### TypeSelector

**Τ TypeSelector**: _`object`_

_Defined in [parser.ts:14](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L14)_

#### Type declaration

---

<a id="whitespace"></a>

### Whitespace

**Τ Whitespace**: _`object`_

_Defined in [lexer.ts:12](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L12)_

#### Type declaration

---

# Variables

<a id="cssalphabet"></a>

### CssAlphabet

**● CssAlphabet**: _`Alphabet`.<[CssToken](#csstoken)>_ = [
whitespace,
character,
comment,
ident,
string,
number,
delim
]

_Defined in [lexer.ts:200](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L200)_

---

<a id="cssgrammar"></a>

### CssGrammar

**● CssGrammar**: _`Grammar`.<[CssToken](#csstoken)>,.<[CssTree](#csstree)>_ = [
whitespace,
comment,
delim,
ident,
comma
]

_Defined in [parser.ts:229](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L229)_

---

<a id="properties"></a>

### properties

**● properties**: _`Array`.<[Property](#property)>_ = []

_Defined in [style.ts:22](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L22)_

---

# Functions

<a id="clean"></a>

### clean

► **clean**(style: _[Style](#style)_): [Style](#style)

_Defined in [style.ts:46](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L46)_

**Parameters:**

| Param | Type            | Description |
| ----- | --------------- | ----------- |
| style | [Style](#style) | -           |

**Returns:** [Style](#style)

---

<a id="deduplicate"></a>

### deduplicate

► **deduplicate**(base: _[Style](#style)_, target: _[Style](#style)_): [Style](#style)

_Defined in [style.ts:32](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/style.ts#L32)_

**Parameters:**

| Param  | Type            | Description |
| ------ | --------------- | ----------- |
| base   | [Style](#style) | -           |
| target | [Style](#style) | -           |

**Returns:** [Style](#style)

---

<a id="isdelim"></a>

### isDelim

► **isDelim**(token: _[CssToken](#csstoken)⎮`null`_): `boolean`

_Defined in [lexer.ts:52](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L52)_

**Parameters:**

| Param | Type                         | Description |
| ----- | ---------------------------- | ----------- |
| token | [CssToken](#csstoken)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="isident"></a>

### isIdent

► **isIdent**(token: _[CssToken](#csstoken)⎮`null`_): `boolean`

_Defined in [lexer.ts:48](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L48)_

**Parameters:**

| Param | Type                         | Description |
| ----- | ---------------------------- | ----------- |
| token | [CssToken](#csstoken)⎮`null` | -           |

**Returns:** `boolean`

---

<a id="lex"></a>

### lex

► **lex**(input: _`string`_): `Array`.<[CssToken](#csstoken)>

_Defined in [lexer.ts:210](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/lexer.ts#L210)_

**Parameters:**

| Param | Type     | Description |
| ----- | -------- | ----------- |
| input | `string` | -           |

**Returns:** `Array`.<[CssToken](#csstoken)>

---

<a id="parse"></a>

### parse

► **parse**(input: _`string`_): [CssTree](#csstree)⎮`null`

_Defined in [parser.ts:237](https://github.com/Siteimprove/alfa/blob/master/packages/css/src/parser.ts#L237)_

**Parameters:**

| Param | Type     | Description |
| ----- | -------- | ----------- |
| input | `string` | -           |

**Returns:** [CssTree](#csstree)⎮`null`

---
