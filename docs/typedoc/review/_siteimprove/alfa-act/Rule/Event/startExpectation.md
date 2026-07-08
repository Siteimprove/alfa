# Function: startExpectation()

```ts
function startExpectation<I, T, Q, S>(rule): Event<I, T, Q, S, "start", "expectation">;
```

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

## Parameters

### rule

[`Rule`](../../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

## Returns

[`Event`](../Event-1.md)\<`I`, `T`, `Q`, `S`, `"start"`, `"expectation"`\>
