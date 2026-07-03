[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [h](../h.md) / element

# Function: element()

> **element**\<`N`\>(`name`, `attributes?`, `children?`, `style?`, `namespace?`, `box?`, `device?`, `externalId?`, `internalId?`, `extraData?`): [`Element`](../Element-1.md)\<`N`\>

Defined in: [alfa-dom/src/h.ts:54](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/h.ts#L54)

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `name` | `N` | `undefined` |
| `attributes` | [`Attribute`](../Attribute-1.md)\<`string`\>[] \| `Record`\<`string`, `string` \| `boolean`\> | `[]` |
| `children` | (`string` \| [`Node`](../Node-1.md))[] | `[]` |
| `style` | `Record`\<`string`, `string`\> \| [`Declaration`](../Declaration-1.md)[] | `[]` |
| `namespace?` | [`Namespace`](../Namespace-1.md) | `undefined` |
| `box?` | `Rectangle` | `undefined` |
| `device?` | `Device` | `undefined` |
| `externalId?` | `string` | `undefined` |
| `internalId?` | `string` | `undefined` |
| `extraData?` | `any` | `undefined` |

## Returns

[`Element`](../Element-1.md)\<`N`\>
