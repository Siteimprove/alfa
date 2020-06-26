import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Element, Document } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";

import { Style } from "../src/style";

test("#cascaded() returns the cascaded value of a property", (t) => {
  const element = Element.fromElement(<div style={{ color: "red" }}></div>);

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red"),
  });
});

test("#cascaded() correctly handles duplicate properties", (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div />],
      [
        h.sheet([
          h.rule.style("div", [
            h.declaration("color", "red"),
            h.declaration("color", "green"),
          ]),
        ]),
      ]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green"),
  });
});

test("#cascaded() returns the most specific property value", (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div class="foo" />],
      [
        h.sheet([
          h.rule.style("div.foo", { color: "green" }),
          h.rule.style("div", { color: "red" }),
        ]),
      ]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green"),
  });
});

test("#cascaded() correctly handles inline styles overriding the sheet", (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div style={{ color: "green" }} />],
      [h.sheet([h.rule.style("div", { color: "red" })])]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green"),
  });
});

test(`#cascaded() correctly handles an important declaration overriding inline
      styles`, (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div style={{ color: "green" }} />],
      [h.sheet([h.rule.style("div", { color: "red !important" })])]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("color", "red", true),
  });
});

test(`#cascaded() correctly handles important inline styles overriding an
      important declaration`, (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div style={{ color: "green !important" }} />],
      [h.sheet([h.rule.style("div", { color: "red !important" })])]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "green",
    },
    source: h.declaration("color", "green", true),
  });
});

test(`#cascaded() correctly handles a shorthand declaration overriding a
      longhand declaration`, (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div />],
      [
        h.sheet([
          h.rule.style("div", {
            overflowX: "visible",
            overflow: "hidden",
          }),
        ]),
      ]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "hidden",
    },
    source: h.declaration("overflow", "hidden"),
  });
});

test(`#cascaded() correctly handles a longhand declaration overriding a
      shorthand declaration`, (t) => {
  const document = Document.fromDocument(
    h.document(
      [<div />],
      [
        h.sheet([
          h.rule.style("div", {
            overflow: "hidden",
            overflowX: "visible",
          }),
        ]),
      ]
    )
  );

  const element = document.children().find(Element.isElement).get();

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("overflow-x").get().toJSON(), {
    value: {
      type: "keyword",
      value: "visible",
    },
    source: h.declaration("overflow-x", "visible"),
  });
});
