<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-css](./alfa-css.md) &gt; [Position](./alfa-css.position_namespace.md) &gt; [parse](./alfa-css.position_namespace.parse_1_function.md)

## Position.parse() function

<b>Signature:</b>

```typescript
function parse(legacySyntax?: boolean): Parser<Slice<Token>, Position, string>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  legacySyntax | boolean |  |

<b>Returns:</b>

[Parser](./alfa-parser.parser_typealias.md)<!-- -->&lt;[Slice](./alfa-slice.slice_class.md)<!-- -->&lt;[Token](./alfa-css.token_typealias.md)<!-- -->&gt;, [Position](./alfa-css.position_class.md)<!-- -->, string&gt;

## Remarks

Positions can be declared using either 1, 2, 3, or 4 tokens with the longest possible match taking precedence. The 3-token syntax is deprecated and must be selectively enabled.

Notation:

- H/V: keyword, top \| bottom \| right \| left \| center - h/v: numeric, &lt;<!-- -->length \| percentage<!-- -->&gt; - Hh/Vv: keyword (excluding center) and numeric

Syntax:

- 4 tokens: Hh Vv \| Vv Hh - 3 tokens: Hh V \| H Vv \| Vv H \| V Hh - 2 tokens: H V \| H v \| h V \| h v \| V H - 1 token: H \| V \| h

[https://drafts.csswg.org/css-values/\#typedef-position](https://drafts.csswg.org/css-values/#typedef-position) [https://drafts.csswg.org/css-backgrounds/\#typedef-bg-position](https://drafts.csswg.org/css-backgrounds/#typedef-bg-position)

