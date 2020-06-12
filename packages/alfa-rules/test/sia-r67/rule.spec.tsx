import {Node} from "@siteimprove/alfa-aria";
import {Device} from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R67, { Outcomes } from "../../src/sia-r67/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { hasId } = Element;

const device = Device.standard();

function getElementById(document: Document): (id: string) => Element {
  return (id: string) =>
    document
      .descendants()
      .find(and(Element.isElement, hasId(id)))
      .get();
}

test("evaluate() passes on elements marked as decorative with no alternative text", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <img id="empty-alt" src="foo.jpg" alt="" />
        <video id="role-none" src="foo.mp4" role="none"/>
        <object id="role-presentation" src="foo.jpg" role="presentation" />
      </html>,
      Option.of(self)
    ),
  ]);
  const getById = getElementById(document);
  const emptyAlt = getById("empty-alt");
  const roleNone = getById("role-none");
  const rolePresentation = getById("role-presentation");

  t.deepEqual(await evaluate(R67, { device, document }), [
    passed(R67, emptyAlt, { 1: Outcomes.HasNoName }),
    passed(R67, roleNone, { 1: Outcomes.HasNoName }),
    passed(R67, rolePresentation, { 1: Outcomes.HasNoName }),
  ]);
});

test("evaluate() fails on elements marked as decorative with an alternative text", async t => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
      <span id="label">Foo</span>
      {/*NEED FIX <img id="empty-alt-aria-label" src="foo.jpg" alt="" aria-label="Foo"/>*/}
      <audio id="role-none-aria-labelledby" src="foo.mp3" role="none" aria-labelledby="label"/>
      </html>,
      Option.of(self)
    ),
  ]);
  const getById = getElementById(document);
  // const emptyAltAriaLabel = getById("empty-alt-aria-label");
  const roleNoneAriaLabelledby = getById("role-none-aria-labelledby");

  t.deepEqual(await evaluate(R67, { device, document }), [
    // failed(R67, emptyAltAriaLabel, { 1: Outcomes.HasName }),
    failed(R67, roleNoneAriaLabelledby, { 1: Outcomes.HasName }),
  ]);
});
