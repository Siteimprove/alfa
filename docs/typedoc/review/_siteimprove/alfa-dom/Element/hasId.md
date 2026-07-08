# Variable: hasId

```ts
hasId: {
  (predicate?: Predicate<string>): Predicate<Element<string>>;
  (id: string, ...rest: string[]): Predicate<Element<string>>;
  (ids: Iterable<string>): Predicate<Element<string>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
(predicate?: Predicate<string>): Predicate<Element<string>>;
```

### Parameters

#### predicate?

`Predicate`\<`string`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(id: string, ...rest: string[]): Predicate<Element<string>>;
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
(ids: Iterable<string>): Predicate<Element<string>>;
```

### Parameters

#### ids

`Iterable`\<`string`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>
