import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Outcome } from "@siteimprove/alfa-act";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Record } from "@siteimprove/alfa-record";
import { Err, Ok } from "@siteimprove/alfa-result";

import R1 from "../../src/sia-r1/rule";

import { evaluate } from "../common/evaluate";

test("evaluate() passes a document with a non-empty <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(
      <html>
        <head>
          <title>Hello world</title>
        </head>
      </html>,
      Option.of(self)
    )
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    Outcome.Passed.of(
      R1,
      document,
      Record.from([
        ["1", Ok.of("The document has at least one <title> element")],
        ["2", Ok.of("The first <title> element has text content")]
      ])
    )
  ]);
});

test("evaluate() fails a document without a <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(<html></html>, Option.of(self))
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    Outcome.Failed.of(
      R1,
      document,
      Record.from([
        ["1", Err.of("The document does not have a <title> element")],
        ["2", Err.of("The first <title> element has no text content")]
      ])
    )
  ]);
});

test("evaluate() fails a document with an empty <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(
      <html>
        <head>
          <title></title>
        </head>
      </html>,
      Option.of(self)
    )
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    Outcome.Failed.of(
      R1,
      document,
      Record.from([
        ["1", Ok.of("The document has at least one <title> element")],
        ["2", Err.of("The first <title> element has no text content")]
      ])
    )
  ]);
});
