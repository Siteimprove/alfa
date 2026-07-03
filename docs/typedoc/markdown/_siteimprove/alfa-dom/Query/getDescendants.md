[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Query](../Query.md) / getDescendants

# Variable: getDescendants

> `const` **getDescendants**: \{\<`T`\>(`refinement`): (`node`, `options?`) => `Sequence`\<`T`\>; (`predicate`): (`node`, `options?`) => `Sequence`\<[`Node`](../Node-1.md)\>; \} = `descendants.getDescendants`

Defined in: [alfa-dom/src/node/query/index.ts:10](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts#L10)

## Call Signature

> \<`T`\>(`refinement`): (`node`, `options?`) => `Sequence`\<`T`\>

Get all descendants of a node that satisfy a given refinement.

### Type Parameters

| Type Parameter |
| ------ |
| `T` *extends* [`Node`](../Node-1.md) |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `refinement` | `Refinement`\<[`Node`](../Node-1.md), `T`\> |

### Returns

(`node`, `options?`) => `Sequence`\<`T`\>

### Remarks

In order to properly cache results for improved performance, care must be taken
to use the exact same refinement (JS object) and not merely a clone of it.

## Call Signature

> (`predicate`): (`node`, `options?`) => `Sequence`\<[`Node`](../Node-1.md)\>

Get all descendants of a node that satisfy a given predicate.

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `Predicate`\<[`Node`](../Node-1.md)\> |

### Returns

(`node`, `options?`) => `Sequence`\<[`Node`](../Node-1.md)\>

### Remarks

In order to properly cache results for improved performance, care must be taken
to use the exact same predicate (JS object) and not merely a clone of it.
