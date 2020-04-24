import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import {R2} from "../../src/rules";

import R21, { Outcomes } from "../../src/sia-r21/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluates() passes when element has correct explicit role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div role="button" tabIndex="0" onClick="console.log(event)" id="target">
        I react to clicks
      </div>
    ),
  ]);
  const target = document.resolveReferences("target").shift()!.attribute("role").get()!;

  t.deepEqual(await evaluate(R21, {document}), [
    passed(R21, target, {1: Outcomes.HasValidRole})
  ])
});

test("evaluates() passes when element has correct implicit role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <button role="btn" onClick="console.log(event)" id="target">
        I react to clicks
      </button>
    ),
  ]);
  const target = document.resolveReferences("target").shift()!.attribute("role").get()!;

  t.deepEqual(await evaluate(R21, {document}), [
    passed(R21, target, {1: Outcomes.HasValidRole})
  ])
});

test("evaluates() fails when element has no role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div role="btn" tabIndex="0" onClick="console.log(event)" id="target">
        I react to clicks
      </div>
    ),
  ]);
  const target = document.resolveReferences("target").shift()!.attribute("role").get()!;

  t.deepEqual(await evaluate(R21, {document}), [
    failed(R21, target, {1: Outcomes.HasNoValidRole})
  ])
});

test("evaluate() is inapplicable when there is no role attribute", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<button onClick="console.log(event)">I react to clicks</button>),
  ]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});

test("evaluate() is inapplicable on role attribute that are only whitespace", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<div role="   ">Foo</div>),
  ]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});
