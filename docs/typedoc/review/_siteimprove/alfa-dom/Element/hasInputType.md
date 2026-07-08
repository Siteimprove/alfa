# Variable: hasInputType

```ts
hasInputType: {
  (predicate): Predicate<Element<string>>;
  (inputType, ...rest): Predicate<Element<string>>;
};
```

Defined in: [alfa-dom/src/node/slotable/element.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-dom/src/node/slotable/element.ts)

## Call Signature

```ts
(predicate): Predicate<Element<string>>;
```

### Parameters

#### predicate

`Predicate`\<`InputType`\>

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>

## Call Signature

```ts
(inputType, ...rest): Predicate<Element<string>>;
```

### Parameters

#### inputType

`InputType`

#### rest

...`InputType`[]

### Returns

`Predicate`\<[`Element`](../Element-1.md)\<`string`\>\>
