/// <reference path="../types/emphasize.d.ts" />

import * as emphasize from "emphasize/lib/core";

import { mark } from "./marker";

const sheet: emphasize.Sheet = {
  comment: mark.gray,
  quote: mark.gray,

  keyword: mark.green,
  "selector-tag": mark.green,
  addition: mark.green,

  number: mark.cyan,
  string: mark.cyan,
  "meta meta-string": mark.cyan,
  literal: mark.cyan,
  doctag: mark.cyan,
  regexp: mark.cyan,

  title: mark.blue,
  section: mark.blue,
  name: mark.blue,
  "selector-id": mark.blue,
  "selector-class": mark.blue,

  attribute: mark.yellow,
  attr: mark.yellow,
  variable: mark.yellow,
  "template-variable": mark.yellow,
  "class title": mark.yellow,
  type: mark.yellow,

  symbol: mark.magenta,
  bullet: mark.magenta,
  subst: mark.magenta,
  meta: mark.magenta,
  "meta keyword": mark.magenta,
  "selector-attr": mark.magenta,
  "selector-pseudo": mark.magenta,
  link: mark.magenta,

  built_in: mark.red,
  deletion: mark.red,

  emphasis: mark.italic,
  strong: mark.bold,
  formula: mark.inverse,
};

export async function syntax(language: string, value: string): Promise<string> {
  // Register the syntax for the language to highlight. By default, _every_
  // supported language from highlight.js is loaded, which is fairly expensive.
  // We therefore only load languages as they're needed.
  await syntax.register(language);

  return mark.reset(emphasize.highlight(language, value, sheet).value);
}

export namespace syntax {
  const registered = new Set<string>();

  export async function register(language: string): Promise<void> {
    if (registered.has(language)) {
      return;
    }

    registered.add(language);

    emphasize.registerLanguage(
      language,
      await import(`highlight.js/lib/languages/${language}`)
    );
  }
}
