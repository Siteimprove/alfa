import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R68, { Outcomes } from "../../src/sia-r68/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes a list with two list items", async (t) => {
  const document = Document.of([
    <div role="list">
      <span role="listitem">Item 1</span>
      <span role="listitem">Item 2</span>
    </div>,
  ]);

  const list = document.descendants().filter(Element.isElement).first().get();

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, list, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() passes a list with a list item and a group of list items", async (t) => {
  const document = Document.of([
    <div role="list">
      <span role="listitem">Item 1</span>
      <div role="group">
        <span role="listitem">Item 2</span>
        <span role="listitem">Item 3</span>
      </div>
    </div>,
  ]);

  const list = document.descendants().filter(Element.isElement).first().get();

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, list, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() ignores non-element children when determining ownership", async (t) => {
  // Don't remove the spaces after some of the elements; they're the non-element
  // children!
  const document = Document.of([
    <div role="list">
      <span role="listitem">Item 1</span>{" "}
      <div role="group">
        <span role="listitem">Item 2</span>
        <span role="listitem">Item 3</span>{" "}
      </div>
    </div>,
  ]);

  const list = document.descendants().filter(Element.isElement).first().get();

  t.deepEqual(await evaluate(R68, { document }), [
    passed(R68, list, { 1: Outcomes.HasCorrectOwnedElements }),
  ]);
});

test("evaluate() fails a list with a non-list item", async (t) => {
  const document = Document.of([
    <div role="list">
      <span>Item 1</span>
    </div>,
  ]);

  const list = document.descendants().filter(Element.isElement).first().get();

  t.deepEqual(await evaluate(R68, { document }), [
    failed(R68, list, { 1: Outcomes.HasIncorrectOwnedElements }),
  ]);
});
