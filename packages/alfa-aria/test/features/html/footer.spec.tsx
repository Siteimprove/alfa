import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Footer } from "../../../src/features/html/footer";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#footer
 */

test("Returns the semantic role of a footer that is not a descendant of an article, aside, main, nav or section", t => {
  const footer = <footer />;
  t.equal(Footer.role!(footer, footer, device), Roles.ContentInfo);
});

test("Returns no role if the footer is a descendant of an article", t => {
  const footer = <footer />;
  const article = <article>{footer}</article>;
  t.equal(Footer.role!(footer, article, device), null);
});

test("Returns no role if the footer is a descendant of an aside", t => {
  const footer = <footer />;
  const aside = <aside>{footer}</aside>;
  t.equal(Footer.role!(footer, aside, device), null);
});

test("Returns no role if the footer is a descendant of a main", t => {
  const footer = <footer />;
  const main = <main>{footer}</main>;
  t.equal(Footer.role!(footer, main, device), null);
});

test("Returns no role if the footer is a descendant of a nav", t => {
  const footer = <footer />;
  const nav = <nav>{footer}</nav>;
  t.equal(Footer.role!(footer, nav, device), null);
});

test("Returns no role if the footer is a descendant of a section", t => {
  const footer = <footer />;
  const section = <section>{footer}</section>;
  t.equal(Footer.role!(footer, section, device), null);
});
