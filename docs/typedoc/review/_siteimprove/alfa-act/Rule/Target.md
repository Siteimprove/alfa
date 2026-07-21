# Type Alias: Target\<`R`\>

```ts
type Target<R> = R extends Rule<any, infer T, any, any> ? T : never;
```
