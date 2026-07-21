# Interface: Evaluate()\<`I`, `T` *extends* `Hashable`, `Q` *extends* [`Metadata`](../../Question/Metadata.md), `S`\>

```typescript
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
