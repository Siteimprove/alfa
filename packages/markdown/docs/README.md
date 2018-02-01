# @alfa/markdown

## Index

### Interfaces

* [Blockquote](interfaces/blockquote.md)
* [Break](interfaces/break.md)
* [Code](interfaces/code.md)
* [Definition](interfaces/definition.md)
* [Delete](interfaces/delete.md)
* [Emphasis](interfaces/emphasis.md)
* [Footnote](interfaces/footnote.md)
* [FootnoteDefinition](interfaces/footnotedefinition.md)
* [FootnoteReference](interfaces/footnotereference.md)
* [Heading](interfaces/heading.md)
* [Image](interfaces/image.md)
* [ImageReference](interfaces/imagereference.md)
* [InlineCode](interfaces/inlinecode.md)
* [Link](interfaces/link.md)
* [LinkReference](interfaces/linkreference.md)
* [List](interfaces/list.md)
* [ListItem](interfaces/listitem.md)
* [Node](interfaces/node.md)
* [Paragraph](interfaces/paragraph.md)
* [Parent](interfaces/parent.md)
* [Root](interfaces/root.md)
* [Strong](interfaces/strong.md)
* [Table](interfaces/table.md)
* [TableCell](interfaces/tablecell.md)
* [TableRow](interfaces/tablerow.md)
* [Text](interfaces/text.md)
* [ThematicBreak](interfaces/thematicbreak.md)

### Type aliases

* [Alignment](#alignment)
* [ReferenceType](#referencetype)

### Functions

* [parse](#parse)
* [render](#render)

---

# Type aliases

<a id="alignment"></a>

### Alignment

**Τ Alignment**: _"left"⎮"right"⎮"center"_

_Defined in [types.ts:55](https://github.com/Siteimprove/alfa/blob/master/packages/markdown/src/types.ts#L55)_

---

<a id="referencetype"></a>

### ReferenceType

**Τ ReferenceType**: _"shortcut"⎮"collapsed"⎮"full"_

_Defined in [types.ts:109](https://github.com/Siteimprove/alfa/blob/master/packages/markdown/src/types.ts#L109)_

---

# Functions

<a id="parse"></a>

### parse

► **parse**(markdown: _`string`_): [Root](interfaces/root.md)

_Defined in [parser.ts:15](https://github.com/Siteimprove/alfa/blob/master/packages/markdown/src/parser.ts#L15)_

**Parameters:**

| Param    | Type     | Description |
| -------- | -------- | ----------- |
| markdown | `string` | -           |

**Returns:** [Root](interfaces/root.md)

---

<a id="render"></a>

### render

► **render**T(node: _`T`_): `string`

_Defined in [render.ts:5](https://github.com/Siteimprove/alfa/blob/master/packages/markdown/src/render.ts#L5)_

**Type parameters:**

#### T : [Node](interfaces/node.md)

**Parameters:**

| Param | Type | Description |
| ----- | ---- | ----------- |
| node  | `T`  | -           |

**Returns:** `string`

---
