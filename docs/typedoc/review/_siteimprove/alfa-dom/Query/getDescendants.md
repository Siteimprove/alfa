# Variable: getDescendants

```ts
const getDescendants: {
<T>  (refinement): (node, options?) => Sequence<T>;
  (predicate): (node, options?) => Sequence<Node>;
} = descendants.getDescendants;
```

Defined in: [alfa-dom/src/node/query/index.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/query/index.ts)

## Call Signature

```ts
<T>(refinement): (node, options?) => Sequence<T>;
```

### Type Parameters

#### T

`T` *extends* [`Node`](../Node-1.md)

### Parameters

#### refinement

`Refinement`\<[`Node`](../Node-1.md), `T`\>

### Returns

(`node`, `options?`) => `Sequence`\<`T`\>

## Call Signature

```ts
(predicate): (node, options?) => Sequence<Node>;
```

### Parameters

#### predicate

`Predicate`\<[`Node`](../Node-1.md)\>

### Returns

(`node`, `options?`) => `Sequence`\<[`Node`](../Node-1.md)\>
