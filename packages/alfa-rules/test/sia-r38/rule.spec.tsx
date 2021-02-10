import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";

import R38, { Outcomes } from "../../src/sia-r38/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, cantTell } from "../common/outcome";

test("evaluate() passes when some atomic rules are passing", async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <track kind="descriptions" src="foo.vtt" />
    </video>
  );

  const document = Document.of([target]);

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
      passed(R38, target, {
        1: Outcomes.HasAlternative,
      }),
    ]
  );
});

test("evaluate() can't tell when there are not enough answers to expectation", async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <track kind="descriptions" src="foo.vtt" />
    </video>
  );

  const document = Document.of([target]);

  t.deepEqual(
    await evaluate(
      R38,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
      })
    ),
    [cantTell(R38, target)]
  );
});
