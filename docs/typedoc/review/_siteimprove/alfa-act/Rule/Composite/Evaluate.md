# Interface: Evaluate()\<I, T, Q, S\>

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../../Question/Metadata.md)

### S

`S`

```ts
Evaluate(input, performance?): object;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Parameters

### input

`I`

### performance?

#### mark

(`name`) => `Mark`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>

#### measure

(`name`, `start?`) => `Measure`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>

## Returns

### expectations()

```ts
expectations(outcomes): object;
```

#### Parameters

##### outcomes

`Sequence`\<[`Applicable`](../../Outcome/Applicable-1.md)\<`I`, `T`, `Q`, `S`\>\>

#### Returns

`object`
