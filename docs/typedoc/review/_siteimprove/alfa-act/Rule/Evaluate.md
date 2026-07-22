# Interface: Evaluate()\<I, T extends Hashable, Q extends Metadata, S\>

```ts
Evaluate(
   input: Readonly<I>, 
   oracle: {
} extends Q ? any : Oracle<I, T, Q, S>, 
   outcomes: Cache, 
   performance?: Performance<Event<I, T, Q, S, Type, string>>
): Promise<Iterable<Outcome<I, T, Q, S, Value>>>;
```
