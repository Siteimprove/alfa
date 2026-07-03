[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-act](../../../alfa-act.md) / [Outcome](../../Outcome.md) / [CantTell](../CantTell-1.md) / EARL

# Interface: EARL

Defined in: [alfa-act/src/outcome.ts:668](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L668)

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

Defined in: [alfa-act/src/outcome.ts:669](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L669)

#### @type

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@type` | `"earl:TestResult"` |  | [alfa-act/src/outcome.ts:670](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L670) |

#### earl:outcome

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl:outcome` | `object` |  | [alfa-act/src/outcome.ts:671](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L671) |
| `earl:outcome.@id` | `"earl:cantTell"` |  | [alfa-act/src/outcome.ts:672](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L672) |

#### earl:pointer

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl:pointer?` | `EARL` |  | [alfa-act/src/outcome.ts:674](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L674) |

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
