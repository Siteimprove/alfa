---
"@siteimprove/alfa-act": minor
---

**Breaking:** The `Rule.Event` factory helpers `start`, `end`, `startApplicability`, `endApplicability`, `startExpectation`, and `endExpectation` have been removed.

Emitting the paired `start`/`end` performance marks is now the responsibility of the new `Rule.Instrument`, whose
`phase(name, work)` operation brackets a named span of work. Code that constructed these events directly should
route timing through the `Instrument` instead. `Rule.Event.of` and `Rule.Event.isEvent` remain available.
