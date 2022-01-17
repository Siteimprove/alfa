import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R37, { Outcomes } from "../../src/sia-r37/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes when some input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R25
        "has-description": true,
      })
    ),
    [passed(R37, target, { 1: Outcomes.HasAudioDescription })]
  );
});

test(`evaluate() passes when some input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;
  const text = <p>Some very long text</p>;
  const label = <span>Watch this content as a video</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R31
        "text-alternative": Option.of(text),
        label: Option.of(label),
      })
    ),
    [passed(R37, target, { 1: Outcomes.HasAudioDescription })]
  );
});

test(`evaluate() fails when no input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;
  // R36 inapplicable due to no descriptions track

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R25
        "has-description": false,
        // R31
        "text-alternative": None,
        label: None,
      })
    ),
    [failed(R37, target, { 1: Outcomes.HasNoAudioDescription })]
  );
});

test(`evaluate() cannot tell if no input rule can tell`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": true })
    ),
    [cantTell(R37, target)]
  );
});

test(`evaluate() cannot tell when some input rule cannot tell and no input rule passes`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({
        "is-video-streaming": false,
        "has-audio": true,
        // R25
        "has-description": false,
      })
    ),
    [cantTell(R37, target)]
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R37, { document }), [inapplicable(R37)]);
});

test(`evaluate() is inapplicable to videos without audio`, async (t) => {
  const target = <video src="foo.mp4" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R37,
      { document },
      oracle({ "is-video-streaming": false, "has-audio": false })
    ),
    [inapplicable(R37)]
  );
});
