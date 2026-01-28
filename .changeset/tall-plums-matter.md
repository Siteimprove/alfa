---
"@siteimprove/alfa-style": minor
---

**Breaking:** Used values of style properties can now be any type, wrapped in a value, not just an
`Option` of the computed type. The
`Style.hasUsedValue` predicate now requires as argument a predicate of the used value type (instead of the computed one).

For properties who previously had a used value (typed as `Option<Value<Computed>>`), the new used type is now
`Option<Computed>` and the `.used` function returns a
`Value<Option<Computed>>`. Hence, to access the actual value, replace
`style.used("foo").map(foo => doSomething(foo.value))` with
`style.used("foo").value.map(foo => doSomething(foo))`, and similar permutations.
