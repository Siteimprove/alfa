[**Alfa API documentation**](../../../../README.md)

***

[Alfa API documentation](../../../../README.md) / [@siteimprove/alfa-act](../../../alfa-act.md) / [Rule](../../Rule.md) / [Event](../Event.md) / end

# Function: end()

## Call Signature

> **end**\<`I`, `T`, `Q`, `S`, `N`\>(`rule`, `name`): [`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `N`\>

Defined in: [alfa-act/src/rule.ts:759](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../../Question/Metadata.md) | - |
| `S` | - |
| `N` *extends* `string` | `string` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](../../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |
| `name` | `N` |

### Returns

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `N`\>

## Call Signature

> **end**\<`I`, `T`, `Q`, `S`\>(`rule`): [`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `"total"`\>

Defined in: [alfa-act/src/rule.ts:767](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

### Type Parameters

| Type Parameter |
| ------ |
| `I` |
| `T` *extends* `Hashable` |
| `Q` *extends* [`Metadata`](../../Question/Metadata.md) |
| `S` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](../../Rule-1.md)\<`I`, `T`, `Q`, `S`\> |

### Returns

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `"total"`\>
