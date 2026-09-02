---
"@siteimprove/alfa-style": patch
---

**Fixed:** `Style.of()` no longer re-flattens the entire inherited CSS custom-property (variable) scope for elements that declare no custom properties of their own — the common case. Previously, every element's style computation re-substituted `var()` references across the *whole* inherited variable set, even though that set was already flattened on the parent and nothing changed. On a real-world page with a large design-token system (1,742 custom properties observed on one fixture), this was measured to be the dominant cost of style resolution: `sia-r65`, whose algorithm computes style for many elements per target, dropped from ~129.5s to ~39.6s on a 10k-node page (a single, fresh, uncached evaluation - not a repeat-evaluation artifact). `sia-r62` dropped ~39%. Verified identical pass/fail/cantTell/inapplicable outcomes across every rule, on both a small and a 10k-node fixture, with and without the fix.
