import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R29 from "../../dist/sia-r29/rule.js";
import { Outcomes } from "../../dist/common/expectation/media-text-alternative.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

test(`evaluate() passes an audio that is labelled as alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const text = <p>Some very long text</p>;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      }),
    ),
    [
      passed(
        R29,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() passes an audio with autoplay attribute that is labelled as alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;
  const text = <p>Some very long text</p>;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      }),
    ),
    [
      passed(
        R29,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() passes an non-playing audio with controls attribute that is labelled as alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" controls />;
  const text = <p>Some very long text</p>;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      }),
    ),
    [
      passed(
        R29,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio that is not alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        "text-alternative": None,
        label: Option.of(label),
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasNoAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio with autoplay attribute that is not alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "text-alternative": None,
        label: Option.of(label),
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasNoAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails a non-playing audio with controls attribute that is not alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" controls />;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
        "text-alternative": None,
        label: Option.of(label),
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasNoAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio that is not labelled as alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const text = <p>Some very long text</p>;

  const document = h.document([text, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        "text-alternative": Option.of(text),
        label: None,
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<audio>"),
          2: Outcomes.HasNoLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio alternative for invisible text`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const text = <p style={{ visibility: "hidden" }}>Some very long text</p>;
  const label = <span>Listen to this content as audio</span>;

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasNonPerceivableAlternative("<audio>"),
          2: Outcomes.HasPerceivableLabel("<audio>"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() fails an audio that is invisibly labelled as alternative for text`, async (t) => {
  const target = <audio src="foo.mp3" />;
  const text = <p>Some very long text</p>;
  const label = (
    <span style={{ visibility: "hidden" }}>
      Listen to this content as audio
    </span>
  );

  const document = h.document([text, label, target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": true,
        "text-alternative": Option.of(text),
        label: Option.of(label),
      }),
    ),
    [
      failed(
        R29,
        target,
        {
          1: Outcomes.HasPerceivableAlternative("<audio>"),
          2: Outcomes.HasNonPerceivableLabel("<audio>"),
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
      R29,
      { document },
      oracle({ "is-audio-streaming": false, "is-playing": true }),
    ),
    [cantTell(R29, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() cannot tell for audio with autoplay attribute and not answered expectation questions`, async (t) => {
  const target = <audio src="foo.mp3" autoplay />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(R29, { document }, oracle({ "is-audio-streaming": false })),
    [cantTell(R29, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() cannot tell for non-playing audio with controls attribute and not answered expectation questions`, async (t) => {
  const target = <audio src="foo.mp3" controls />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R29,
      { document },
      oracle({
        "is-audio-streaming": false,
        "is-playing": false,
      }),
    ),
    [cantTell(R29, target, undefined, Outcome.Mode.SemiAuto)],
  );
});

test(`evaluate() is inapplicable when Applicability questions are unanswered`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R29, { document }), [inapplicable(R29)]);
});

test(`evaluate() is inapplicable to streaming audios`, async (t) => {
  const target = <audio src="foo.mp3" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(R29, { document }, oracle({ "is-audio-streaming": true })),
    [inapplicable(R29, Outcome.Mode.SemiAuto)],
  );
});
