import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { Compound, Selector } from "../src";
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

test("Isolated Selector.matchSlotted() matches when the element is slotted and matches", (t) => {
  const target = <div class="foo" />;

  // The target hasn't been slotted, so it won't match
  for (const input of ["::slotted(.foo)", "::slotted(div.foo)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Selector.matchSlotted(target, selector), false);
  }

  // Slotting the target.
  h.element("div", [], [h.shadow([<slot>Fallback</slot>]), target]);

  // Now, the target is slotted and matches these.
  for (const input of ["::slotted(.foo)", "::slotted(div.foo)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Selector.matchSlotted(target, selector), true);
  }

  // But it still doesn't match these.
  for (const input of ["::slotted(span)", "::slotted(div.bar)"]) {
    const selector = parse(input) as Slotted;

    t.equal(Selector.matchSlotted(target, selector), false);
  }
});

test("Compound Selector.matchSlotted() matches when both slot and element match", (t) => {
  const target = <div class="foo" />;
  h.element(
    "div",
    [],
    [h.shadow([<slot class="the-slot">Fallback</slot>]), target],
  );

  for (const input of ["slot::slotted(.foo)", ".the-slot::slotted(div.foo)"]) {
    const selector = parse(input) as Compound;

    t.equal(Selector.matchSlotted(target, selector), true);
  }
});
