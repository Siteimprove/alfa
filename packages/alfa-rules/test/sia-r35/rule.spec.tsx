import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R35, { Outcomes } from "../../src/sia-r35/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when some input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        // R32
        "has-audio-track": true,
      })
    ),
    [passed(R35, target, { 1: Outcomes.HasAlternative })]
  );
});

test(`evaluate() passes when R26 passes`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        // R26
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [passed(R35, target, { 1: Outcomes.HasAlternative })]
  );
});

test(`evaluate() fails when no input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;
  // R34 inapplicable due to no descriptions track

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        // R26
        "text-alternative": None,
        label: None,
        // R32
        "has-audio-track": false,
        // R33
        transcript: None,
        "transcript-link": None,
      })
    ),
    [failed(R35, target, { 1: Outcomes.HasNoAlternative })]
  );
});

test(`evaluate() cannot tell if no input rule can tell`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [cantTell(R35, target)]
  );
});

test(`evaluate() cannot tell when some input rule cannot tell and no input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": false,
        // R32
        "has-audio-track": false,
      })
    ),
    [cantTell(R35, target)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R35, { document }), [inapplicable(R35)]);
});

test(`evaluate() is inapplicable to videos with audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R35,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [inapplicable(R35)]
  );
});
