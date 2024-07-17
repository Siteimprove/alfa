import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Outcomes } from "../../dist/common/expectation/video-description-track-accurate.js";
import R34 from "../../dist/sia-dr34/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

test(`evaluate() passes video with accurate descriptions track`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R34,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "track-describes-video": true,
      }),
    ),
    [
      passed(
        R34,
        target,
        { 1: Outcomes.HasDescriptionTrack },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails video with inaccurate descriptions track`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R34,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        "track-describes-video": false,
      }),
    ),
    [
      failed(
        R34,
        target,
        { 1: Outcomes.HasNoDescriptionTrack },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R34,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false }),
    ),
    [cantTell(R34, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R34, { document }), [inapplicable(R34)]);
});

test(`evaluate() is inapplicable to videos with audio`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R34,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true }),
    ),
    [inapplicable(R34, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() is inapplicable to videos without description track`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R34, { document }), [inapplicable(R34)]);
});
