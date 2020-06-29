import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R83, { Outcomes } from "../../src/sia-r83/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isText } = Text;

test("evaluate() passes a text node that truncates overflow using ellipsis", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div
        style={{
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() passes a text node that hides overflow by wrapping text using
      the \`height\` property with a value that is equal to the value of the
      \`line-height\` property`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div style={{ overflow: "hidden", height: "1.5em", lineHeight: "1.5" }}>
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`white-space\` property`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`height\` property with a value that is greater than the value
      of the \`line-height\` property`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div style={{ overflow: "hidden", height: "1.5em", lineHeight: "1.2" }}>
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  const target = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test("evaluate() is inapplicable to a text node that is not visible", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div style={{ overflow: "hidden", whiteSpace: "nowrap" }} hidden>
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node that is excluded from the
      accessibility tree using the \`aria-hidden\` attribute`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div
        style={{ overflow: "hidden", whiteSpace: "nowrap" }}
        aria-hidden="true"
      >
        Hello world
      </div>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});
