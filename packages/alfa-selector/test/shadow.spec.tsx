import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { Compound, Context } from "../src";
import type { Host } from "../src/selector/simple/pseudo-class/host";
import type { HostContext } from "../src/selector/simple/pseudo-class/host-context";

import { Slotted } from "../src/selector/simple/pseudo-element/slotted";

import { parse } from "./parser";

test("#matches() never matches a :host or :host-context selector", (t) => {
  for (const target of [<p />, <div class="foo" />]) {
    for (const input of [
      ":host",
      ":host(p)",
      ":host(.foo)",
      ":host(div.foo)",
      ":host-context(p)",
      ":host-context(.foo)",
      ":host-context(div.foo)",
    ]) {
      const selector = parse(input);

      t.equal(selector.matches(target), false);
    }
  }
});

test("Host#matchHost() matches when the element matches", (t) => {
  const div = <div class="foo" />;

  for (const input of [":host", ":host(.foo)", ":host(div.foo)"]) {
    const selector = parse(input) as Host;

    t.equal(selector.matchHost(div), true);
  }

  for (const input of [":host(span)", ":host(div.bar)"]) {
    const selector = parse(input) as Host;

    t.equal(selector.matchHost(div), false);
  }
});

test("HostContext#matchHost() matches when one shadow including ancestor matches", (t) => {
  const target = <div class="foo" />;
  h.document([
    <body>
      <div class="main">{h.shadow([<p>{target}</p>])}</div>
    </body>,
  ]);

  for (const input of [
    ":host-context(.foo)",
    ":host-context(p)",
    ":host-context(.main)",
    ":host-context(body)",
  ]) {
    const selector = parse(input) as HostContext;

    t.equal(selector.matchHost(target), true);
  }
});

test("Complex :host(-context) selector match elements in the shadow tree", (t) => {
  const inner = <i>world</i>;
  const target = <b>Hello {inner}</b>;
  <body>
    <div>{h.shadow([target])}</div>
  </body>;

  t.equal(parse(":host > b").matches(target), true);
  t.equal(parse(":host > i").matches(inner), false);
  t.equal(parse(":host i").matches(inner), true);
  t.equal(parse(":host(div) > b").matches(target), true);
  t.equal(parse(":host > b.foo").matches(target), false);

  t.equal(parse(":host-context(body) > b").matches(target), true);
  t.equal(parse(":host-context(body) > i").matches(inner), false);
  t.equal(parse(":host-context(body) i").matches(inner), true);

  t.equal(parse("body > :host > b").matches(target), false);
});

test("#matches() never matches a ::slotted selector", (t) => {
  for (const target of [<p />, <div class="foo" />]) {
    for (const input of [
      "::slotted(p)",
      "::slotted(.foo)",
      "::slotted(div.foo)",
    ]) {
      const selector = parse(input);

      t.equal(selector.matches(target), false);
    }
  }
});

test("Isolated Slotted.matchSlotted() matches when the element is slotted and matches", (t) => {
  const target = <div class="foo" />;

  // The target hasn't been slotted, so it won't match
  for (const input of ["::slotted(.foo)", "::slotted(div.foo)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Slotted.matchSlotted(target, selector), false);
  }

  // Slotting the target.
  <div>
    {h.shadow([<slot>Fallback</slot>])}
    {target}
  </div>;

  // Now, the target is slotted and matches these.
  for (const input of ["::slotted(.foo)", "::slotted(div.foo)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Slotted.matchSlotted(target, selector), true);
  }

  // But it still doesn't match these.
  for (const input of ["::slotted(span)", "::slotted(div.bar)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Slotted.matchSlotted(target, selector), false);
  }
});

test("Compound Slotted.matchSlotted() matches when both slot and element match", (t) => {
  const target = <div class="foo" />;
  <div>
    {h.shadow([<slot class="the-slot">Fallback</slot>])}
    {target}
  </div>;

  for (const input of ["slot::slotted(.foo)", ".the-slot::slotted(div.foo)"]) {
    const selector = parse(input) as Compound;

    t.equal(Slotted.matchSlotted(target, selector), true);
  }
});

test("Compound Slotted.matchSlotted() matches with qualifier and context", (t) => {
  const target = <div class="foo" />;
  <div>
    {h.shadow([<slot class="the-slot">Fallback</slot>])}
    {target}
  </div>;

  const selector = parse(".the-slot::slotted(div.foo):hover") as Compound;
  t.equal(Slotted.matchSlotted(target, selector), false);
  t.equal(Slotted.matchSlotted(target, selector, Context.hover(target)), true);
});

// test("Complex selector with a rightmost ::slotted match according to shadow tree structure", (t) => {
//   const inner = <i>light</i>;
//   const target = <span slot="foo">from the {inner}</span>;
//   <div>
//     <div>
//       {h.shadow([
//         <b id="my-elt">
//           Hello <slot name="foo">from the shadow</slot>
//         </b>,
//       ])}
//       {target}
//     </div>
//   </div>;
//
//   // The <span> is slotted as (flat tree) child of the <b>.
//   t.equal(parse("b > ::slotted(span)").matches(target), true);
//   // The non-slotted <span> has no <b> parent.
//   t.equal(parse("b > span").matches(target), false);
//   // After the ::slotted tree structure match, the rest of the structure stays in its tree
//   // and the <b> is not a descendant of the host nor its ancestors in the light tree.
//   t.equal(parse("div b > ::slotted(span)").matches(target), false);
//
//   // This should not match. Only the actual slotted element can be reached in the light tree.
//   // Check comment on Complex#matches for more info.
//   t.equal(parse("b > ::slotted(span) i").matches(inner), true);
// });
