<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-tuple](./alfa-tuple.md) &gt; [Tuple](./alfa-tuple.tuple.md) &gt; [reduce](./alfa-tuple.tuple.reduce.md)

## Tuple.reduce() function

<b>Signature:</b>

```typescript
export function reduce<T extends Tuple, U>(tuple: T, reducer: Reducer<Item<T>, U, [index: number]>, accumulator: U): U;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  tuple | T |  |
|  reducer | [Reducer](./alfa-reducer.reducer.md)<!-- -->&lt;[Item](./alfa-tuple.tuple.item.md)<!-- -->&lt;T&gt;, U, \[index: number\]&gt; |  |
|  accumulator | U |  |

<b>Returns:</b>

U
