<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-iterable](./alfa-iterable.md) &gt; [Iterable\_2](./alfa-iterable.iterable_2.md) &gt; [reduceUntil](./alfa-iterable.iterable_2.reduceuntil.md)

## Iterable\_2.reduceUntil() function

**Signature:**

```typescript
function reduceUntil<T, U = T>(iterable: Iterable<T>, predicate: Predicate<T, [index: number]>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  iterable | [Iterable](./alfa-iterable.iterable_2.md)<!-- -->&lt;T&gt; |  |
|  predicate | Predicate&lt;T, \[index: number\]&gt; |  |
|  reducer | Reducer&lt;T, U, \[index: number\]&gt; |  |
|  accumulator | U |  |

**Returns:**

U

