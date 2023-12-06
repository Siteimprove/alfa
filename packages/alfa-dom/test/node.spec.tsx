import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { h } from "../h";
import { Namespace, Node } from "../src";

test("#tabOrder() returns the tab order of a node", (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {a}
      {b}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test("#tabOrder() correctly handles explicitly ordered tab indices", (t) => {
  const a = <button tabindex="2" />;
  const b = <button tabindex="1" />;
  const c = <button />;

  const div = (
    <div>
      {a}
      {b}
      {c}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a, c]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements before
      the shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([<slot />, b])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [a, b]);
});

test(`#tabOrder() correctly handles shadow roots with slotted elements after the
      shadow contents`, (t) => {
  const a = <button />;
  const b = <button />;

  const div = (
    <div>
      {h.shadow([b, <slot />])}
      {a}
    </div>
  );

  t.deepEqual([...div.tabOrder()], [b, a]);
});

test(`Node.clone() creates new instance with same value`, (t) => {
  const device = Device.standard();
  const doc = h.document(
    [
      h.element(
        "p",
        [h.attribute("title", "foo")],
        [h.text("hello")],
        [],
        Namespace.HTML,
        Rectangle.of(1, 2, 3, 4),
        device,
      ),
    ],
    [h.sheet([h.rule.style("p", { background: "green" })])],
    "bar",
    { extraStuff: "baz" },
  );

  const clonedDoc = Node.clone(doc);

  t.deepEqual(clonedDoc.toJSON(), doc.toJSON());
});

test(`Node.clone() correctly replaces elements based on predicate`, (t) => {
  const foo = <div externalId="foo">Foo</div>;
  const bar = <div externalId="bar">Bar</div>;

  const doc = h.document([foo, bar]);

  const newElements = [
    <p externalId="foo1">Foo1</p>,
    <span externalId="foo2">Foo2</span>,
  ];

  const cloned = Node.clone(doc, {
    predicate: (element) => element.externalId === "foo",
    newElements,
  });

  t.deepEqual(cloned.toJSON(), {
    style: [],
    type: "document",
    children: [...newElements.map((e) => e.toJSON()), bar.toJSON()],
  });
});
