<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-rules](./alfa-rules.md) &gt; [Flattened](./alfa-rules.flattened.md) &gt; [RulesObject](./alfa-rules.flattened.rulesobject.md)

## Flattened.RulesObject type

We want to export types for the possible inputs, targets, … of rules. However, Atomic<!-- -->&lt;<!-- -->I, T, Q, S<!-- -->&gt; \| Atomic<!-- -->&lt;<!-- -->I', T', Q', S'<!-- -->&gt; does \*\*not\*\* extend Rule<!-- -->&lt;<!-- -->?, ?, ?, ?<!-- -->&gt; and act.Rule.Input will result in `never` rather than `I | I'`

So, instead, we need to apply act.Rule.Input on each individual type of the union. This is not directly possible, but can be done through mapped types on an object type containing all the possibilities.

We first construct the object type (<!-- -->{<!-- -->R1: Atomic<!-- -->&lt;<!-- -->…<!-- -->&gt;<!-- -->, R2: …<!-- -->}<!-- -->) and its keys ("R1" \| "R2" \| …) Next, for each extractor, we iterate it over the values of the object type and only keep the resulting values. The unions are then automatically collapsed as we want them.

**Signature:**

```typescript
type RulesObject = typeof rules;
```
