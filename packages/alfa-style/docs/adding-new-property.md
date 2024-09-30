# Adding a new style property

## Research

Look for the definition of the CSS property. MDN is usually a good source with the correct mix of "not too technical but still technical enough". And it has links to the CSS specifications for those cases where the technical details are needed.

* Is it a longhand, or a shorthand that will require several longhands to be implemented?
* What is the Specified type? It is based on types we already support in [the `alfa-css` package](../../alfa-css/src/value) (normally, yes)? Will it require a new CSS value to "glue" bits together (e.g. a CSS shadow is not just a collection of numbers, they do have meaning together and therefore a `Shadow` value makes sense).
* Are numbers involved? If yes, calculations will need to be supported, making things a bit more tricky sometimes.
* Is the grammar simple or does it feel like there will be parsing difficulties?
* Is the computed value straightforward from the specified one?
* Is the property inherited?

## Initial chores

> **Note:** These may actually be done upon need while implementing in order to keep the repository in a buildable state during the process.

* Add a file to [`src/property`](../src/property) with the name of the property (e.g. `background-color.ts`).
* Add the file to the [`src/tsconfig.json`](../src/tsconfig.json) under `files`.
* Add the property in the [list of longhands](../src/longhands.ts) or [shorthands](../src/shorthands.ts) as appropriate.
* Add a test file to [`tests/property`](../tests/property) with the name of the property (e.g. `background-color.spec.tsx`). It is usually better as a `.tsx` file since JSX will make tests easier to write; the `.spec` bit is what triggers the test scripts.
* Add the test file to the [`test/tsconfig.json`](../tests/tsconfig.json) under `files`.

## Implementing the property

* Implement the property in the [`src/property`](../src/property) file. Take inspiration from other properties. You will mostly need to provide a parser for the specified values, and a `compute` function.
* Alfa comes with a lot of parsers combinators making that task easier; see [writing a parser](../../../docs/guides/writing-a-parser.md) and [the `alfa-parser` package](../../alfa-parser).
* **chore:** for consistency, explicitly define a `Specified` and `Computed` types (unless you just extend from another property).
* **chore:** Add a TSdoc comment; usually just a `{@link}` to the MDN page.

Some examples:
* [`flex-direction`](../src/property/flex-direction.ts), a very simple keyword-only property.
* [`right`](../src/property/right.ts), a property that simply extends (copies) another property.
* [`border-top-left-radius`](../src/property/border-top-left-radius.ts), a property taking a `Length` and thus needing a way to resolve relative units (`em`, `vh`, …)
* [`text-shadow`](../src/property/text-shadow.ts), a property whose value is simply delegated to the `alfa-css` package as it makes sense to wrap the components together.
* [`height`](../src/property/height.ts), a property where the percentage cannot be fully resolved at compute time and thus needs a partial resolution.
* [`font-size`](../src/property/font-size.ts), a property mixing keywords and `Length`, and where keywords end up computing as `Length` values.
* [`border-top`](../src/property/border-top.ts), a relatively simple shorthand property that needs to be split into its longhands. Shorthands usually allow random ordering and optional presence, something for which we do not have a parser combinator yet.

Note that most of the properties use the monadic `Selective` type, which more or less mimic the complex pattern matching of functional languages. Regular `if … then … else` statements work too (but tend to be more verbose). Also prefer using the `.isFoo` type guards as much as possible (versus, e.g. `instanceof` or testing the `#type` getter). The type guards will correctly narrow types and are agnostic to implementation details.

## Testing the property

* Add some tests. The package comes with helpers to get the cascaded or computed values. See what other properties are doing. As usual, no need to deeply test a simple "keywords only" property, but test complex computations or parsers…

Note that if the test rely on the User-Agent style sheet (e.g., on the fact that `<div>` have default `display: block` while `<span>` have `display: inline`), it must be loaded by wrapping the test target in a `Document` (usually using the `h.document` function). `Document` are also the way to include other style sheet (i.e. CSS rules out of the `style` attribute) which comes very handy for the complex tests. 

## Final chores

* [Add a changeset](../../../docs/guides/changeset.md). It probably only need a title looking like `**Added:** CSS property foo is now supported.`; the `**Added:**` bit is important as it will be parsed for sorting the changelog. The change is likely a minor one since it adds stuff in a backward-compatible way.
* Extract documentation by running `yarn extract packages/alfa-style` and commit the resulting change; if you forget to do it, it can also be done from the Pull Request by commenting `!pr extract`.
* Commit, Push, and open a Pull Request.
* Add the corresponding labels to the Pull Request (normally `Language Support` and `Minor`), add the PR to the Alfa project board, and assign it to yourself.

PR review will automatically be requested from code owners. It is also possible to create a "draft PR" first, which will **not** request review until moved out of draft. This can be useful if this is still work in progress and you don't want to "spam" code owners.