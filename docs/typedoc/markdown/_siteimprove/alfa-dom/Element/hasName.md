[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Element](../Element.md) / hasName

# Variable: hasName

> **hasName**: \{\<`N`\>(`predicate`): `Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>; \<`N`\>(`name`, ...`rest`): `Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>; \}

Defined in: [alfa-dom/src/node/slotable/element.ts:566](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

> \<`N`\>(`predicate`): `Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Refinement`\<`string`, `N`\> |

### Returns

`Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>

## Call Signature

> \<`N`\>(`name`, ...`rest`): `Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `N` |
| ...`rest` | `N`[] |

### Returns

`Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>
