<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-generator](./alfa-generator.md) &gt; [Generator\_2](./alfa-generator.generator_2.md) &gt; [flatMap](./alfa-generator.generator_2.flatmap.md)

## Generator\_2.flatMap() function

**Signature:**

```typescript
function flatMap<T, U, R, N>(generator: Generator<T, R, N>, mapper: Mapper<T, Generator<U, R, N>>): Generator<U, R, N>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  generator | [Generator](./alfa-generator.generator_2.md)<!-- -->&lt;T, R, N&gt; |  |
|  mapper | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, [Generator](./alfa-generator.generator_2.md)<!-- -->&lt;U, R, N&gt;&gt; |  |

**Returns:**

[Generator](./alfa-generator.generator_2.md)<!-- -->&lt;U, R, N&gt;

