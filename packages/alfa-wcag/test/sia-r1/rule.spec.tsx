import { Aspects } from "@siteimprove/alfa-act";
import { Element, NodeType } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { SIA_R1 } from "../../src/sia-r1/rule";

const document = (nodes: Array<Element>): Aspects => ({
  request: {
    method: "GET",
    url: "https://foo.bar/baz.html",
    headers: {}
  },
  response: {
    status: 200,
    headers: {},
    body: ""
  },
  document: {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: nodes
  }
});

test("SIA-R1 is only applicable to documents", t => {
  const applicable = document([<html />]);
  const inapplicable = document([<svg />]);

  SIA_R1.definition(
    app => {
      t(app() !== null);
    },
    () => {},
    applicable
  );

  SIA_R1.definition(
    app => {
      t(app() === null);
    },
    () => {},
    inapplicable
  );
});

test("SIA-R1 expects a title", t => {
  const accepted = document([
    <html>
      <head>
        <title>Foo</title>
      </head>
    </html>
  ]);
  const unaccepted = document([
    <html>
      <head />
    </html>
  ]);
  const inapplicable = document([<svg />]);

  SIA_R1.definition(
    () => {},
    expectation => {
      expectation(
        accepted.document,
        (id: number, holds: boolean) => {
          t(holds);
        },
        () => true
      );
    },
    accepted
  );

  SIA_R1.definition(
    () => {},
    expectation => {
      expectation(
        unaccepted.document,
        (id: number, holds: boolean) => {
          t(!holds);
        },
        () => true
      );
    },
    unaccepted
  );

  SIA_R1.definition(
    () => {},
    expectation => {
      expectation(
        inapplicable.document,
        (id: number, holds: boolean) => {
          t(!holds);
        },
        () => true
      );
    },
    inapplicable
  );
});
