<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-thenable](./alfa-thenable.md) &gt; [Thenable](./alfa-thenable.thenable.md) &gt; [map](./alfa-thenable.thenable.map.md)

## Thenable.map() function

**Signature:**

```typescript
function map<T, U, E = unknown>(thenable: Thenable<T, E>, mapper: Mapper<T, U>): Thenable<U, E>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  thenable | [Thenable](./alfa-thenable.thenable.md)<!-- -->&lt;T, E&gt; |  |
|  mapper | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, U&gt; |  |

**Returns:**

[Thenable](./alfa-thenable.thenable.md)<!-- -->&lt;U, E&gt;

