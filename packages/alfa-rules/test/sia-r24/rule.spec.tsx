import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";

import R24, { Outcomes } from "../../src/sia-r24/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

test(`evaluate() passes when non-streaming video elements have all audio and
      visual information available in a transcript`, async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>
  );

  const transcript = <span id="transcript">Transcript</span>;

  const document = Document.of([target, transcript]);

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: Option.of(transcript),
      })
    ),
    [
      passed(R24, target, {
        1: Outcomes.HasTranscript,
      }),
    ]
  );
});

test(`evaluate() fails when non-streaming video elements have no audio and
      visual information available in a transcript`, async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>
  );

  const document = Document.of([target]);

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: None,
        "transcript-link": None,
      })
    ),
    [
      failed(R24, target, {
        1: Outcomes.HasNoTranscript,
      }),
    ]
  );
});

test("evaluate() can't tell when some questions are left unanswered", async (t) => {
  const target = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>
  );

  const document = Document.of([target]);

  t.deepEqual(
    await evaluate(
      R24,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        transcript: None,
      })
    ),
    [cantTell(R24, target)]
  );
});

test("evaluate() is inapplicable to a document without <video> elements", async (t) => {
  const document = Document.of([<img src="foo.mp4" />]);

  t.deepEqual(await evaluate(R24, { document }), [inapplicable(R24)]);
});

test("evaluate() is inapplicable when applicability questions are unanswered", async (t) => {
  const document = Document.of([
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>,
  ]);

  t.deepEqual(await evaluate(R24, { document }), [inapplicable(R24)]);
});
