// TypeScript does not output an import of cheerio in the declaration file,
// leaving consumers confused. To get around this, we explicitly add a reference
// to the cheerio types.
//
// tslint:disable:no-reference-import

/// <reference types="cheerio" />

import * as Cheerio from "cheerio";

export const CheerioWrapper = Cheerio.default;
export type CheerioWrapper = Cheerio;

export type CheerioElement = CheerioWrapper[0];
