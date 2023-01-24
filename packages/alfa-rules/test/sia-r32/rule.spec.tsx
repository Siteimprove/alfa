import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R32, { Outcomes } from "../../src/sia-r32/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes a video with a descriptive audio track`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R32,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "has-audio-track": true,
      })
    ),
    [
      passed(
        R32,
        target,
        { 1: Outcomes.HasDescriptiveAudio },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails a video without descriptive audio track`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R32,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "has-audio-track": false,
      })
    ),
    [
      failed(
        R32,
        target,
        { 1: Outcomes.HasNoDescriptiveAudio },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R32,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [cantTell(R32, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R32, { document }), [inapplicable(R32)]);
});

test(`evaluate() is inapplicable to videos with audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R32,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [inapplicable(R32, Outcome.Mode.SemiAuto)]
  );
});
