<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-array](./alfa-array.md) &gt; [Array\_2](./alfa-array.array_2.md) &gt; [reduceWhile](./alfa-array.array_2.reducewhile.md)

## Array\_2.reduceWhile() function

**Signature:**

```typescript
function reduceWhile<T, U = T>(array: ReadonlyArray<T>, predicate: Predicate<T, [index: number]>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  array | ReadonlyArray&lt;T&gt; |  |
|  predicate | Predicate&lt;T, \[index: number\]&gt; |  |
|  reducer | Reducer&lt;T, U, \[index: number\]&gt; |  |
|  accumulator | U |  |

**Returns:**

U

