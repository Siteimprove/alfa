import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { None } from "@siteimprove/alfa-option";

import R38, { Outcomes } from "../../dist/sia-r38/rule";

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

  const document = h.document([target]);

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
        "text-alternative": None,
        label: None,
        "track-describes-video": true,
      }),
    ),
    [
      passed(
        R38,
        target,
        {
          1: Outcomes.HasAlternative,
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell when there are not enough answers to expectation", async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <track kind="descriptions" src="foo.vtt" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R38,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
      }),
    ),
    [cantTell(R38, target, undefined, Outcome.Mode.SemiAuto)],
  );
});
