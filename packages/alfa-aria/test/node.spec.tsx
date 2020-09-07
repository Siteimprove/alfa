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

  // We should use the `Graph` class for building up a graph of references and
  // reject any reference that would cause a cycle. Until then, cyclic references
  // will cause all nodes participating in the cycle to become inert.

  t.deepEqual(Node.from(foo, device).toJSON(), [[Inert.of(foo).toJSON(), []]]);

  t.deepEqual(Node.from(bar, device).toJSON(), [[Inert.of(bar).toJSON(), []]]);
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
