import { test } from "@siteimprove/alfa-test";
import { h, type Element } from "../../../dist/index.js";
import { isSuggestedFocusable } from "../../../dist/node/element/predicate/is-suggested-focusable.js";

test("isSuggestedFocusable() returns false for inert elements", (t) => {
  const div = <div inert>content</div>;
  const button = <button inert>click</button>;
  const input = <input type="text" inert />;

  t.deepEqual(isSuggestedFocusable(div), false);
  t.deepEqual(isSuggestedFocusable(button), false);
  t.deepEqual(isSuggestedFocusable(input), false);
});

test("isSuggestedFocusable() handles nested inert containers", (t) => {
  const button = <button>should not be focusable</button>;
  h.document([<div inert>{button}</div>]);
  t.deepEqual(isSuggestedFocusable(button), false);
});

test("isSuggestedFocusable() returns true for elements inside open dialog within inert container", (t) => {
  const button = <button>should be focusable</button>;
  h.document([
    <div inert>
      <dialog open>{button}</dialog>
    </div>,
  ]);
  t.deepEqual(isSuggestedFocusable(button), true);
});

test("isSuggestedFocusable() returns true for <a> with href", (t) => {
  const link = <a href="https://example.com">link</a>;
  t.deepEqual(isSuggestedFocusable(link), true);
});

test("isSuggestedFocusable() returns false for <a> without href", (t) => {
  const link = <a>not a link</a>;
  t.deepEqual(isSuggestedFocusable(link), false);
});

test("isSuggestedFocusable() returns true for <link> with href", (t) => {
  const link = <link href="style.css" />;
  t.deepEqual(isSuggestedFocusable(link), true);
});

test("isSuggestedFocusable() returns false for <link> without href", (t) => {
  const link = <link />;
  t.deepEqual(isSuggestedFocusable(link), false);
});

test("isSuggestedFocusable() returns true for <input> with non-hidden type", (t) => {
  const text = <input type="text" />;
  const checkbox = <input type="checkbox" />;
  const radio = <input type="radio" />;
  const button = <input type="button" />;
  const noType = <input />;

  t.deepEqual(isSuggestedFocusable(text), true);
  t.deepEqual(isSuggestedFocusable(checkbox), true);
  t.deepEqual(isSuggestedFocusable(radio), true);
  t.deepEqual(isSuggestedFocusable(button), true);
  t.deepEqual(isSuggestedFocusable(noType), true);
});

test("isSuggestedFocusable() returns false for <input type='hidden'>", (t) => {
  const hidden = <input type="hidden" />;
  t.deepEqual(isSuggestedFocusable(hidden), false);
});

test("isSuggestedFocusable() returns true for <audio> with controls", (t) => {
  const audio = <audio controls src="audio.mp3" />;
  t.deepEqual(isSuggestedFocusable(audio), true);
});

test("isSuggestedFocusable() returns false for <audio> without controls", (t) => {
  const audio = <audio src="audio.mp3" />;
  t.deepEqual(isSuggestedFocusable(audio), false);
});

test("isSuggestedFocusable() returns true for <video> with controls", (t) => {
  const video = <video controls src="video.mp4" />;
  t.deepEqual(isSuggestedFocusable(video), true);
});

test("isSuggestedFocusable() returns false for <video> without controls", (t) => {
  const video = <video src="video.mp4" />;
  t.deepEqual(isSuggestedFocusable(video), false);
});

test("isSuggestedFocusable() returns true for <button>", (t) => {
  const button = <button>click me</button>;
  t.deepEqual(isSuggestedFocusable(button), true);
});

test("isSuggestedFocusable() returns true for <select>", (t) => {
  const select = (
    <select>
      <option>Option 1</option>
    </select>
  );
  t.deepEqual(isSuggestedFocusable(select), true);
});

test("isSuggestedFocusable() returns true for <textarea>", (t) => {
  const textarea = <textarea>content</textarea>;
  t.deepEqual(isSuggestedFocusable(textarea), true);
});

test("isSuggestedFocusable() returns true for <summary> of parent <details>", (t) => {
  const summary = <summary>Summary</summary>;
  h.document([
    <details>
      {summary}
      <p>Details content</p>
    </details>,
  ]);
  t.deepEqual(isSuggestedFocusable(summary), true);
});

test("isSuggestedFocusable() returns false for <summary> not in <details>", (t) => {
  const summary = <summary>Summary</summary>;
  t.deepEqual(isSuggestedFocusable(summary), false);
});

test("isSuggestedFocusable() returns true for editing host", (t) => {
  const editable = <div contenteditable="true">editable</div>;
  t.deepEqual(isSuggestedFocusable(editable), true);
});

test("isSuggestedFocusable() returns true for browsing context container", (t) => {
  const iframe = <iframe src="page.html" />;
  t.deepEqual(isSuggestedFocusable(iframe), true);
});

test("isSuggestedFocusable() returns false for regular elements", (t) => {
  const div = <div>content</div>;
  const span = <span>text</span>;
  const p = <p>paragraph</p>;

  t.deepEqual(isSuggestedFocusable(div), false);
  t.deepEqual(isSuggestedFocusable(span), false);
  t.deepEqual(isSuggestedFocusable(p), false);
});
