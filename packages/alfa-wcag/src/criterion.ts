import { Requirement } from "@siteimprove/alfa-act";

import { Criteria } from "./criterion/data";

export class Criterion extends Requirement {
  public static of(chapter: Criterion.Chapter): Criterion {
    return new Criterion(chapter);
  }

  private readonly _chapter: Criterion.Chapter;

  private constructor(chapter: Criterion.Chapter) {
    super(Criteria[chapter].uri);

    this._chapter = chapter;
  }

  public get chapter(): Criterion.Chapter {
    return this._chapter;
  }

  public get title(): string {
    return Criteria[this._chapter].title;
  }

  public get level(): Criterion.Level {
    return Criteria[this._chapter].level;
  }

  public get versions(): Iterable<Criterion.Version> {
    return Criteria[this._chapter].versions[Symbol.iterator]();
  }

  public hasLevel(level: Criterion.Level): boolean {
    return Criteria[this._chapter].level <= level;
  }

  public hasVersion(version: Criterion.Version): boolean {
    return Criteria[this._chapter].versions.includes(version);
  }

  public toJSON(): Criterion.JSON {
    const { title, level, versions } = Criteria[this._chapter];

    return {
      ...super.toJSON(),
      chapter: this._chapter,
      title,
      level,
      versions: [...versions],
    };
  }

  public toEARL(): Criterion.EARL {
    const { title } = Criteria[this._chapter];

    return {
      ...super.toEARL(),
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
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
    versions: Array<Version>;
  }

  export interface EARL extends Requirement.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "dct:title": string;
    "dct:isPartOf": "https://www.w3.org/TR/WCAG/";
  }

  export type Chapter = keyof Criteria;

  export type Level = "A" | "AA" | "AAA";

  export type Version = "2.0" | "2.1";

  export function isCriterion(value: unknown): value is Criterion {
    return value instanceof Criterion;
  }
}
