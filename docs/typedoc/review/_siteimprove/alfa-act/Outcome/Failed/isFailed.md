# Function: isFailed()

## Call Signature

```ts
function isFailed<I, T, Q, S>(value: Outcome<I, T, Q, S>): value is Failed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

### Type Parameters

#### I

`I`

#### T

`T` *extends* `Hashable`

#### Q

`Q` *extends* [`Metadata`](../../Question/Metadata.md)

#### S

`S`

### Parameters

#### value

[`Outcome`](../../Outcome-1.md)\<`I`, `T`, `Q`, `S`\>

### Returns

`value is Failed<I, T, Q, S>`

## Call Signature

```ts
function isFailed<I, T, Q, S>(value: unknown): value is Failed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

### Type Parameters

#### I

`I`

#### T

`T` *extends* `Hashable`

#### Q

`Q` *extends* [`Metadata`](../../Question/Metadata.md)

#### S

`S`

### Parameters

#### value

`unknown`

### Returns

`value is Failed<I, T, Q, S>`
