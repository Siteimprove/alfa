# Variable: hasId

```ts
hasId: {
  (predicate?): Predicate<Element<string>>;
  (id, ...rest): Predicate<Element<string>>;
  (ids): Predicate<Element<string>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
(predicate?): Predicate<Element<string>>;
```

### Parameters

#### predicate?

`Predicate`\<`string`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(id, ...rest): Predicate<Element<string>>;
```

### Parameters

#### id

`string`

#### rest

...`string`[]

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(ids): Predicate<Element<string>>;
```

### Parameters

#### ids

`Iterable`\<`string`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>
