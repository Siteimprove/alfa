# Variable: hasName

```ts
hasName: {
<N>  (predicate: Refinement<string, N>): Refinement<Attribute<string>, Attribute<N>>;
<N>  (name: N, ...rest: N[]): Refinement<Attribute<string>, Attribute<N>>;
};
```

Defined in: [alfa-dom/src/node/attribute.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/attribute.ts)

## Call Signature

```ts
<N>(predicate: Refinement<string, N>): Refinement<Attribute<string>, Attribute<N>>;
```

### Type Parameters

#### N

`N` *extends* `string` = `string`

### Parameters

#### predicate

`Refinement`\<`string`, `N`\>

### Returns

`Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>

## Call Signature

```ts
<N>(name: N, ...rest: N[]): Refinement<Attribute<string>, Attribute<N>>;
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

`Refinement`\<[`Attribute`](../Attribute-1.md)\<`string`\>, [`Attribute`](../Attribute-1.md)\<`N`\>\>
