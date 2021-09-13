import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import R41, { Outcomes } from "../../src/sia-r49/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed } from "../common/outcome";

test(`evaluate() passes an autoplaying <video> element that lasts more than 3
      seconds, has audio, and uses native audio controls`, async (t) => {
  const target = <video autoplay controls src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
      })
    ),
    [
      passed(R41, target, {
        1: Outcomes.HasPerceivablePauseMechanism("video"),
      }),
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
      R41,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      passed(R41, target, {
        1: Outcomes.HasPerceivablePauseMechanism("video"),
      }),
    ]
  );
});

test(`evaluate() fails an autoplaying <video> element that lasts more than 3
      seconds, has audio, and lacks audio controls`, async (t) => {
  const target = <video autoplay src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "audio-control-mechanism": None,
      })
    ),
    [
      failed(R41, target, {
        1: Outcomes.HasNoPauseMechanism("video"),
      }),
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
      R41,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      failed(R41, target, {
        1: Outcomes.HasNonPerceivablePauseMechanism("video"),
      }),
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
      R41,
      { document },
      oracle({
        "is-above-duration-threshold": true,
        "has-audio": true,
        "audio-control-mechanism": Option.of(controls),
      })
    ),
    [
      failed(R41, target, {
        1: Outcomes.HasNonPerceivablePauseMechanism("video"),
      }),
    ]
  );
});
