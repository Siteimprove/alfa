import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R50, { Outcomes } from "../../src/sia-r50/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when R48 passes`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        // R48
        "is-below-audio-duration-threshold": true,
      })
    ),
    [passed(R50, target, { 1: Outcomes.AutoplayGood }, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() passes when R49 passes`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        // R49
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [passed(R50, target, { 1: Outcomes.AutoplayGood }, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() fails when all input rules fail`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        // R48
        "is-below-audio-duration-threshold": false,
        // R49
        "audio-control-mechanism": None,
      })
    ),
    [failed(R50, target, { 1: Outcomes.AutoplayBad }, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() cannot tell if no input rule can tell`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({ "has-audio": true, "is-above-duration-threshold": true })
    ),
    [cantTell(R50, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test(`evaluate() cannot tell when some input rule cannot tell and no input rule passes`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        // R48
        "is-below-audio-duration-threshold": false,
        // R49
      })
    ),
    [cantTell(R50, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable when Applicability questions are left unanswered", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(await evaluate(R50, { document }), [inapplicable(R50)]);
});

test("evaluate() is inapplicable to short videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(
      R50,
      { document },
      oracle({ "has-audio": true, "is-above-duration-threshold": false })
    ),
    [inapplicable(R50, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable to audio-less videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(R50, { document }, oracle({ "has-audio": false })),
    [inapplicable(R50, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable to videos that don't autoplay", async (t) => {
  const target = <video src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R50, { document }), [inapplicable(R50)]);
});

test("evaluate() is inapplicable to paused videos", async (t) => {
  const target = <video autoplay paused src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R50, { document }), [inapplicable(R50)]);
});

test("evaluate() is inapplicable to muted videos", async (t) => {
  const target = <video autoplay muted src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R50, { document }), [inapplicable(R50)]);
});
