<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-iterable](./alfa-iterable.md) &gt; [Iterable\_2](./alfa-iterable.iterable_2_namespace.md) &gt; [reduceWhile](./alfa-iterable.iterable_2_namespace.reducewhile_1_function.md)

## Iterable\_2.reduceWhile() function

<b>Signature:</b>

```typescript
function reduceWhile<T, U = T>(iterable: Iterable<T>, predicate: Predicate<T, [index: number]>, reducer: Reducer<T, U, [index: number]>, accumulator: U): U;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  iterable | Iterable&lt;T&gt; |  |
|  predicate | [Predicate](./alfa-predicate.predicate_typealias.md)<!-- -->&lt;T, \[index: number\]&gt; |  |
|  reducer | [Reducer](./alfa-reducer.reducer_typealias.md)<!-- -->&lt;T, U, \[index: number\]&gt; |  |
|  accumulator | U |  |

<b>Returns:</b>

U

