import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getRole } from "../../src/element/get-role";
import * as Roles from "../../src/roles";

test("Returns the semantic role of an element when explicitly set", async t => {
  t.is(getRole(<div role="button">Button</div>), Roles.Button);
});

test("Returns the semantic role of an element when implicitly set", async t => {
  t.is(getRole(<button>Button</button>), Roles.Button);
});

test("Returns the first valid role when multiple roles are set", async t => {
  t.is(getRole(<div role="foo button link">Button</div>), Roles.Button);
});

test("Does not consider abstract roles", async t => {
  t.is(getRole(<div role="widget" />), null);
});

test("Returns the semantic role of an anchor that has an href attribute", async t => {
  t.is(getRole(<a href="foo">Foo</a>), Roles.Link);
});

test("Returns null when an anchor has no href attribute", async t => {
  t.is(getRole(<a>Foo</a>), null);
});
