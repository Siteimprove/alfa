[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-dom](../../alfa-dom.md) / [Node](../Node.md) / getNodesBetween

# Variable: getNodesBetween

> `const` **getNodesBetween**: (`node1`, `node2`, `includeOptions`, `treeOptions`) => `Sequence`\<[`Node`](../Node-1.md)\> = `traversal.getNodesBetween`

Defined in: [alfa-dom/src/node/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/index.ts)

Get content between two nodes. The relative order of the nodes is unknown.
Options let it choose whether the first or second node (in tree order)
should be included. By default, exclude both.

When the first node is not included, all its subtree is skipped, that is we
start looking after the closing tag, not after the opening one.

Returns empty sequence in the corner case where both nodes are the same and
at least one is excluded (i.e. considers that [X,X[ and ]X,X] are empty).

Complexity: the size of the subtree anchored at the lowest common ancestor.

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `node1` | [`Node`](../Node-1.md) | `undefined` |
| `node2` | [`Node`](../Node-1.md) | `undefined` |
| `includeOptions` | `Options` | `...` |
| `treeOptions` | `object` & `KeyedByArray`\<\[`"composed"`, `"flattened"`, `"nested"`\], `boolean`\> | `BaseNode.fullTree` |

## Returns

`Sequence`\<[`Node`](../Node-1.md)\>
