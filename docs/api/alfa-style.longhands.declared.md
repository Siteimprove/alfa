<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-style](./alfa-style.md) &gt; [Longhands](./alfa-style.longhands.md) &gt; [Declared](./alfa-style.longhands.declared.md)

## Longhands.Declared type

Extract the declared type of a named property.

[https://drafts.csswg.org/css-cascade/\#declared](https://drafts.csswg.org/css-cascade/#declared)

**Signature:**

```typescript
export type Declared<N extends Name> = Parsed<N> | Longhand.Default;
```
**References:** [Name](./alfa-style.longhands.name.md)<!-- -->, [Parsed](./alfa-style.longhands.parsed.md)

## Remarks

The declared type includes the parsed type in addition to the defaulting keywords recognised by all properties. It is the type of what can actually be written as the value of the property.

