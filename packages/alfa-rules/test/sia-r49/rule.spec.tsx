import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import R49, { Outcomes } from "../../src/sia-r49/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an autoplaying <video> element that lasts more than 3
      seconds, has audio, and uses native audio controls`, async (t) => {
  const target = <video autoplay controls src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
      })
    ),
    [
      passed(
        R49,
        target,
        {
          1: Outcomes.HasPerceivablePauseMechanism("video"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() passes an autoplaying <video> element that lasts more than 3
      seconds, has audio, and uses custom audio controls`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      passed(
        R49,
        target,
        {
          1: Outcomes.HasPerceivablePauseMechanism("video"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails an autoplaying <video> element that lasts more than 3
      seconds, has audio, and lacks audio controls`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        "audio-control-mechanism": None,
      })
    ),
    [
      failed(
        R49,
        target,
        {
          1: Outcomes.HasNoPauseMechanism("video"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails an autoplaying <video> element that lasts more than 3
      seconds, has audio, and has audio controls that aren't perceivable`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button hidden>Toggle audio</button>;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      failed(
        R49,
        target,
        {
          1: Outcomes.HasNonPerceivablePauseMechanism("video"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails an autoplaying <video> element that lasts more than 3
      seconds, has audio, and has audio controls with no accessible name`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({
        "has-audio": true,
        "is-above-duration-threshold": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      failed(
        R49,
        target,
        {
          1: Outcomes.HasNonPerceivablePauseMechanism("video"),
        },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() can't tell when questions are left unanswered", async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({ "has-audio": true, "is-above-duration-threshold": true })
    ),
    [cantTell(R49, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable when Applicability questions are left unanswered", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(await evaluate(R49, { document }), [inapplicable(R49)]);
});

test("evaluate() is inapplicable to short videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(
      R49,
      { document },
      oracle({ "has-audio": true, "is-above-duration-threshold": false })
    ),
    [inapplicable(R49, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable to audio-less videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(R49, { document }, oracle({ "has-audio": false })),
    [inapplicable(R49, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable to videos that don't autoplay", async (t) => {
  const target = <video src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R49, { document }), [inapplicable(R49)]);
});

test("evaluate() is inapplicable to paused videos", async (t) => {
  const target = <video autoplay paused src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R49, { document }), [inapplicable(R49)]);
});

test("evaluate() is inapplicable to muted videos", async (t) => {
  const target = <video autoplay muted src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(await evaluate(R49, { document }), [inapplicable(R49)]);
});
