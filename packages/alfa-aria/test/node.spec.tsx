import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option, None } from "@siteimprove/alfa-option";

import { Attribute } from "../src/attribute";
import { Name } from "../src/name";
import { Role } from "../src/role";

import { Node } from "../src/node";
import { Element } from "../src/node/element";
import { Text } from "../src/node/text";
import { Container } from "../src/node/container";
import { Inert } from "../src/node/inert";

const device = Device.standard();

test(`.from() constructs an accessible node from an element`, (t) => {
  const text = h.text("Hello world");

  const element = <button>{text}</button>;

  t.deepEqual(Node.from(element, device).toJSON(), [
    [
      Element.of(
        element,
        Option.of(Role.of("button")),
        Option.of(
          Name.of("Hello world", [
            Name.Source.descendant(
              element,
              Name.of("Hello world", [Name.Source.data(text)])
            ),
          ])
        ),
        [],
        [
          Text.of(
            text,
            Option.of(Name.of("Hello world", [Name.Source.data(text)]))
          ),
        ]
      ).toJSON(),
      [],
    ],
  ]);
});

test(`.from() gives precedence to aria-owns references`, (t) => {
  const foo = <button id="foo" />;

  const bar = <input id="bar" />;

  const header = <header aria-owns="bar">{foo}</header>;

  const footer = <footer>{bar}</footer>;

  <div>
    {header}
    {footer}
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), [
    [
      Element.of(
        header,
        Option.of(Role.of("banner")),
        None,
        [Attribute.of("aria-owns", "bar")],
        [
          Element.of(foo, Option.of(Role.of("button"))),
          Element.of(bar, Option.of(Role.of("textbox")), None, [
            Attribute.of("aria-checked", "false"),
          ]),
        ]
      ).toJSON(),
      [],
    ],
  ]);

  t.deepEqual(Node.from(footer, device).toJSON(), [
    [Element.of(footer, Option.of(Role.of("contentinfo"))).toJSON(), []],
  ]);
});

test(`.from() correctly handles conflicting aria-owns claims`, (t) => {
  const foo = <button id="foo" />;

  const bar = <input id="bar" />;

  const header = <header aria-owns="bar">{foo}</header>;

  const footer = <footer aria-owns="bar">{bar}</footer>;

  <div>
    {header}
    {footer}
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), [
    [
      Element.of(
        header,
        Option.of(Role.of("banner")),
        None,
        [Attribute.of("aria-owns", "bar")],
        [
          Element.of(foo, Option.of(Role.of("button"))),
          Element.of(bar, Option.of(Role.of("textbox")), None, [
            Attribute.of("aria-checked", "false"),
          ]),
        ]
      ).toJSON(),
      [],
    ],
  ]);

  t.deepEqual(Node.from(footer, device).toJSON(), [
    [
      Element.of(footer, Option.of(Role.of("contentinfo")), None, [
        Attribute.of("aria-owns", "bar"),
      ]).toJSON(),
      [],
    ],
  ]);
});

test(`.from() correctly handles reordered aria-owns references`, (t) => {
  const foo = <button id="foo" />;

  const bar = <input id="bar" />;

  const header = <header aria-owns="bar foo">{foo}</header>;

  <div>
    {header}
    {bar}
  </div>;

  t.deepEqual(Node.from(header, device).toJSON(), [
    [
      Element.of(
        header,
        Option.of(Role.of("banner")),
        None,
        [Attribute.of("aria-owns", "bar foo")],
        [
          Element.of(bar, Option.of(Role.of("textbox")), None, [
            Attribute.of("aria-checked", "false"),
          ]),
          Element.of(foo, Option.of(Role.of("button"))),
        ]
      ).toJSON(),
      [],
    ],
  ]);
});

test(`.from() correctly handles self-referential aria-owns references`, (t) => {
  const div = <div id="foo" aria-owns="foo" />;

  t.deepEqual(Node.from(div, device).toJSON(), [
    [
      Element.of(div, None, None, [Attribute.of("aria-owns", "foo")]).toJSON(),
      [],
    ],
  ]);
});

