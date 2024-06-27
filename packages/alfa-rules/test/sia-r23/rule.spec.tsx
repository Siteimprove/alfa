import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R23 from "../../dist/sia-r23/rule.js";
import { Outcomes } from "../../dist/common/expectation/media-transcript.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable, cantTell } from "../common/outcome.js";
import { oracle } from "../common/oracle.js";

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
      }),
    ),
    [
      passed(
        R23,
        target,
        { 1: Outcomes.HasPerceivableTranscript("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() passes an audio with autoplay attribute and with perceivable transcript`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;
  const transcript = <div>Hello</div>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        transcript: Option.of(transcript),
      }),
    ),
    [
      passed(
        R23,
        target,
        { 1: Outcomes.HasPerceivableTranscript("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() passes a non-playing audio with controls attribute and with perceivable transcript`, async (t) => {
  const target = <audio src="foo.mp3" controls />;
  const transcript = <div>Hello</div>;

  const document = h.document([target, transcript]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
        transcript: Option.of(transcript),
      }),
    ),
    [
      passed(
        R23,
        target,
        { 1: Outcomes.HasPerceivableTranscript("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
      }),
    ),
    [
      passed(
        R23,
        target,
        { 1: Outcomes.HasPerceivableLink("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
      }),
    ),
    [
      failed(
        R23,
        target,
        { 1: Outcomes.HasNoTranscriptLink("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio with autoplay attribute and no transcript`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        transcript: None,
        "transcript-link": None,
      }),
    ),
    [
      failed(
        R23,
        target,
        { 1: Outcomes.HasNoTranscriptLink("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails a non-playing audio with controls attribute and no transcript`, async (t) => {
  const target = <audio src="foo.mp3" controls />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
        transcript: None,
        "transcript-link": None,
      }),
    ),
    [
      failed(
        R23,
        target,
        { 1: Outcomes.HasNoTranscriptLink("<audio>") },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
      }),
    ),
    [
      failed(
        R23,
        target,
        {
          1: Outcomes.HasNonPerceivableTranscript("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
      }),
    ),
    [
      passed(
        R23,
        target,
        {
          1: Outcomes.HasPerceivableLink("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
      }),
    ),
    [
      failed(
        R23,
        target,
        {
          1: Outcomes.HasNonPerceivableLink("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() cannot tell if questions are left unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({ "is-audio-streaming": false, "is-playing": true }),
    ),
    [cantTell(R23, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() cannot tell for audio with autoplay attribute and not answered expectation questions`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(R23, { document }, oracle({ "is-audio-streaming": false })),
    [cantTell(R23, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() cannot tell for non-playing audio with controls attribute and not answered expectation questions`, async (t) => {
  const target = <audio src="foo.mp3" controls />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R23,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
      }),
    ),
    [cantTell(R23, target, undefined, Outcome.Mode.SemiAuto)],
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
    [inapplicable(R23, Outcome.Mode.SemiAuto)],
  );
});
