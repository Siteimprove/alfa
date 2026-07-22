# Type Alias: Question\<R\>

```ts
type Question<R> = R extends Rule<any, any, infer Q, any> ? Q : never;
```
