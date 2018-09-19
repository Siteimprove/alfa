import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { matches } from "../src/matches";
import { Namespace } from "../src/types";

test("Matches an element against a tag", t => {
  const div = <div />;
  t(matches(div, div, "div"));
});

test("Matches an element against a class", t => {
  const div = <div class="foo" />;
  t(matches(div, div, ".foo"));
});

test("Matches an element against an ID", t => {
  const div = <div id="foo" />;
  t(matches(div, div, "#foo"));
});

test("Matches an element against an attribute without a value", t => {
  const div = <div foo />;
  t(matches(div, div, "[foo]"));
});

test("Matches an element against an attribute with a value", t => {
  const div = <div foo="bar" />;
  t(matches(div, div, "[foo=bar]"));
});

test("Matches an element against an attribute with a prefix modifier", t => {
  const div = <div foo="bar" />;
  t(matches(div, div, "[foo^=ba]"));
  t(!matches(div, div, "[foo^=ar]"));
});

test("Matches an element against an attribute with a suffix modifier", t => {
  const div = <div foo="bar" />;
  t(matches(div, div, "[foo$=ar]"));
  t(!matches(div, div, "[foo$=ba]"));
});

test("Matches an element against an attribute with a substring modifier", t => {
  const div = <div foo="bar" />;
  t(matches(div, div, "[foo*=a]"));
  t(!matches(div, div, "[foo*=q]"));
});

test("Matches an element against an attribute with a dash match modifier", t => {
  const div = <div foo="bar-baz" />;
  t(matches(div, div, "[foo|=bar]"));
  t(!matches(div, div, "[foo|=baz]"));
});

test("Matches an element against an attribute with an includes modifier", t => {
  const div = <div foo="bar baz" />;
  t(matches(div, div, "[foo~=bar]"));
  t(matches(div, div, "[foo~=baz]"));
  t(!matches(div, div, "[foo~=foo]"));
});

test("Matches an element against an attribute with a casing modifier", t => {
  const div = <div foo="bAR" />;
  t(matches(div, div, "[foo=Bar i]"));
});

test("Matches an element with a class against a list of selectors", t => {
  const div = <div class="foo" />;
  t(matches(div, div, ".foo, #bar"));
});

test("Matches an element with an ID against a list of selectors", t => {
  const div = <div id="bar" />;
  t(matches(div, div, ".foo, #bar"));
});

test("Matches an element against a descendant selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t(matches(foo, document, "div p #foo"));
  t(!matches(foo, document, "p div #foo"));
});

test("Matches an element against a direct descendant selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t(matches(foo, document, "div > p > #foo"));
  t(!matches(foo, document, "p > div > #foo"));
});

test("Matches an element against a sibling selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      <b />
      {foo}
    </div>
  );

  t(matches(foo, document, "p ~ b ~ #foo"));
  t(!matches(foo, document, "b ~ p ~ #foo"));
});

test("Matches an element against a direct sibling selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      <b />
      {foo}
    </div>
  );

  t(matches(foo, document, "p + b + #foo"));
  t(!matches(foo, document, "b + p + #foo"));
});

test("Matches an element against a scope selector", t => {
  const div = <div />;
  t(matches(div, div, ":scope", { scope: div }));
});

test("Matches an element against a negation selector", t => {
  const div = <div />;
  t(matches(div, div, ":not(span)"));
  t(!matches(div, div, ":not(div)"));
});

test("Matches an element against a hover selector", t => {
  const div = <div />;
  t(matches(div, div, "div:hover", { hover: div }));
  t(!matches(div, div, "span:hover", { hover: div }));
});

test("Matches an element against a focus selector", t => {
  const div = <div />;
  t(matches(div, div, "div:focus", { focus: div }));
  t(!matches(div, div, "span:focus", { focus: div }));
});

test("Matches an element against an active selector", t => {
  const div = <div />;
  t(matches(div, div, "div:active", { active: div }));
  t(!matches(div, div, "span:active", { active: div }));
});

test("Matches an element against a host selector", t => {
  const host = (
    <div>
      <shadow>
        <span class="child" />
      </shadow>
    </div>
  );

  const root = host.shadowRoot!;

  t(matches(host, host, ":host", { treeContext: root }));
  t(!matches(host, host, "div:host", { treeContext: root }));
});

