# Function: end()

## Call Signature

```ts
function end<I, T, Q, S, N>(rule: Rule<I, T, Q, S>, name: N): Event<I, T, Q, S, "end", N>;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

### Type Parameters

#### I

`I`

#### T

`T` *extends* `Hashable`

#### Q

`Q` *extends* [`Metadata`](../../Question/Metadata.md)

#### S

`S`

#### N

`N` *extends* `string` = `string`

### Parameters

#### rule

[`Rule`](../../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

#### name

`N`

### Returns

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `N`\>

## Call Signature

```ts
function end<I, T, Q, S>(rule: Rule<I, T, Q, S>): Event<I, T, Q, S, "end", "total">;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

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

#### rule

[`Rule`](../../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

### Returns

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"end"`, `"total"`\>
