import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { h } from "../h";
import { Node } from "../src";

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
      <p title="foo" box={{ device, x: 1, y: 2, width: 3, height: 4 }}>
        hello
      </p>,
    ],
    [h.sheet([h.rule.style("p", { background: "green" })])],
    "bar",
    { extraStuff: "baz" },
  );

  const clonedDoc = Node.clone(doc);

  t.notEqual(clonedDoc, doc);

  t.deepEqual(clonedDoc.toJSON(), doc.toJSON());
});

test(`Node.clone() clones shadow`, (t) => {
  const div = <div>hello</div>;
  const shadow = h.shadow([<div>foo</div>]);

  div._attachShadow(shadow);

  const clonedDiv = Node.clone(div);

  t.notEqual(clonedDiv.shadow.getUnsafe(), shadow);

  t.deepEqual(
    div.shadow.getUnsafe().toJSON(),
    clonedDiv.shadow.getUnsafe().toJSON(),
  );
});

test(`Node.clone() clones content`, (t) => {
  const div = <div>hello</div>;
  const content = h.document([<div>foo</div>]);

  div._attachContent(content);

  const clonedDiv = Node.clone(div);

  t.notEqual(clonedDiv.content.getUnsafe(), content);

  t.deepEqual(div.toJSON(), clonedDiv.toJSON());
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
