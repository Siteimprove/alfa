# Type Alias: `Subject<R>`

```ts
type Subject<R> = R extends Rule<any, any, any, infer S> ? S : never;
```
