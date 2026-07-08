# Function: start()

## Call Signature

```ts
function start<I, T, Q, S, N>(rule, name): Event<I, T, Q, S, "start", N>;
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

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"start"`, `N`\>

## Call Signature

```ts
function start<I, T, Q, S>(rule): Event<I, T, Q, S, "start", "total">;
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

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"start"`, `"total"`\>