test(`.from() correctly handles circular aria-owns references between siblings`, (t) => {
  const foo = <div id="foo" aria-owns="bar" />;

  const bar = <div id="bar" aria-owns="foo" />;

  <div>
    {foo}
    {bar}
  </div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [
      Element.of(
        foo,
        None,
        None,
        [Attribute.of("aria-owns", "bar")],
        [Element.of(bar, None, None, [Attribute.of("aria-owns", "foo")])]
      ).toJSON(),
      [],
    ],
  ]);

  t.deepEqual(Node.from(bar, device).toJSON(), [
    [
      Element.of(bar, None, None, [Attribute.of("aria-owns", "foo")]).toJSON(),
      [],
    ],
  ]);
});

test(`.from() correctly handles circular aria-owns references between ancestors
      and descendants`, (t) => {
  const foo = <div id="foo" aria-owns="bar" />;

  const bar = <div id="bar">{foo}</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [
      Element.of(foo, None, None, [Attribute.of("aria-owns", "bar")]).toJSON(),
      [],
    ],
  ]);

  t.deepEqual(Node.from(bar, device).toJSON(), [
    [
      Container.of(bar, [
        Element.of(foo, None, None, [Attribute.of("aria-owns", "bar")]),
      ]).toJSON(),
      [],
    ],
  ]);
});

test(".from() exposes elements if they have a role", (t) => {
  const foo = <button></button>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [Element.of(foo, Option.of(Role.of("button")), None).toJSON(), []],
  ]);
});

test(".from() exposes elements if they have ARIA attributes", (t) => {
  const foo = <div aria-label="foo"></div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [
      Element.of(
        foo,
        None,
        Option.of(
          Name.of("foo", [
            Name.Source.Label.of(foo.attribute("aria-label").get()),
          ])
        ),
        [Attribute.of("aria-label", "foo")]
      ).toJSON(),
      [],
    ],
  ]);
});

test(".from() exposes elements if they have a tabindex", (t) => {
  const foo = <div tabindex={0}></div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [Element.of(foo, None, None).toJSON(), []],
  ]);

  const iframe = <iframe />; // Focusable by default, and no role

  t.deepEqual(Node.from(iframe, device).toJSON(), [
    [Element.of(iframe, None, None).toJSON(), []],
  ]);
});

test(`.from() does not expose elements that have no role, ARIA attributes, nor
      tabindex`, (t) => {
  const text = h.text("Hello world");

  const foo = <div>{text}</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [
      Container.of(foo, [
        Text.of(
          text,
          Option.of(Name.of("Hello world", [Name.Source.data(text)]))
        ),
      ]).toJSON(),
      [],
    ],
  ]);
});

test(`.from() does not expose text nodes of a parent element with
      \`visibility: hidden\``, (t) => {
  const text = h.text("Hello world");

  const foo = <div style={{ visibility: "hidden" }}>{text}</div>;

  t.deepEqual(Node.from(foo, device).toJSON(), [
    [Container.of(foo, [Inert.of(text)]).toJSON(), []],
  ]);
});

test(`.from() exposes implicitly required children of a presentational element
      with an inherited presentational role`, (t) => {
  const li = <li />;

  const ul = <ul role="presentation">{li}</ul>;

  t.deepEqual(Node.from(ul, device).toJSON(), [
    [Container.of(ul, [Container.of(li)]).toJSON(), []],
  ]);
});

test(`.from() doesn't inherit presentational roles into explicitly required
      children of a presentational element`, (t) => {
  const li = <li role="listitem" />;

  const ul = <ul role="presentation">{li}</ul>;

  t.deepEqual(Node.from(ul, device).toJSON(), [
    [
      Container.of(ul, [
        Element.of(li, Option.of(Role.of("listitem"))),
      ]).toJSON(),
      [],
    ],
  ]);
});

test(`.from() doesn't inherit presentational roles into children of implicitly
      required children of a presentational element`, (t) => {
  // This element should _not_ inherit a presentational role as the parent <li>
  // element has no required children.
  const button = <button />;

  const li = <li>{button}</li>;

  const ul = <ul role="presentation">{li}</ul>;

  t.deepEqual(Node.from(ul, device).toJSON(), [
    [
      Container.of(ul, [
        Container.of(li, [Element.of(button, Option.of(Role.of("button")))]),
      ]).toJSON(),
      [],
    ],
  ]);
});
