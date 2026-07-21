# Class: Cache

## Constructors

### Constructor

```typescript
protected new Cache(): Cache;
```

## empty

### empty()

```typescript
static empty(): Cache;
```

## get

### get()

```typescript
get<I, T extends Hashable, Q extends Metadata, S>(rule: Rule<I, T, Q, S>, ifMissing: Thunk<Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>>): Promise<Iterable<Outcome<I, T, Q, S, Value>, any, any>>;
```
