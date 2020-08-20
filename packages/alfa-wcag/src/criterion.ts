import { Requirement } from "@siteimprove/alfa-act";
import { Branched } from "@siteimprove/alfa-branched";

import { Criteria } from "./criterion/data";

export class Criterion<
  C extends Criterion.Chapter = Criterion.Chapter
> extends Requirement {
  public static of<C extends Criterion.Chapter>(chapter: C): Criterion<C> {
    return new Criterion(chapter);
  }

  private readonly _chapter: C;

  private constructor(chapter: C) {
    // Use the criterion URI from the recommendation, if available, otherwise
    // use the URI from the draft. This ensures that the most stable identifier
    // is used when avaiable.
    const [, { uri }] = [...Criteria[chapter].versions].find(
      ([version]) =>
        version === Criterion.Version.Recommendation ||
        version === Criterion.Version.Draft
    )!;

    super(uri);

    this._chapter = chapter;
  }

  /**
   * The chapter of this criterion.
   */
  public get chapter(): C {
    return this._chapter;
  }

  /**
   * The title of this criterion.
   */
  public get title(): string {
    return Criteria[this._chapter].title;
  }

  /**
   * The versions in which this criterion is defined.
   */
  public get versions(): Iterable<Criterion.Version> {
    return [...Criteria[this._chapter].versions].map(([version]) => version);
  }

  /**
   * The level of this criterion.
   *
   * @remarks
   * The level may be different between versions.
   */
  public get level(): Branched<Criterion.Level, Criterion.Version> {
    return Branched.from(
      [...Criteria[this._chapter].versions].map(([version, { level }]) => [
        level,
        [version],
      ])
    );
  }

  public toJSON(): Criterion.JSON {
    const { title } = Criteria[this._chapter];

    return {
      ...super.toJSON(),
      chapter: this._chapter,
      title,
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
  }

  export interface EARL extends Requirement.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "dct:title": string;
    "dct:isPartOf": "https://www.w3.org/TR/WCAG/";
  }

  /**
   * The chapters of all criteria.
   */
  export type Chapter = keyof Criteria;

  export function isChapter(value: string): value is Chapter {
    return value in Criteria;
  }

  /**
   * The different versions of the WCAG.
   */
  export type Version = "2.0" | "2.1" | "2.2";

  export namespace Version {
    /**
     * The current version of the WCAG Recommendation.
     */
    export const Recommendation = "2.1";

    /**
     * The current version of the WCAG Recommendation.
     */
    export type Recommendation = typeof Recommendation;

    /**
     * The current version of the WCAG Working Draft.
     */
    export const Draft = "2.2";

    /**
     * The current version of the WCAG Working Draft.
     */
    export type Draft = typeof Draft;
  }

  /**
   * The level of the specified criterion under the specified version.
   */
  export type Level<
    C extends Chapter = Chapter,
    V extends Version = Version
  > = Criteria[C]["versions"] extends Iterable<infer T>
    ? T extends readonly [V, { readonly level: infer L }]
      ? L
      : never
    : never;

  export namespace Level {
    /**
     * All criteria of the specified level under the specific version.
     */
    type Of<L extends Level, V extends Version = Version.Recommendation> = {
      [C in Chapter]: L extends Level<C, V> ? C : never;
    }[Chapter];

    /**
     * All criteria of level A.
     *
     * @remarks
     * Note that criteria levels are different from conformance levels! While
     * criteria levels are disjoint, conformance levels stack.
     */
    export type A<V extends Version = Version.Recommendation> = Of<"A", V>;

    /**
     * All criteria of level AA.
     *
     * @remarks
     * Note that criteria levels are different from conformance levels! While
     * criteria levels are disjoint, conformance levels stack.
     */
    export type AA<V extends Version = Version.Recommendation> = Of<"AA", V>;

    /**
     * All criteria of level AAA.
     *
     * @remarks
     * Note that criteria levels are different from conformance levels! While
     * criteria levels are disjoint, conformance levels stack.
     */
    export type AAA<V extends Version = Version.Recommendation> = Of<"AAA", V>;
  }

  export function isCriterion(value: unknown): value is Criterion {
    return value instanceof Criterion;
  }
}
