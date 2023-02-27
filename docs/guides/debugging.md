# Debugging Alfa results

Since Alfa is running deterministic analysis over static data (as per [ADR 2](../architecture/decisions/adr-002.md)), audits are usually fully replayable making it fairly easy to investigate the reason why a given outcome was produced.

## Install Alfa

Make sure that Alfa is installed. Follow the instructions from the [top-level README](../../README.md). Namely, clone the repository and run `yarn install` and `yarn build`.

## Fetching data

When a problem has been spotted in the Siteimprove Intelligence Platform, the best way is to retrieve the exact data for the page that was fed to Alfa. Check with the Accessibility backend team for ways to do that (this require access to Siteimprove internal systems).

In order to grab a snapshot of a live page, for example to investigate a result seen in the browser extension, … use the Command Line Interface with the `scrape` command:

```shell
$ yarn alfa scrape -o my-page.json https://example.com
```

> Remark: it is also possible to run a full audit directly with the CLI:
>
> ```shell
> $ yarn alfa audit -o json -f my-audit.json https://example.com
> ```
>
> however, the resulting file is monolithic and usually not easy to investigate, plus it can be a bit hard to follow the flow of a specific rule.

The JSON file resulting from the scrape (or retrieved from SI systems) contains the toplevel properties `request` (the HTTP request that was used to grab the page), `response` (the response sent by the service), `device` (the device used for the crawl) and `document` (the full document, in Alfa's serialised format, and that can be de-serialised by Alfa).

When scraping live page directly, especially when comparing with results produced earlier, be wary that the live page may have changed between both scraping. So differences in results may also come from differences in the actual content that is checked.

## Reproducing results

Once you have a page, you can load it into Alfa and re-run the audit. The usual case is to investigate the result of a given rule, which can for example be done with the following script:

```typescript
import { Outcome } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Rules } from "@siteimprove/alfa-rules";
import { Page } from "@siteimprove/alfa-web";
import * as fs from "fs";
import { evaluate } from "@siteimprove/alfa-rules/test/common/evaluate";

const rule = "R68";
const file = "./my-page.json";

const page = Page.from(JSON.parse(fs.readFileSync(file, "utf-8")));

main();

async function main() {
  const result = Array.from(await evaluate(Rules.get(rule).getUnsafe(), page));
  const cantTell = result.filter(
    (outcome) => outcome.outcome === Outcome.Value.CantTell
  );
  const passed = result.filter(
    (outcome) => outcome.outcome === Outcome.Value.Passed
  );
  const failed = result.filter(
    (outcome) => outcome.outcome === Outcome.Value.Failed
  );

  console.log(
    `cantTell: ${cantTell.length}, passed: ${passed.length}, failed: ${failed.length}`
  );

  console.dir(failed);
}
```

Save this in the `scratches` directory, for example as `page.ts` and then, from the top-level Alfa directory, run:

```shell
$ yarn build
$ node scratches/page.js
```

(the file is saved as `.ts`, but after building it is the `.js` that must be run)

The rule to check, and the file to load, are configured after the `import` block. The Alfa page is de-serialised from the JSON file. Then a simple audit of a given rule is run and simple statistics are shown, which allow to confirm that the numbers are the same…

## Time travel

Since we run into the Github repo, it is very easy to test with an older version of Alfa. As long as only the `scratches` directory has been changed, just `git checkout vX.Y.Z` will go back to any version (`yarn install` and `yarn build` need to be rerun). This makes it easy to check when a breaking change has been introduced. Be wary that by going back too far in time, the `scratches/page.ts` script itself might break if it's using more modern constructions…

## Finding an element

Often, the problem is present for one precise element on the page. The full document, in Alfa readable format, is contained in `page.document` in the script above, so we can use all the tools in Alfa to pick a given node. For example:

Getting the element with `id` `my-id`.

```typescript
import { Element } from "@siteimprove/alfa-dom";

const element = page.document
  // All nodes in the document.
  .descendants()
  // Discard the text nodes and attributes, keep the elements.
  .filter(Element.isElement)
  // Find the first element with the correct id.
  .find((elt) => elt.id.includes("my-id"))
  // Since we know it exists, we can safely unwrap the Option.
  .getUnsafe();
```

Getting the second `<button>` element with class `my-button`.

```typescript
import { Element } from "@siteimprove/alfa-dom";

const element = page.document
  // All nodes in the document.
  .descendants()
  // Discard the text nodes and attributes, keep the elements.
  .filter(Element.isElement)
  // Only keep the buttons
  .filter(Element.hasName("button"))
  // Only keep the ones with the wanted class
  .filter((elt) => elt.classes.includes("my-button"))
  // Take the second one
  .get(2)
  .getUnsafe();
```

Getting the first `<p>` element whose text starts with "Hello world".

```typescript
import { Element, Text } from "@siteimprove/alfa-dom";

const element = page.document
  // All nodes in the document.
  .descendants()
  // Keep the text nodes
  .filter(Text.isText)
  // Keep the ones which start with the wanted text
  .filter((text) => text.data.startsWith("Hello world"))
  // find their parents
  .map((text) => text.parent().getUnsafe())
  .filter(Element.isElement)
  // Only keep the `p` parents
  .find(Element.hasName("p"))
  .getUnsafe();
```

A good way to confirm which element you got is simply to show it:

```typescript
console.log(element.toString());
```

## Confirming target

To confirm that Alfa's result on the element you selected is the one observed, you must run the rule directly rather than with the `evaluate` helper. Note that this will only work if the element is applicable (i.e. Passed/Failed/CantTell results).

```typescript
async function main() {
  // Generate all outcomes for the rule
  const found = [...(await Rules.get(rule).getUnsafe().evaluate(page))]
    // Only keep the failed ones, use isPassed or isCantTell as needed
    .filter(Outcome.isFailed)
    // Only keep the targets
    .map((outcome) => outcome.target)
    // Check that the element is part of it
    .includes(element);
}
```

## Debugging

This is, of course, where things get tricky and less generic. A good way to get debug information is to add `console.log`/`console.dir` statements to the rule (or predicates used) itself and see what happen.

It is also possible to run the script in debug mode, with `node --inspect-brk scratches.page.js`. This is however not always easy to follow due to the numerous function calls performed by NodeJS and Alfa.

To add debug statements in the rule, you normally want to restrict them to the observed element, to limit noise:
* In the `page.ts` script, use `console.log(element.path())` and save that path somewhere.
* In the rule file (`packages/alfa-rules/src/sia-rXX/rule.ts`), add a top line with `/// <reference lib="dom" />` this enable console logging from this file.
* In the rule file, locate the `expectation(target)` function. At its start, add:
  ```typescript
  // Use the path found earlier
  const debug = target.path() === <path_found_earlier>
  const show = debug ? console.log : () => {}
  const showAll = debug ? console.dir : () => {}
  ```
  This enable `show` and `showAll` functions that will only trigger on the observed element.

From here, it is possible to observe the behaviour of the rule a bit more in details, again, the needed steps depend a lot on what is actuall the problem… Some generic tips:
* Most Alfa structures have a `.toJSON` method to serialise them in a human-readable way. Whenever you want to observe a thing, `showAll(thing.toJSON())` is usually your friend.
* Predicates have a `tee` function meant for observation (and other side effects). If you need to easilly see the result of a `isFoo` call, you can do:
  ```typescript
  const {tee} = Predicate;
  …
  tee(isFoo, (val, res) => show(`${val} is foo? ${res}`))
  ```
  This is particularly useful in long predicates combination, e.g. turning a `and(isFoo, isBar)` into `and(tee(isFoo, …), tee(isBar, …))` is often a nice and easy way to see the results of each predicate without much work.
* Other structures (notably collections), also have a `.tee` method that can be used the same way. Replacing a `foo.filter(isBar)` with `foo.tee(val => showAll(val.toJSON()).filter(isBar)` can help a lot.

## Focusing

Once the problem is a bit more focused, it is also possible to go directly into the suspected files. For example, if it seems that the `isVisible` predicate is giving the wrong result, it is possible to call it directly from `page.ts`, and edit it directly to add debug information on its components, …

It is also possible to investigate the structures built by Alfa, most notably style and accessibility tree:
```typescript
// Compute the style object. Note that this require a device,
// and we use the one from the initial request
const style = Style.from(element, page.device);
// Show the `line-heigt` property.
console.dir(style.comptued("line-height").toJSON());

import * as aria from "@siteimprove/alfa-aria";
// Build the node in the accessiblity tree
const ariaNode = aria.Node.from(element, page.device)
// And show it (role, accessible name, …)
console.dir(ariaNode.toJSON())
```

Note that many of the internal stuff is cached and pre-computed, which makes adding debug statement to it a bit more trickier than in the rules…
