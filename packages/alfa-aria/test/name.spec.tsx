import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option, None } from "@siteimprove/alfa-option";

import { Name } from "../src/name";

const device = Device.standard();

test(`.from() determines the name of a text node`, (t) => {
  const text = h.text("Hello world");

  t.deepEqual(Name.from(text, device).toArray(), [
    [Option.of(Name.of("Hello world", [Name.Source.data(text)])), []],
  ]);
});

test(`.from() determines the name of a <button> element with child text content`, (t) => {
  const text = h.text("Hello world");
  const button = <button>{text}</button>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.descendant(
            button,
            Name.of("Hello world", [Name.Source.data(text)])
          ),
        ])
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
        Name.of("Hello world", [
          Name.Source.descendant(
            button,
            Name.of("Hello world", [
              Name.Source.descendant(
                span,
                Name.of("Hello world", [Name.Source.data(text)])
              ),
            ])
          ),
        ])
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
        Name.of("Hello world", [
          Name.Source.label(button.attribute("aria-label").get()),
        ])
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
        Name.of("Hello world", [
          Name.Source.reference(
            button.attribute("aria-labelledby").get(),
            Name.of("Hello world", [
              Name.Source.descendant(
                paragraph,
                Name.of("Hello world", [Name.Source.data(text)])
              ),
            ])
          ),
        ])
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

  const attribute = button.attribute("aria-labelledby").get();

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.reference(
            attribute,
            Name.of("Hello", [
              Name.Source.descendant(
                paragraph1,
                Name.of("Hello", [Name.Source.data(text1)])
              ),
            ])
          ),
          Name.Source.reference(
            attribute,
            Name.of("world", [
              Name.Source.descendant(
                paragraph2,
                Name.of("world", [Name.Source.data(text2)])
              ),
            ])
          ),
        ])
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
        Name.of("Hello world", [
          Name.Source.label(button.attribute("title").get()),
        ])
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
        Name.of("Hello world", [Name.Source.label(img.attribute("alt").get())])
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
        Name.of("Hello world", [Name.Source.label(area.attribute("alt").get())])
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
        Name.of("Hello world", [
          Name.Source.descendant(
            legend,
            Name.of("Hello world", [Name.Source.data(text)])
          ),
        ])
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
        Name.of("Hello world", [
          Name.Source.descendant(
            caption,
            Name.of("Hello world", [Name.Source.data(text)])
          ),
        ])
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of an <input> element with a <label> parent
      element with child text content`, (t) => {
  const text = h.text("Hello world");

  const input = <input />;

  const label = (
    <label>
      {text}
      {input}
    </label>
  );

  <form>{label}</form>;

  t.deepEqual(Name.from(input, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.ancestor(
            label,
            Name.of("Hello world", [
              Name.Source.descendant(
                label,
                Name.of("Hello world", [Name.Source.data(text)])
              ),
            ])
          ),
        ])
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of an <input> element with a <label> element
      whose for attribute points to the <input> element`, (t) => {
  const text = h.text("Hello world");

  const input = <input id="foo" />;

  const label = <label for="foo">{text}</label>;

  <form>
    {label}
    {input}
  </form>;

  t.deepEqual(Name.from(input, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.reference(
            label.attribute("for").get(),
            Name.of("Hello world", [
              Name.Source.descendant(
                label,
                Name.of("Hello world", [Name.Source.data(text)])
              ),
            ])
          ),
        ])
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of an <input> element with both a <label>
      parent element with child text content and a <label> element whose for
      attribute points to the <input> element`, (t) => {
  const text1 = h.text("Hello world");
  const text2 = h.text("!");

  const input = <input id="foo" />;

  const label1 = (
    <label>
      {text1}
      {input}
    </label>
  );

  const label2 = <label for="foo">{text2}</label>;

  <form>
    {label1}
    {label2}
  </form>;

  t.deepEqual(Name.from(input, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world !", [
          Name.Source.ancestor(
            label1,
            Name.of("Hello world", [
              Name.Source.descendant(
                label1,
                Name.of("Hello world", [Name.Source.data(text1)])
              ),
            ])
          ),
          Name.Source.reference(
            label2.attribute("for").get(),
            Name.of("!", [
              Name.Source.descendant(
                label2,
                Name.of("!", [Name.Source.data(text2)])
              ),
            ])
          ),
        ])
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a <button> element with a role of
      presentation`, (t) => {
  const text = h.text("Hello world");

  // Due to presentational role conflict resolution, the role of `presentation`
  // is ignored to ensure that the button, which is focusable, remains operable.
  const button = <button role="presentation">{text}</button>;

  t.deepEqual(Name.from(button, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.descendant(
            button,
            Name.of("Hello world", [Name.Source.data(text)])
          ),
        ])
      ),
      [],
    ],
  ]);
});

test(`.from() determines the name of a <img> element with a an empty alt
      attribute and an aria-label attribute`, (t) => {
  // Due to presentational role conflict resolution, the role of `presentation`
  // is ignored to ensure that the `aria-label` attribute, which is a global
  // `aria-*` attribute, is exposed.
  const img = <img alt="" aria-label="Hello world" />;

  t.deepEqual(Name.from(img, device).toArray(), [
    [
      Option.of(
        Name.of("Hello world", [
          Name.Source.label(img.attribute("aria-label").get()),
        ])
      ),
      [],
    ],
  ]);
});
