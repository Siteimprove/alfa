# Type Alias: Subject\<R\>

```ts
type Subject<R> = R extends Rule<any, any, any, infer S> ? S : never;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### R

`R`
