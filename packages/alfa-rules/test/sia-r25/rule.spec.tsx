import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R25, { Outcomes } from "../../dist/sia-r25/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

test(`evaluate() passes video with descriptive audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R25,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "has-description": true,
      }),
    ),
    [
      passed(
        R25,
        target,
        { 1: Outcomes.HasInformativeAudio },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails video without descriptive audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R25,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "has-description": false,
      }),
    ),
    [
      failed(
        R25,
        target,
        { 1: Outcomes.HasNoInformativeAudio },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R25,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true }),
    ),
    [cantTell(R25, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R25, { document }), [inapplicable(R25)]);
});

test(`evaluate() is inapplicable to audio-less videos`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R25,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false }),
    ),
    [inapplicable(R25, Outcome.Mode.SemiAuto)],
  );
});
