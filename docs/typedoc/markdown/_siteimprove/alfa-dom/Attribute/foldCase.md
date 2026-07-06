[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Attribute](../Attribute.md) / foldCase

# Function: foldCase()

> **foldCase**\<`N`\>(`name`, `owner`): `N` \| `Lowercase`\<`N`\>

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

**`Internal`**

Conditionally fold the case of an attribute name based on its owner; HTML
attributes are case-insensitive while attributes in other namespaces aren't.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* `string` | `string` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `N` |
| `owner` | `Option`\<[`Element`](../Element-1.md)\<`string`\>\> |

## Returns

`N` \| `Lowercase`\<`N`\>
