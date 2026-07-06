[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Outcome](../Outcome.md) / EARL

# Interface: EARL

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Extends

- `EARL`

## Extended by

- [`EARL`](Passed/EARL.md)
- [`EARL`](Failed/EARL.md)
- [`EARL`](CantTell/EARL.md)
- [`EARL`](Inapplicable/EARL.md)

## Indexable

> \[`key`: `string`\]: `JSON` \| `undefined`

## @context

### @context?

> `optional` **@context?**: `object`

Defined in: alfa-earl/dist/earl.d.ts

#### cnt

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `cnt?` | `"http://www.w3.org/2011/content#"` |  | alfa-earl/dist/earl.d.ts |

#### dct

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `dct?` | `"http://purl.org/dc/terms/"` |  | alfa-earl/dist/earl.d.ts |

#### doap

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `doap?` | `"http://usefulinc.com/ns/doap#"` |  | alfa-earl/dist/earl.d.ts |

#### earl

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl?` | `"http://www.w3.org/ns/earl#"` |  | alfa-earl/dist/earl.d.ts |

#### foaf

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `foaf?` | `"http://xmlns.com/foaf/0.1/"` |  | alfa-earl/dist/earl.d.ts |

#### http

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `http?` | `"http://www.w3.org/2011/http#"` |  | alfa-earl/dist/earl.d.ts |

#### ptr

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `ptr?` | `"http://www.w3.org/2009/pointers#"` |  | alfa-earl/dist/earl.d.ts |

#### Inherited from

`earl.EARL.@context`

## @type

### @type

> **@type**: `"earl:Assertion"`

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## earl:mode

### earl:mode

> **earl:mode**: `"earl:automatic"` \| `"earl:semiAuto"` \| `"earl:manual"`

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## earl:test

### earl:test

> **earl:test**: `object`

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

#### @id

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@id` | `string` |  | [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts) |