test("Matches an element against a functional host selector", t => {
  const host = (
    <div class="foo">
      <shadow>
        <span class="child" />
      </shadow>
    </div>
  );

  const root = host.shadowRoot!;

  t(matches(host, host, ":host(.foo)", { treeContext: root }));
  t(!matches(host, host, ":host(.bar)", { treeContext: root }));
});

test("Matches an element against a host-context selector", t => {
  const host = (
    <div class="bar">
      <shadow>
        <span class="child" />
      </shadow>
    </div>
  );
  const context = <div class="foo">{host}</div>;

  const root = host.shadowRoot!;

  t(matches(host, context, ":host-context(.foo)", { treeContext: root }));
  t(matches(host, context, ":host-context(.bar)", { treeContext: root }));
  t(!matches(host, context, ":host-context", { treeContext: root }));
  t(!matches(host, context, ":host-context(.barfoo)", { treeContext: root }));
});

test("Matches an element against a declared namespace selector", t => {
  const circle = <circle />;
  const svg = <svg>{circle}</svg>;

  const namespaces = new Map([
    ["svg", Namespace.SVG],
    ["html", Namespace.HTML]
  ]);

  t(matches(svg, svg, "svg|svg", { namespaces }));
  t(matches(circle, svg, "svg|circle", { namespaces }));
  t(matches(svg, svg, "svg|*", { namespaces }));
  t(!matches(svg, svg, "html|svg", { namespaces }));
});

test("Matches an element against against all or no namespaces", t => {
  const svg = <svg />;
  const div = <div />;

  const namespaces = new Map([["svg", Namespace.SVG]]);

  t(matches(svg, svg, "*|svg", { namespaces }));

  // As all elements in HTML5 will use the XHTML namespace, unless another
  // namespace is explicitly specified, the only way to currently test the
  // no-namespace selector (i.e. "|div") is to provide a disconnected context.
  // https://www.w3.org/TR/selectors/#type-nmsp
  t(matches(div, svg, "|div", { namespaces }));
});

test("Matches an element against a default namespace selector", t => {
  const circle = <circle />;
  const svg = <svg>{circle}</svg>;
  const div = <div />;

  const namespaces = new Map([[null, Namespace.SVG]]);

  t(matches(svg, svg, "svg", { namespaces }));
  t(matches(circle, svg, "circle", { namespaces }));
  t(!matches(div, div, "div", { namespaces }));
});

test("Matches an attribute against a declared namespace selector", t => {
  const svg: jsx.JSX.Element = {
    nodeType: 1,
    prefix: "svg",
    localName: "svg",
    attributes: [
      {
        prefix: "xlink",
        localName: "href",
        value: "foobar"
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  const namespaces = new Map([["xlink", Namespace.XLink]]);

  t(matches(svg, svg, "[xlink|href]", { namespaces }));
  t(!matches(svg, svg, "[html|href]", { namespaces }));
});

test("Matches an attribute against all or no namespaces", t => {
  const svg: jsx.JSX.Element = {
    nodeType: 1,
    prefix: "svg",
    localName: "svg",
    attributes: [
      {
        prefix: "xlink",
        localName: "href",
        value: "foo"
      }
    ],
    shadowRoot: null,
    childNodes: []
  };

  const div = <div title="Foobar" />;

  const namespaces = new Map([["xlink", Namespace.XLink]]);

  t(matches(svg, svg, "[*|href]", { namespaces }));

  // As all elements in HTML5 will use the XHTML namespace, unless another
  // namespace is explicitly specified, the only way to currently test the
  // no-namespace selector (i.e. "|div") is to provide a disconnected context.
  // https://www.w3.org/TR/selectors/#type-nmsp
  t(matches(div, svg, "[|title]", { namespaces }));
});

test("Matches an attribute against a default namespace selector", t => {
  const div = <div title="Foobar" />;

  const namespaces = new Map([[null, Namespace.XML]]);

  // Default namespaces do not apply to attributes, so the default namespace
  // will be ignored.
  // https://www.w3.org/TR/selectors-3/#univnmsp
  t(matches(div, div, "[title]", { namespaces }));
});
