[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Query](../Query.md) / getElementIdMap

# Variable: getElementIdMap

> `const` **getElementIdMap**: (`node`) => `Map`\<`string`, [`Element`](../Element-1.md)\<`string`\>\> = `elementIdMap.getElementIdMap`

Defined in: [alfa-dom/src/node/query/index.ts:15](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

Returns a map from id to elements, in the subtree rooted at a given node.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `node` | [`Node`](../Node-1.md) |

## Returns

`Map`\<`string`, [`Element`](../Element-1.md)\<`string`\>\>

## Private Remarks

Since `id` are scoped to trees, and do not cross shadow or content boundaries,
we never need traversal options.
