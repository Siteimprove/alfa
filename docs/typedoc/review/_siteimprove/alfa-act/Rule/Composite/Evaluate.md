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
Evaluate(input: I, performance?: {
  mark: (name: string) => Mark<Event<I, T, Q, S, Type, string>>;
  measure: (name: string, start?: number) => Measure<Event<I, T, Q, S, Type, string>>;
}): {
  expectations: {
   [key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic, Diagnostic>>>;
  };
};
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Parameters

### input

`I`

### performance?

#### mark

(`name`: `string`) => `Mark`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>

#### measure

(`name`: `string`, `start?`: `number`) => `Measure`\<[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, [`Type`](../Event/Type.md), `string`\>\>

## Returns

### expectations()

```ts
expectations(outcomes: Sequence<Applicable<I, T, Q, S>>): {
[key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic, Diagnostic>>>;
};
```

#### Parameters

##### outcomes

`Sequence`\<[`Applicable`](../../Outcome/Applicable-1.md)\<`I`, `T`, `Q`, `S`\>\>

#### Returns

```ts
{
[key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic, Diagnostic>>>;
}
```
