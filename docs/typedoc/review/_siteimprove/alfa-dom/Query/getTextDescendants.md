# Variable: getTextDescendants

```ts
const getTextDescendants: <N>(textOptions) => (node, options?) => Sequence<Text | TextGroup> = descendants.getTextDescendants;
```

Defined in: [alfa-dom/src/node/query/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

## Type Parameters

### N

`N` *extends* [`Node`](../Node-1.md) = [`Node`](../Node-1.md)

## Parameters

### textOptions?

`TextGroupOptions`\<`N`\> = `defaultTextOptions`

## Returns

(`node`, `options?`) => `Sequence`\<[`Text`](../Text-1.md) \| `TextGroup`\>
