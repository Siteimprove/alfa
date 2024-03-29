<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-css](./alfa-css.md) &gt; [Percentage](./alfa-css.percentage.md)

## Percentage type

[https://drafts.csswg.org/css-values/\#numbers](https://drafts.csswg.org/css-values/#numbers)

**Signature:**

```typescript
export type Percentage<H extends BaseNumeric.Type = BaseNumeric.Type> = Percentage.Calculated<H> | Percentage.Fixed<H>;
```
**References:** [Percentage.Calculated](./alfa-css.percentage.calculated.md)<!-- -->, [Percentage.Fixed](./alfa-css.percentage.fixed.md)

## Remarks

Percentages, even if they do not contain a calc() function, act nearly as calculated value. Given a percentage base (i.e., what is 100%), they can resolve to a numeric value of that type.

The Percentage type contains a type hint, H, that indicate into which type this is intended to resolve. This is normally known at parse time (i.e., is it a length?) This is only stored in the type and does not have any effect on the computation.

Calculated percentages can be partially resolved in the absence of a base, they are then turned into a Fixed percentage with the same hint.

Percentages that represent percentages (e.g., RGB components) are special kids in the sense that their partial and full resolution are the same. This requires resolve() to accept zero argument (no resolver) for them.

