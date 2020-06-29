import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R38, { Outcomes } from "../../src/sia-r38/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, cantTell } from "../common/outcome";

const { isElement, hasName } = Element;
const { and } = Predicate;

test("evaluate() passes when some atomic rules are passing", async (t) => {
  const document = Document.of([
    <div>
      <video controls>
        <source src="foo.mp4" type="video/mp4" />
        <track kind="descriptions" src="foo.vtt" />
      </video>
    </div>,
  ]);

  const video = document
    .descendants()
    .find(and(isElement, hasName("video")))
    .get();

  t.deepEqual(
    await evaluate(
      R38,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: None,
        "transcript-link": None,
        "has-description": true,
        "text-alternative": false,
        label: false,
        "track-describes-video": true,
      })
    ),
    [
      passed(R38, video, {
        1: Outcomes.HasAlternative,
      }),
    ]
  );
});

test("evaluate() can't tell when there are not enough answers to expectation", async (t) => {
  const document = Document.of([
    <div>
      <video controls>
        <source src="foo.mp4" type="video/mp4" />
        <track kind="descriptions" src="foo.vtt" />
      </video>
    </div>,
  ]);

  const video = document
    .descendants()
    .find(and(isElement, hasName("video")))
    .get();

  t.deepEqual(
    await evaluate(
      R38,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
      })
    ),
    [cantTell(R38, video)]
  );
});
