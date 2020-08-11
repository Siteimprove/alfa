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

test(`.from() determines the name of a <button> element with child text content`, (t) => {
  const text = h.text("Hello world");
  const button = <button>{text}</button>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.content(button, [
            Name.of("Hello world", Name.Source.data(text)),
          ])
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a <button> element with a <span> child
      element with child text content`, (t) => {
  const text = h.text("Hello world");
  const span = <span>{text}</span>;
  const button = <button>{span}</button>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.content(button, [
            Name.of(
              "Hello world",
              Name.Source.content(span, [
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

test(`.from() determines the name of a <button> element with an aria-label
      attribute`, (t) => {
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

test(`.from() determines the name of a <button> element with an aria-labelledby
      attribute that points to a <p> element with child text content`, (t) => {
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

test(`.from() determines the name of a <button> element with an aria-labelledby
      attribute that points to two <p> elements with child text content`, (t) => {
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

test(`.from() determines the name of a <button> element with a title attribute
      and no other non-whitespace child text content`, (t) => {
  const button = (
    <button title="Hello world">
      <span> </span>
    </button>
  );

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.label(button.attribute("title").get())
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of an <img> element with an alt attribute`, (t) => {
  const img = <img alt="Hello world" />;

  t.deepEqual(Name.from(img, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", Name.Source.label(img.attribute("alt").get()))
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of an <area> element with an alt attribute`, (t) => {
  const area = <area alt="Hello world" />;

  t.deepEqual(Name.from(area, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", Name.Source.label(area.attribute("alt").get()))
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a <fieldset> element with a <legend> child
      element with child text content`, (t) => {
  const text = h.text("Hello world");

  const legend = <legend>{text}</legend>;

  const fieldset = (
    <fieldset>
      {legend}
      This is a fieldset
    </fieldset>
  );

  t.deepEqual(Name.from(fieldset, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.content(legend, [
            Name.of("Hello world", Name.Source.data(text)),
          ])
        )
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a <figure> element with a <figcaption>
      child element with child text content`, (t) => {
  const text = h.text("Hello world");

  const caption = <figcaption>{text}</figcaption>;

  const fieldset = (
    <figure>
      <img alt="This is an image"></img>
      {caption}
    </figure>
  );

  t.deepEqual(Name.from(fieldset, device).toArray(), [
    [
      Option.of(
        Name.of(
          "Hello world",
          Name.Source.content(caption, [
            Name.of("Hello world", Name.Source.data(text)),
          ])
        )
      ),
      [],
    ],
  ]);
});
