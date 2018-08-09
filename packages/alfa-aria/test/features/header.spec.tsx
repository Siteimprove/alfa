import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Header } from "../../src/features/header";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#header
 */

test("Returns the semantic role of a header that is not a descendant of an article, aside, main, nav or section", t => {
  const header = <header>Foo</header>;
  t.equal(Header.role!(header, header), Roles.Banner);
});

test("Returns no role if a header is a descendant of an article", t => {
  const header = <header />;
  const article = <article>{header}</article>;
  t.equal(Header.role!(header, article), null);
});

test("Returns no role if a header is a descendant of an aside", t => {
  const header = <header />;
  const aside = <aside>{header}</aside>;
  t.equal(Header.role!(header, aside), null);
});

test("Returns no role if a header is a descendant of a main", t => {
  const header = <header />;
  const main = <main>{header}</main>;
  t.equal(Header.role!(header, main), null);
});

test("Returns no role if a header is a descendant of a nav", t => {
  const header = <header />;
  const nav = <nav>{header}</nav>;
  t.equal(Header.role!(header, nav), null);
});

test("Returns no role if a header is a descendant of a section", t => {
  const header = <header />;
  const section = <section>{header}</section>;
  t.equal(Header.role!(header, section), null);
});
