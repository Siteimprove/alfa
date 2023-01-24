import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Option, None } from "@siteimprove/alfa-option";

import R33 from "../../src/sia-r33/rule";
import { Outcomes } from "../../src/common/expectation/media-transcript";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

test(`evaluate() passes when non-streaming video-only elements have all visual information available in a transcript`, async (t) => {
  const target = <video src="foo.mp4" type="video/mp4" />;

  const transcript = <span id="transcript">Transcript</span>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R33,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        transcript: Option.of(transcript),
      })
    ),
    [
      passed(
        R33,
        target,
        { 1: Outcomes.HasPerceivableTranscript("<video>") },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test(`evaluate() fails when non-streaming video-only elements have no visual information available in a transcript`, async (t) => {
  const target = <video src="foo.mp4" type="video/mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R33,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        transcript: None,
        "transcript-link": None,
      })
    ),
    [
      failed(
        R33,
        target,
        { 1: Outcomes.HasNoTranscriptLink("<video>") },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() can't tell when some questions are left unanswered", async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R33,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        transcript: None,
      })
    ),
    [cantTell(R33, target, undefined, Outcome.Mode.SemiAuto)]
  );
});

test("evaluate() is inapplicable to a document without <video> elements", async (t) => {
  const document = h.document([<img src="foo.mp4" />]);

  t.deepEqual(await evaluate(R33, { document }), [inapplicable(R33)]);
});

test("evaluate() is inapplicable when applicability questions are unanswered", async (t) => {
  const document = h.document([
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>,
  ]);

  t.deepEqual(await evaluate(R33, { document }), [inapplicable(R33)]);
});

test("evaluate() is inapplicable to videos with audio", async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R33,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [inapplicable(R33, Outcome.Mode.SemiAuto)]
  );
});
