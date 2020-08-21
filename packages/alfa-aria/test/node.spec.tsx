import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option, None } from "@siteimprove/alfa-option";

import { Name } from "../src/name";
import { Role } from "../src/role";

import { Node } from "../src/node";
import { Element } from "../src/node/element";
import { Text } from "../src/node/text";
import { Attribute } from "../src";

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
        [Text.of(text, Name.of("Hello world", [Name.Source.data(text)]))]
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
