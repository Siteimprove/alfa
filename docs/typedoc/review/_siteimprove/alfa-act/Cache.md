# Class: `Cache`

## Constructors

### Constructor

```ts
protected new Cache(): Cache;
```

## empty

### empty()

```ts
static empty(): Cache;
```

## get

### get()

```ts
get<I, T extends Hashable, Q extends Metadata, S>(rule: Rule<I, T, Q, S>, ifMissing: Thunk<Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>>): Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>;
```
