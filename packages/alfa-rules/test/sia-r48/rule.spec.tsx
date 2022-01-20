import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R48, { Outcomes } from "../../src/sia-r48/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes videos with less than 3 second of audio", async (t) => {
  const target = <video autoplay controls src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "is-below-audio-duration-threshold": true,
      })
    ),
    [
      passed(R48, target, {
        1: Outcomes.DurationBelowThreshold("video"),
      }),
    ]
  );
});

test("evaluate() fails videos with more than 3 second of audio", async (t) => {
  const target = <video autoplay controls src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "is-below-audio-duration-threshold": false,
      })
    ),
    [
      failed(R48, target, {
        1: Outcomes.DurationAboveThreshold("video"),
      }),
    ]
  );
});

test("evaluate() can't tell when questions are left unanswered", async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": true, "has-audio": true })
    ),
    [cantTell(R48, target)]
  );
});

test("evaluate() is inapplicable when Applicability questions are left unanswered", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(await evaluate(R48, { document }), [inapplicable(R48)]);
});

test("evaluate() is inapplicable to short videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": false })
    ),
    [inapplicable(R48)]
  );
});

test("evaluate() is inapplicable to audio-less videos", async (t) => {
  const document = h.document([<video autoplay src="foo.mp4" />]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": true, "has-audio": false })
    ),
    [inapplicable(R48)]
  );
});

test("evaluate() is inapplicable to videos that don't autoplay", async (t) => {
  const target = <video src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": true, "has-audio": true })
    ),
    [inapplicable(R48)]
  );
});

test("evaluate() is inapplicable to paused videos", async (t) => {
  const target = <video autoplay paused src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": true, "has-audio": true })
    ),
    [inapplicable(R48)]
  );
});

test("evaluate() is inapplicable to muted videos", async (t) => {
  const target = <video autoplay muted src="foo.mp4" />;

  const controls = <button />;

  const document = h.document([target, controls]);

  t.deepEqual(
    await evaluate(
      R48,
      { document },
      oracle({ "is-above-duration-threshold": true, "has-audio": true })
    ),
    [inapplicable(R48)]
  );
});
