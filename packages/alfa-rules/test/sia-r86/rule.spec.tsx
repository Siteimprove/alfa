import { Device } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R86, { Outcomes } from "../../src/sia-r86/rule";

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
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <img id="empty-alt" src="foo.jpg" alt="" />
        <img id="role-none" src="foo.jpg" role="none" />
        <img id="role-presentation" src="foo.jpg" role="presentation" />
        <svg id="svg" role="none">
          <circle cx="50" cy="50" r="40" fill="yellow"></circle>
        </svg>
        <img id="aria-hidden" src="foo.jpg" role="none" aria-hidden="true" />
        <div aria-hidden="true">
          <img id="aria-hidden-inherit" src="foo.jpg" role="none" />
        </div>
        <nav id="nav" role="none">
          <a href="https://sitemprove.com/" aria-label="Siteimprove">
            Siteimprove
          </a>
        </nav>
        <button id="button" role="presentation" disabled>
          Click me!
        </button>
        <input id="hidden-lowercase" type="hidden" role="none" />
        <input id="hidden-uppercase" type="HIDDEN" role="none" />
      </html>,
      Option.of(self)
    ),
  ]);
  const getById = getElementById(document);
  const emptyAlt = getById("empty-alt");
  const roleNone = getById("role-none");
  const rolePresentation = getById("role-presentation");
  const svg = getById("svg");
  const ariaHidden = getById("aria-hidden");
  const ariaHiddenInherit = getById("aria-hidden-inherit");
  const nav = getById("nav");
  const button = getById("button");
  const hiddenLowercase = getById("hidden-lowercase");
  const hiddenUppercase = getById("hidden-uppercase");

  t.deepEqual(await evaluate(R86, { device, document }), [
    passed(R86, emptyAlt, { 1: Outcomes.IsNotExposed }),
    passed(R86, roleNone, { 1: Outcomes.IsNotExposed }),
    passed(R86, rolePresentation, { 1: Outcomes.IsNotExposed }),
    passed(R86, svg, { 1: Outcomes.IsNotExposed }),
    passed(R86, ariaHidden, { 1: Outcomes.IsNotExposed }),
    passed(R86, ariaHiddenInherit, { 1: Outcomes.IsNotExposed }),
    passed(R86, nav, { 1: Outcomes.IsNotExposed }),
    passed(R86, button, { 1: Outcomes.IsNotExposed }),
    passed(R86, hiddenLowercase, { 1: Outcomes.IsNotExposed }),
    passed(R86, hiddenUppercase, { 1: Outcomes.IsNotExposed }),
  ]);
});

test("evaluate() fails on elements marked as decorative but exposed", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <span id="label">Foo</span>
        <img id="empty-alt-aria-label" src="foo.jpg" alt="" aria-label="Foo" />
        <img
          id="role-none-aria-labelledby"
          src="foo.jpg"
          role="none"
          aria-labelledby="label"
        />
        <nav id="nav" role="none" aria-label="global">
          <a href="https://siteimprove.com/" aria-label="Siteimprove">
            Siteimprove
          </a>
        </nav>
        <button id="button" role="presentation">
          Click me!
        </button>
      </html>,
      Option.of(self)
    ),
  ]);
  const getById = getElementById(document);
  const emptyAltAriaLabel = getById("empty-alt-aria-label");
  const roleNoneAriaLabelledby = getById("role-none-aria-labelledby");
  const nav = getById("nav");
  const button = getById("button");

  t.deepEqual(await evaluate(R86, { device, document }), [
    failed(R86, emptyAltAriaLabel, { 1: Outcomes.IsExposed }),
    failed(R86, roleNoneAriaLabelledby, { 1: Outcomes.IsExposed }),
    failed(R86, nav, { 1: Outcomes.IsExposed }),
    failed(R86, button, { 1: Outcomes.IsExposed }),
  ]);
});

test("evaluate() is inapplicabale on elements which are not marked as decorative", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <img src="foo.jpg" alt="foo" />
        <img src="foo.jpg" />
        <img src="foo.jpg" />
        <svg>
          <circle cx="50" cy="50" r="40" fill="yellow"></circle>
        </svg>
        <button>Click me!</button>
      </html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R86, { device, document }), [inapplicable(R86)]);
});
