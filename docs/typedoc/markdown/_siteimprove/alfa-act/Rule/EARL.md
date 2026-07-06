[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Rule](../Rule.md) / EARL

# Interface: EARL

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Extends

- `EARL`

## Indexable

> \[`key`: `string`\]: `JSON` \| `undefined`

## @context

### @context

> **@context**: `object`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### dct

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `dct` | `"http://purl.org/dc/terms/"` |  | [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts) |

#### earl

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl` | `"http://www.w3.org/ns/earl#"` |  | [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts) |

#### Overrides

`earl.EARL.@context`

## @id

### @id

> **@id**: `string`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## @type

### @type

> **@type**: \[`"earl:TestCriterion"`, `"earl:TestCase"`\]

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## dct:isPartOf

### dct:isPartOf

> **dct:isPartOf**: `object`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

#### @set

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@set` | `Array`\<[`EARL`](../Requirement/EARL.md)\> |  | [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts) |
