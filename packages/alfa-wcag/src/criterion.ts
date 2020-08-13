import { Requirement } from "@siteimprove/alfa-act";

import { Criteria } from "./criterion/data";

export class Criterion<
  C extends Criterion.Chapter = Criterion.Chapter
> extends Requirement {
  public static of<C extends Criterion.Chapter>(chapter: C): Criterion<C> {
    return new Criterion(chapter);
  }

  private readonly _chapter: C;

  private constructor(chapter: C) {
    super(Criteria[chapter].uri);

    this._chapter = chapter;
  }

  public get chapter(): C {
    return this._chapter;
  }

  public get title(): string {
    return Criteria[this._chapter].title;
  }

  public get level(): Criterion.Level<C> {
    return Criteria[this._chapter].level;
  }

  public hasLevel(level: Criterion.Level): boolean {
    return Criteria[this._chapter].level <= level;
  }

  public toJSON(): Criterion.JSON {
    const { title, level } = Criteria[this._chapter];

    return {
      ...super.toJSON(),
      chapter: this._chapter,
      title,
      level,
    };
  }

  public toEARL(): Criterion.EARL {
    const { title, uri } = Criteria[this._chapter];

    return {
      ...super.toEARL(),
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
      "@id": uri,
      "dct:title": title,
      "dct:isPartOf": "https://www.w3.org/TR/WCAG/",
    };
  }
}

export namespace Criterion {
  export interface JSON extends Requirement.JSON {
    chapter: Chapter;
    title: string;
    level: Level;
  }

  export interface EARL extends Requirement.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "@id": string;
    "dct:title": string;
    "dct:isPartOf": "https://www.w3.org/TR/WCAG/";
  }

  export type Chapter = keyof Criteria;

  export function isChapter(value: string): value is Chapter {
    return value in Criteria;
  }

  export type Level<C extends Chapter = Chapter> = Criteria[C]["level"];

  type WithLevel<L extends Level> = {
    [C in Chapter]: L extends Criteria[C]["level"] ? C : never;
  }[Chapter];

  export type A = WithLevel<"A">;

  export type AA = WithLevel<"AA">;

  export type AAA = WithLevel<"AAA">;

  export function isCriterion(value: unknown): value is Criterion {
    return value instanceof Criterion;
  }
}
