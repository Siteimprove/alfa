# Interface: Evaluate()\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md)

### S

`S`

```ts
Evaluate(
   input, 
   oracle, 
   outcomes, 
performance?): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Parameters

### input

`Readonly`\<`I`\>

### oracle

`object` *extends* `Q` ? `any` : [`Oracle`](../Oracle.md)\<`I`, `T`, `Q`, `S`\>

### outcomes

[`Cache`](../Cache.md)

### performance?

`Performance`\<[`Event`](Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](Event/Type.md), `string`\>\>

## Returns

`Promise`\<`Iterable`\<[`Outcome`](../Outcome-1.md)\<`I`, `T`, `Q`, `S`, [`Value`](../Outcome/Value.md)\>\>\>
