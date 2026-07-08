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
  applicability: Iterable<Interview<Q, S, T, Maybe<T>>>;
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

### applicability()

```ts
applicability(): Iterable<Interview<Q, S, T, Maybe<T>>>;
```

#### Returns

`Iterable`\<[`Interview`](../../Interview-1.md)\<`Q`, `S`, `T`, `Maybe`\<`T`\>\>\>

### expectations()

```ts
expectations(target: T): {
[key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic, Diagnostic>>>;
};
```

#### Parameters

##### target

`T`

#### Returns

```ts
{
[key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic, Diagnostic>>>;
}
```
