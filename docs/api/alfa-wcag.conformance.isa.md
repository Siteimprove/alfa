<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-wcag](./alfa-wcag.md) &gt; [Conformance](./alfa-wcag.conformance.md) &gt; [isA](./alfa-wcag.conformance.isa.md)

## Conformance.isA() function

Check if a criterion is needed for level AA conformance under the specified version.

**Signature:**

```typescript
function isA<V extends Criterion.Version = Criterion.Version.Recommendation>(version?: V): Refinement<Criterion, Criterion<A<V>>>;
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

version


</td><td>

V


</td><td>

_(Optional)_


</td></tr>
</tbody></table>

**Returns:**

Refinement&lt;Criterion, Criterion&lt;[A](./alfa-wcag.conformance.a.md)<!-- -->&lt;V&gt;&gt;&gt;

