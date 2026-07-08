# Variable: hasNamespace

```ts
hasNamespace: {
  (predicate): Predicate<Element<string>>;
  (namespace, ...rest): Predicate<Element<string>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
(predicate): Predicate<Element<string>>;
```

### Parameters

#### predicate

`Predicate`\<[`Namespace`](../Namespace-1.md)\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(namespace, ...rest): Predicate<Element<string>>;
```

### Parameters

#### namespace

[`Namespace`](../Namespace-1.md)

#### rest

...[`Namespace`](../Namespace-1.md)[]

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>
