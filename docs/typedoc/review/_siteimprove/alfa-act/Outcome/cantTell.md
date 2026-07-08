# Variable: cantTell

```ts
cantTell: <I, T, Q, S>(rule, target, diagnostic, mode) => CantTell<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md)

### S

`S`

## Parameters

### rule

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

### target

`T`

### diagnostic

[`Diagnostic`](../Diagnostic-1.md)

### mode

[`Mode`](Mode.md)

## Returns

[`CantTell`](CantTell-2.md)\<`I`, `T`, `Q`, `S`\>
