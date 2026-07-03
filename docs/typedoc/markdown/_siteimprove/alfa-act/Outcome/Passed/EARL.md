[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-act](../../../alfa-act.md) / [Outcome](../../Outcome.md) / [Passed](../Passed-1.md) / EARL

# Interface: EARL

Defined in: [alfa-act/src/outcome.ts:328](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L328)

## Extends

- [`EARL`](../EARL.md)

## Indexable

> \[`key`: `string`\]: `JSON` \| `undefined`

## @context

### @context?

> `optional` **@context?**: `object`

Defined in: alfa-earl/dist/earl.d.ts:6

#### cnt

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `cnt?` | `"http://www.w3.org/2011/content#"` |  | alfa-earl/dist/earl.d.ts:8 |

#### dct

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `dct?` | `"http://purl.org/dc/terms/"` |  | alfa-earl/dist/earl.d.ts:9 |

#### doap

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `doap?` | `"http://usefulinc.com/ns/doap#"` |  | alfa-earl/dist/earl.d.ts:10 |

#### earl

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl?` | `"http://www.w3.org/ns/earl#"` |  | alfa-earl/dist/earl.d.ts:7 |

#### foaf

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `foaf?` | `"http://xmlns.com/foaf/0.1/"` |  | alfa-earl/dist/earl.d.ts:11 |

#### http

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `http?` | `"http://www.w3.org/2011/http#"` |  | alfa-earl/dist/earl.d.ts:12 |

#### ptr

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `ptr?` | `"http://www.w3.org/2009/pointers#"` |  | alfa-earl/dist/earl.d.ts:13 |

#### Inherited from

[`EARL`](../EARL.md).[`@context`](../EARL.md#context)

## @type

### @type

> **@type**: `"earl:Assertion"`

Defined in: [alfa-act/src/outcome.ts:179](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L179)

#### Inherited from

[`EARL`](../EARL.md).[`@type`](../EARL.md#type)

## earl:mode

### earl:mode

> **earl:mode**: `"earl:automatic"` \| `"earl:semiAuto"` \| `"earl:manual"`

Defined in: [alfa-act/src/outcome.ts:180](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L180)

#### Inherited from

[`EARL`](../EARL.md).[`earl:mode`](../EARL.md#earlmode)

## earl:result

### earl:result

> **earl:result**: `object`

Defined in: [alfa-act/src/outcome.ts:329](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L329)

#### @type

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@type` | `"earl:TestResult"` |  | [alfa-act/src/outcome.ts:330](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L330) |

#### earl:info

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl:info` | `string` |  | [alfa-act/src/outcome.ts:334](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L334) |

#### earl:outcome

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl:outcome` | `object` |  | [alfa-act/src/outcome.ts:331](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L331) |
| `earl:outcome.@id` | `"earl:passed"` |  | [alfa-act/src/outcome.ts:332](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L332) |

#### earl:pointer

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl:pointer?` | `EARL` |  | [alfa-act/src/outcome.ts:335](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L335) |

## earl:test

### earl:test

> **earl:test**: `object`

Defined in: [alfa-act/src/outcome.ts:181](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L181)

#### @id

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@id` | `string` |  | [alfa-act/src/outcome.ts:182](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L182) |

#### Inherited from

[`EARL`](../EARL.md).[`earl:test`](../EARL.md#earltest)
