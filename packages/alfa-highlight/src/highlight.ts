/// <reference path="../types/emphasize.d.ts" />

import * as emphasize from "emphasize";
import { mark } from "./markers";

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
  formula: mark.inverse
};

export function highlight(language: string, value: string): string {
  return mark.reset(emphasize.highlight(language, value, sheet).value);
}
