[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Query](../Query.md) / getInclusiveElementDescendants

# Variable: getInclusiveElementDescendants

> `const` **getInclusiveElementDescendants**: (`node`, `options`) => `Sequence`\<[`Element`](../Element-1.md)\<`string`\>\> = `descendants.getInclusiveElementDescendants`

Defined in: [alfa-dom/src/node/query/index.ts:12](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `node` | [`Element`](../Element-1.md) | `undefined` |
| `options` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.Traversal.empty` |

## Returns

`Sequence`\<[`Element`](../Element-1.md)\<`string`\>\>
