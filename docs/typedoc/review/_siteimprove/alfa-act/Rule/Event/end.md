# Function: `end()`

## Call Signature

```ts
function end<I, T extends Hashable, Q extends Metadata, S, N extends string = string>(rule: Rule<I, T, Q, S>, name: N): Event<I, T, Q, S, "end", N>;
```

## Call Signature

```ts
function end<I, T extends Hashable, Q extends Metadata, S>(rule: Rule<I, T, Q, S>): Event<I, T, Q, S, "end", "total">;
```
