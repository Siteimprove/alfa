<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-continuation](./alfa-continuation.md) &gt; [Continuation](./alfa-continuation.continuation.md) &gt; [map](./alfa-continuation.continuation.map.md)

## Continuation.map() function

**Signature:**

```typescript
function map<T, U, R = void, A extends Array<unknown> = []>(continuation: Continuation<T, R, A>, mapper: Mapper<T, U>): Continuation<U, R, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  continuation | [Continuation](./alfa-continuation.continuation.md)<!-- -->&lt;T, R, A&gt; |  |
|  mapper | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, U&gt; |  |

**Returns:**

[Continuation](./alfa-continuation.continuation.md)<!-- -->&lt;U, R, A&gt;

