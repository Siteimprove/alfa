[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-act](../../../alfa-act.md) / [Rule](../../Rule.md) / [Atomic](../Atomic.md) / Evaluate

# Interface: Evaluate()\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../../Question/Metadata.md) |
| `S` |

> **Evaluate**(`input`, `performance?`): `object`

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | `I` | - |
| `performance?` | \{ `mark`: (`name`) => `Mark`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>; `measure`: (`name`, `start?`) => `Measure`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>; \} | - |
| `performance.mark?` | (`name`) => `Mark`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\> |  |
| `performance.measure?` | (`name`, `start?`) => `Measure`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\> |  |

## Returns

| Name | Type | Defined in |
| ------ | ------ | ------ |
| `applicability()` | () => `Iterable`\<[`Interview`](../../Interview-1.md)\<`Q`, `S`, `T`, `Maybe`\<`T`\>\>\> | [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts) |
| `expectations()` | (`target`) => `object` | [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts) |
