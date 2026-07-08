# Variable: hasName

```ts
hasName: {
<N>  (predicate): Refinement<Element<string>, Element<N>>;
<N>  (name, ...rest): Refinement<Element<string>, Element<N>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
<N>(predicate): Refinement<Element<string>, Element<N>>;
```

### Type Parameters

#### N

`N` *extends* `string` = `string`

### Parameters

#### predicate

`Refinement`\<`string`, `N`\>

### Returns

`Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>

## Call Signature

```ts
<N>(name, ...rest): Refinement<Element<string>, Element<N>>;
```

### Type Parameters

#### N

`N` *extends* `string` = `string`

### Parameters

#### name

`N`

#### rest

...`N`[]

### Returns

`Refinement`\<[`Element`](../Element-1.md)\<`string`\>, [`Element`](../Element-1.md)\<`N`\>\>
