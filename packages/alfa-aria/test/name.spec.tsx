import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";

import { Name } from "../src/name";

const device = Device.standard();

test(`.from() determines the name of a text node`, (t) => {
  const text = h.text("Hello world");

  t.deepEqual(Name.from(text, device).toArray(), [
    [Option.of(Name.of("Hello world", Name.Source.data(text))), []],
  ]);
});

test(`.from() determines the name of a button with child text content`, (t) => {
  const text = h.text("Hello world");
  const button = <button>{text}</button>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.Content.of(button, [
            Name.of("Hello world", Name.Source.data(text)),
          ])
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a button with an aria-label attribute`, (t) => {
  const button = <button aria-label="Hello world" />;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.label(button.attribute("aria-label").get())
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a button with an aria-labelledby attribute
      that points to a paragraph with child text content`, (t) => {
  const button = <button aria-labelledby="foo" />;
  const text = h.text("Hello world");
  const paragraph = <p id="foo">{text}</p>;

  <div>
    {button}
    {paragraph}
  </div>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.reference(button.attribute("aria-labelledby").get(), [
            Name.of(
              "Hello world",
              Name.Source.content(paragraph, [
                Name.of("Hello world", Name.Source.data(text)),
              ])
            ),
          ])
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a button with an aria-labelledby attribute
      that points to two paragraphs with child text content`, (t) => {
  const button = <button aria-labelledby="foo bar" />;
  const text1 = h.text("Hello");
  const text2 = h.text("world");
  const paragraph1 = <p id="foo">{text1}</p>;
  const paragraph2 = <p id="bar">{text2}</p>;

  <div>
    {button}
    {paragraph1}
    {paragraph2}
  </div>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.reference(button.attribute("aria-labelledby").get(), [
            Name.of(
              "Hello",
              Name.Source.content(paragraph1, [
                Name.of("Hello", Name.Source.data(text1)),
              ])
            ),
            Name.of(
              "world",
              Name.Source.content(paragraph2, [
                Name.of("world", Name.Source.data(text2)),
              ])
            ),
          ])
        )
      ),
      [],
    ],
  ]);
});
