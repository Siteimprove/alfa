import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R23 from "../../src/sia-r23/rule";
import { Outcomes } from "../../src/common/expectation/media-transcript";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";
import { oracle } from "../common/oracle";

test(`evaluate() passes an audio with perceivable transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = <div>Hello</div>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: Option.of(transcript),
      })
    ),
    [passed(R23, target, { 1: Outcomes.HasPerceivableTranscript("<audio>") })]
  );
});

test(`evaluate() passes an audio with a link to a transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = <a href="transcript.html">Read transcript</a>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: None,
        "transcript-link": Option.of(transcript),
        "transcript-perceivable": true,
      })
    ),
    [passed(R23, target, { 1: Outcomes.HasPerceivableTranscript("<audio>") })]
  );
});

test(`evaluate() fails an audio with no transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: None,
        "transcript-link": None,
      })
    ),
    [failed(R23, target, { 1: Outcomes.HasNoTranscriptLink("<audio>") })]
  );
});

test(`evaluates() fails an audio with non-perceivable transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = <div style={{ visibility: "hidden" }}>Hello</div>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: Option.of(transcript),
      })
    ),
    [
      failed(R23, target, {
        1: Outcomes.HasNonPerceivableTranscript("<audio>"),
      }),
    ]
  );
});

test(`evaluate fails an audio with link to non-perceivable transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = <a href="transcript.html">Read transcript</a>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: None,
        "transcript-link": Option.of(transcript),
        "transcript-perceivable": false,
      })
    ),
    [
      failed(R23, target, {
        1: Outcomes.HasNonPerceivableTranscript("<audio>"),
      }),
    ]
  );
});

test(`evaluate fails an audio with non-perceivable link to transcript`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const transcript = (
    <a href="transcript.html" style={{ visibility: "hidden" }}>
      Read transcript
    </a>
  );

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        transcript: None,
        "transcript-link": Option.of(transcript),
      })
    ),
    [
      failed(R23, target, {
        1: Outcomes.HasNonPerceivableLink("<audio>"),
      }),
    ]
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({ "is-audio-streaming": false, "is-playing": true })
    ),
    [cantTell(R23, target)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R23, { document }), [inapplicable(R23)]);
});

test(`evaluate() is inapplicable to streaming audios`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(R23, { document }, oracle({ "is-audio-streaming": true })),
    [inapplicable(R23)]
  );
});
