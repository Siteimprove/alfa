[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Rule](../Rule.md) / EARL

# Interface: EARL

Defined in: [alfa-act/src/rule.ts:184](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L184)

## Extends

- `EARL`

## Indexable

> \[`key`: `string`\]: `JSON` \| `undefined`

## @context

### @context

> **@context**: `object`

Defined in: [alfa-act/src/rule.ts:185](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L185)

#### dct

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `dct` | `"http://purl.org/dc/terms/"` |  | [alfa-act/src/rule.ts:187](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L187) |

#### earl

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `earl` | `"http://www.w3.org/ns/earl#"` |  | [alfa-act/src/rule.ts:186](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L186) |

#### Overrides

`earl.EARL.@context`

## @id

### @id

> **@id**: `string`

Defined in: [alfa-act/src/rule.ts:190](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L190)

## @type

### @type

> **@type**: \[`"earl:TestCriterion"`, `"earl:TestCase"`\]

Defined in: [alfa-act/src/rule.ts:189](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L189)

## dct:isPartOf

### dct:isPartOf

> **dct:isPartOf**: `object`

Defined in: [alfa-act/src/rule.ts:191](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L191)

#### @set

| Name | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `@set` | `Array`\<[`EARL`](../Requirement/EARL.md)\> |  | [alfa-act/src/rule.ts:192](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts#L192) |
