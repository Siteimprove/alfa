# Variable: hasAttribute

```ts
hasAttribute: {
  (predicate): Predicate<Element<string>>;
  (name, value?): Predicate<Element<string>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
(predicate): Predicate<Element<string>>;
```

### Parameters

#### predicate

`Predicate`\<[`Attribute`](../Attribute-1.md)\<`string`\>\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(name, value?): Predicate<Element<string>>;
```

### Parameters

#### name

`string`

#### value?

`Predicate`\<`string`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>
