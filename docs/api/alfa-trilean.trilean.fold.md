<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-trilean](./alfa-trilean.md) &gt; [Trilean](./alfa-trilean.trilean.md) &gt; [fold](./alfa-trilean.trilean.fold.md)

## Trilean.fold() function

**Signature:**

```typescript
function fold<T, A extends Array<unknown> = [], V = T, W = T, X = T>(predicate: Predicate<T, A>, ifTrue: Mapper<T, V>, ifFalse: Mapper<T, W>, ifUndefined: Mapper<T, X>, value: T, ...args: A): V | W | X;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  predicate | [Predicate](./alfa-trilean.trilean.predicate.md)<!-- -->&lt;T, A&gt; |  |
|  ifTrue | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, V&gt; |  |
|  ifFalse | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, W&gt; |  |
|  ifUndefined | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, X&gt; |  |
|  value | T |  |
|  args | A |  |

**Returns:**

V \| W \| X

