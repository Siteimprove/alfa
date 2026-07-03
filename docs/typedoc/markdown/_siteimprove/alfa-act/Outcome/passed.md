[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Outcome](../Outcome.md) / passed

# Variable: passed

> **passed**: \<`I`, `T`, `Q`, `S`\>(`rule`, `target`, `expectations`, `mode`) => [`Passed`](Passed-2.md)\<`I`, `T`, `Q`, `S`\>

Defined in: [alfa-act/src/outcome.ts:363](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

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
| `expectations` | `Record`\<\{\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>; \}\> |
| `mode` | [`Mode`](Mode.md) |

## Returns

[`Passed`](Passed-2.md)\<`I`, `T`, `Q`, `S`\>
