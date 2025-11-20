# Alfa Selector

Model and parse CSS selectors.

## Circularity problems

The main problem with CSS selectors is that they are somewhat circularly defined, mostly due to functional pseudo-classes. That is, even a simple selector can be a functional pseudo-class which can contain a list of complex selectors (e.g. `:is(div span, a:focus)`).

In order to avoid creating circular dependencies, we have some specific tricks not used elsewhere in Alfa:

Several subdirectories have a file of the same name defining the commonalities (classes, …), and an index re-exporting everything. For example, [`selector/pseudo/pseudo-element/pseudo-element.ts`](./src/selector/pseudo/pseudo-element/pseudo-element.ts) defines the common abstract classes used, [`after.ts`](./src/selector/pseudo/pseudo-element/after.ts), [`cue.ts`](./src/selector/pseudo/pseudo-element/cue.ts), … define the specific concrete classes for each of these selectors, and [`index.ts`](./src/selector/pseudo/pseudo-element/index.ts) groups everything (e.g., building the global pseudo-element parser) and re-exports for outside use.

Thus, when importing within this package, it is often better to import from the specific files instead of the index, to avoid circular dependencies. For example [`nth-child.ts`](./src/selector/pseudo/pseudo-class/nth-child.ts) imports `Universal` from [`simple/universal.ts`](./src/selector/simple/universal.ts) instead of from [`simple/index.ts`](./src/selector/simple/index.ts), because the latter (indirectly) imports from `nth-child.ts` (through `pseudo-class/index.ts`). Even if the circularity is OK in that case, it is better to avoid it altogether.

Similarly, the type guards (`isSimple`, …) defined as functions in their associated namespace as we usually do in Alfa cannot be used inside this package. Here also, `host.parser` needs to check that the argument is compound (not complex), but since a `:host` pseudo-class is also a compound selector, we'd create a circular dependency. Instead, inside this package, we check the `type` property. That is, in this package use `type === "…"` (or the `BaseSelector.hasFooType` helpers) to avoid circular dependencies, but outside of this package use `Simple.isSimple` as usual.

The parsers are facing the same circularity problems. While it would be possible to define all parsers in a single file as mutually recursive functions, this would both be impractically big, and have poor locality. Instead, most parsers take a parser continuation (with extra options) as a parameter, use it where needed, and forward it to sub-parsers.
