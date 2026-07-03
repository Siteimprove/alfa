[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Query](../Query.md) / getTextDescendants

# Variable: getTextDescendants

> `const` **getTextDescendants**: \<`N`\>(`textOptions`) => (`node`, `options?`) => `Sequence`\<[`Text`](../Text-1.md) \| `TextGroup`\> = `descendants.getTextDescendants`

Defined in: [alfa-dom/src/node/query/index.ts:14](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

Get all text descendants of a node, optionally grouping some into labeled groups.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `N` *extends* [`Node`](../Node-1.md) | [`Node`](../Node-1.md) |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `textOptions` | `TextGroupOptions`\<`N`\> | `defaultTextOptions` |

## Returns

(`node`, `options?`) => `Sequence`\<[`Text`](../Text-1.md) \| `TextGroup`\>

## Remarks

When a descendant matches `startsGroup`, all of its text descendants are collected
into a [TextGroup](TextGroup.md) with a label from `getLabel`. Text nodes outside such
sub-trees are returned as plain [Text](../Text-1.md) nodes.

Groups are not nested: if a `startsGroup` node contains another `startsGroup` node,
the inner node's text is included in the outer group, not as a separate group.
