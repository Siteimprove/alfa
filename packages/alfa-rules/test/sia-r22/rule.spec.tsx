import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R22, { Outcomes } from "../../src/sia-r22/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";
import { oracle } from "../common/oracle";

test(`evaluate() passes a video with captions`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R22,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "has-captions": true,
      })
    ),
    [passed(R22, target, { 1: Outcomes.HasCaptions }, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() fails a video without captions`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R22,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "has-captions": false,
      })
    ),
    [failed(R22, target, { 1: Outcomes.HasNoCaptions }, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R22,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [cantTell(R22, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R22, { document }), [inapplicable(R22)]);
});

test(`evaluate() is inapplicable to audio-less videos`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R22,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [inapplicable(R22, Outcome.Mode.SemiAuto)]
  );
});
