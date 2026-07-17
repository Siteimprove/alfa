# Class: Audit\<`I`, `T` *extends* `Hashable`, `Q` *extends* [`Metadata`](Question/Metadata.md) = \{ \}, `S` = `T`\>

## Constructors

### Constructor

```typescript
protected new Audit<I, T extends Hashable, Q extends Metadata = {
}, S = T>(
   input: I, 
   rules: List<Rule<I, T, Q, S>>, 
   oracle: Oracle<I, T, Q, S>
): Audit<I, T, Q, S>;
```

## evaluate

### evaluate()

```typescript
evaluate(performance?: Performance<Event<I, T, Q, S, Type, string>>): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```

## of

### of()

```typescript
static of<I, T extends Hashable, Q extends Metadata = {
}, S = T>(
   input: I, 
   rules: Iterable<Rule<I, T, Q, S>>, 
   oracle?: Oracle<I, T, Q, S>
): Audit<I, T, Q, S>;
```
