<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Cache](./alfa-act.cache.md) &gt; [get](./alfa-act.cache.get.md)

## Cache.get() method

**Signature:**

```typescript
get<I, T extends Hashable, Q extends Question.Metadata, S>(rule: Rule<I, T, Q, S>, ifMissing: Thunk<Future<Iterable<Outcome<I, T, Q, S>>>>): Future<Iterable<Outcome<I, T, Q, S>>>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

rule


</td><td>

Rule&lt;I, T, Q, S&gt;


</td><td>


</td></tr>
<tr><td>

ifMissing


</td><td>

Thunk&lt;Future&lt;Iterable&lt;Outcome&lt;I, T, Q, S&gt;&gt;&gt;&gt;


</td><td>


</td></tr>
</tbody></table>

**Returns:**

Future&lt;Iterable&lt;Outcome&lt;I, T, Q, S&gt;&gt;&gt;

