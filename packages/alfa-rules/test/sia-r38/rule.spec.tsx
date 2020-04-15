import { jsx } from "@siteimprove/alfa-dom/jsx";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { hasName } from "../../src/common/predicate/has-name";
const { and, equals } = Predicate;

import { evaluate } from "../common/evaluate";
import { makeOracle } from "../common/make-oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

import R38, { Outcomes } from "../../src/sia-r38/rule";

test("Passes when some atomic rules are passing", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div>
        <video controls>
          <source src="foo.mp4" type="video/mp4" />
          <track kind="descriptions" src="foo.vtt" />
        </video>
      </div>,
      Option.of(self)
    ),
  ]);

  const video = document
    .descendants()
    .filter(and(Element.isElement, hasName("video")))
    .first()
    .get();

  const oracle = makeOracle({
    "is-streaming": false,
    "has-audio": true,
    transcript: None,
    "transcript-link": None,
    "has-description": true,
    "text-alternative": false,
    label: false,
    "track-describes-video": true,
  });

  t.deepEqual(await evaluate(R38, { document }, oracle), [
    passed(R38, video, { 1: Outcomes.HasAlternative }),
  ]);
});

test("Can't tell when there are not enough answers to expectation", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div>
        <video controls>
          <source src="foo.mp4" type="video/mp4" />
          <track kind="descriptions" src="foo.vtt" />
        </video>
      </div>,
      Option.of(self)
    ),
  ]);

  const video = document
    .descendants()
    .filter(and(Element.isElement, hasName("video")))
    .first()
    .get();

  const oracle = makeOracle({ "is-streaming": false, "has-audio": true });

  t.deepEqual(await evaluate(R38, { document }, oracle), [
    cantTell(R38, video),
  ]);
});
