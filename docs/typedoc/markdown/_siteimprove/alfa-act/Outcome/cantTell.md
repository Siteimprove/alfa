[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Outcome](../Outcome.md) / cantTell

# Variable: cantTell

> **cantTell**: \<`I`, `T`, `Q`, `S`\>(`rule`, `target`, `diagnostic`, `mode`) => [`CantTell`](CantTell-2.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:702](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts#L702)

## Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) |
| `S` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `target` | `T` |
| `diagnostic` | [`Diagnostic`](../Diagnostic-1.md) |
| `mode` | [`Mode`](Mode.md) |

## Returns

[`CantTell`](CantTell-2.md)\<`I`, `T`, `Q`, `S`\>
