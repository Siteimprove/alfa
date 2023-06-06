import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Outcomes } from "../../src/common/expectation/video-description-track-accurate";
import R36 from "../../src/sia-dr36/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes video with accurate descriptions track`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R36,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "track-describes-video": true,
      })
    ),
    [
      passed(
        R36,
        target,
        { 1: Outcomes.HasDescriptionTrack },
        Outcome.Mode.SemiAuto
      ),
    ]
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
      R36,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        "track-describes-video": false,
      })
    ),
    [
      failed(
        R36,
        target,
        { 1: Outcomes.HasNoDescriptionTrack },
        Outcome.Mode.SemiAuto
      ),
    ]
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
      R36,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [cantTell(R36, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R36, { document }), [inapplicable(R36)]);
});

test(`evaluate() is inapplicable to videos without audio`, async (t) => {
  const target = (
    <video src="foo.mp4">
      <track kind="descriptions" src="foo" />
    </video>
  );

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R36,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [inapplicable(R36, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() is inapplicable to videos without description track`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R36, { document }), [inapplicable(R36)]);
});
