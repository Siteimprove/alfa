[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Attribute](../Attribute.md) / hasName

# Variable: hasName

> **hasName**: \{\<`N`\>(`predicate`): `Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>; \<`N`\>(`name`, ...`rest`): `Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>; \}

Defined in: [alfa-dom/src/node/attribute.ts:269](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

## Call Signature

> \<`N`\>(`predicate`): `Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>

### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Refinement`\<`string`, `N`\> |

### Returns

`Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>

## Call Signature

> \<`N`\>(`name`, ...`rest`): `Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>

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

`Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>
