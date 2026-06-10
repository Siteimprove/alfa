---
"@siteimprove/alfa-act": minor
---

**Breaking:** All functionalities now use `Promise` instead of `Future`.

The return value of `Rule#evaluate` is now a `Promise`, not a `Future`. It can still be awaited the same way, but that may break some chaining; see the `alfa-future` changelog for migration hints.

Oracles now return a `Promise` instead of a `Future`; most notably, oracles builders will now have to use `Promise.resolve(result)` instead of `Future.now(result)`.

Upon evaluating several rules (atomic rules in a composite, or doing a full audit), the rules are now evaluated concurently instead of sequentially (using `Promise.all` instead of `Future.traverse`). This means that there is no guarantee in the evaluation order anymore, or in the emitting order of performance events which may be interleaved between rules.

This also fixes an issue where outcomes of rules that are evaluated several times in a given audit (typically, atomic rules shared between composite one) were sometimes duplicated.
