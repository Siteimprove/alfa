import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";

import { Name } from "../src/name";
import { Role } from "../src/role";

import { Node } from "../src/node";
import { Element } from "../src/node/element";
import { Text } from "../src/node/text";

const device = Device.standard();

test(`.from() constructs an accessible node from an element`, (t) => {
  const text = h.text("Hello world");
  const element = <button>{text}</button>;

  t.deepEqual(Node.from(element, device).toArray(), [
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
      ),
      [],
    ],
  ]);
});
