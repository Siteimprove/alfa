import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Document, Element } from "@siteimprove/alfa-dom";

import R67, { Outcomes } from "../../src/sia-r67/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { hasId } = Element;

const device = Device.standard();

function getElementById(document: Document): (id: string) => Element {
  return (id) =>
    document
      .descendants()
      .find(and(Element.isElement, hasId(id)))
      .get();
}

test("evaluate() passes on elements marked as decorative and not exposed", async (t) => {
  const document = Document.of([
    <html>
      <img id="empty-alt" src="foo.jpg" alt="" />
      <img id="role-none" src="foo.jpg" role="none" />
      <img id="role-presentation" src="foo.jpg" role="presentation" />
      <svg xmlns={Namespace.SVG} id="svg" role="none">
        <circle
          xmlns={Namespace.SVG}
          cx="50"
          cy="50"
          r="40"
          fill="yellow"
        ></circle>
      </svg>
      <img id="aria-hidden" src="foo.jpg" role="none" aria-hidden="true" />
      <div aria-hidden="true">
        <img id="aria-hidden-inherit" src="foo.jpg" role="none" />
      </div>
    </html>,
  ]);
  const getById = getElementById(document);
  const emptyAlt = getById("empty-alt");
  const roleNone = getById("role-none");
  const rolePresentation = getById("role-presentation");
  const svg = getById("svg");
  const ariaHidden = getById("aria-hidden");
  const ariaHiddenInherit = getById("aria-hidden-inherit");

  t.deepEqual(await evaluate(R67, { device, document }), [
    passed(R67, emptyAlt, { 1: Outcomes.IsNotExposed }),
    passed(R67, roleNone, { 1: Outcomes.IsNotExposed }),
    passed(R67, rolePresentation, { 1: Outcomes.IsNotExposed }),
    passed(R67, svg, { 1: Outcomes.IsNotExposed }),
    passed(R67, ariaHidden, { 1: Outcomes.IsNotExposed }),
    passed(R67, ariaHiddenInherit, { 1: Outcomes.IsNotExposed }),
  ]);
});

test("evaluate() fails on elements marked as decorative but exposed", async (t) => {
  const document = Document.of([
    <html>
      <span id="label">Foo</span>
      <img id="empty-alt-aria-label" src="foo.jpg" alt="" aria-label="Foo" />
      <img
        id="role-none-aria-labelledby"
        src="foo.jpg"
        role="none"
        aria-labelledby="label"
      />
    </html>,
  ]);
  const getById = getElementById(document);
  const emptyAltAriaLabel = getById("empty-alt-aria-label");
  const roleNoneAriaLabelledby = getById("role-none-aria-labelledby");

  t.deepEqual(await evaluate(R67, { device, document }), [
    failed(R67, emptyAltAriaLabel, { 1: Outcomes.IsExposed }),
    failed(R67, roleNoneAriaLabelledby, { 1: Outcomes.IsExposed }),
  ]);
});

test("evaluate() is inapplicable on non-img/svg elements", async (t) => {
  const document = Document.of([
    <html>
      <math role="none"></math>
      <span role="none"></span>
      <iframe role="presentation"></iframe>
    </html>,
  ]);

  t.deepEqual(await evaluate(R67, { device, document }), [inapplicable(R67)]);
});

test("evaluate() is inapplicabale on elements which are not marked as decorative", async (t) => {
  const document = Document.of([
    <html>
      <img src="foo.jpg" alt="foo" />
      <img src="foo.jpg" />
      <img src="foo.jpg" />
      <svg>
        <circle cx="50" cy="50" r="40" fill="yellow"></circle>
      </svg>
    </html>,
  ]);

  t.deepEqual(await evaluate(R67, { device, document }), [inapplicable(R67)]);
});
