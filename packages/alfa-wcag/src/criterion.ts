import { Requirement } from "@siteimprove/alfa-act";
import { Branched } from "@siteimprove/alfa-branched";
import { None, Option } from "@siteimprove/alfa-option";

import { Criteria } from "./criterion/data.js";

/**
 * @public
 */
export class Criterion<
  C extends Criterion.Chapter = Criterion.Chapter,
  U extends Criterion.URI<C, "2.1" | "2.2"> = Criterion.URI<C, "2.1" | "2.2">,
> extends Requirement<"criterion", U> {
  public static of<C extends Criterion.Chapter>(chapter: C): Criterion<C> {
    const versions = [...Criteria[chapter].versions];
    // Use the criterion URI from the recommendation, if available, otherwise
    // use the URI from the previous version. This ensures that the most recent identifier
    // is used when available.
    const [, { uri }] =
      versions.find(
        ([version]) => version === Criterion.Version.Recommendation,
      ) ?? versions.find(([version]) => version === Criterion.Version.Old)!;

    return new Criterion(chapter, uri as Criterion.URI<C, "2.1" | "2.2">);
  }

  private readonly _chapter: C;

  protected constructor(chapter: C, uri: U) {
    super("criterion", uri);
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
  public get title(): Criterion.Title<C> {
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
      ]),
    );
  }

  public toJSON(): Criterion.JSON<C, U> {
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

/**
 * @public
 */
export namespace Criterion {
  export interface JSON<
    C extends Criterion.Chapter = Criterion.Chapter,
    U extends Criterion.URI<C, "2.1" | "2.2"> = Criterion.URI<C, "2.1" | "2.2">,
  > extends Requirement.JSON<"criterion", U> {
    chapter: C;
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
   * The title of the specified criterion.
   */
  export type Title<C extends Chapter = Chapter> = Criteria[C]["title"];

  /**
   * The different versions of the WCAG.
   */
  export type Version = "2.0" | "2.1" | "2.2";

  export namespace Version {
    /**
     * The current version of the WCAG Recommendation.
     */
    export const Recommendation = "2.2";

    /**
     * The current version of the WCAG Recommendation.
     */
    export type Recommendation = typeof Recommendation;

    /**
     * The current version of the WCAG Working Draft.
     */
    // export const Draft = "2.2";

    /**
     * The current version of the WCAG Working Draft.
     */
    // export type Draft = typeof Draft;

    /**
     * The Old recommendation.
     */
    export const Old = "2.1";

    /**
     * The old recommendation.
     */
    export type Old = typeof Old;
  }

  /**
   * The URI of the specified criterion.
   */
  export type URI<C extends Chapter = Chapter, V extends Version = Version> =
    Criteria[C]["versions"] extends Iterable<infer T>
      ? T extends readonly [V, { readonly uri: infer U }]
        ? U
        : never
      : never;

  /**
   * The level of the specified criterion under the specified version.
   */
  export type Level<C extends Chapter = Chapter, V extends Version = Version> =
    Criteria[C]["versions"] extends Iterable<infer T>
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

  export function fromURI(uri: string): Option<Criterion> {
    const rewrittenUri = uri
      // Keeping slashes in URL rewritting to ensure proper delimiting of path
      // pieces.
      // rewrite WCAG22 -> WCAG2 since this is how we store it.
      // We should use the shared way of tracking which version is the latest as
      // this will require manual updates.
      .replace("/WCAG22/", "/WCAG2/")
      // rewrite WCAG -> WCAG2 since we only parse the latter.
      .replace("/WCAG/", "/WCAG2/");

    for (const [chapter, value] of Object.entries(Criteria)) {
      for (const version of value.versions) {
        if (version[1].uri === rewrittenUri) {
          return Option.of(Criterion.of(chapter as Chapter));
        }
      }
    }

    return None;
  }
}
